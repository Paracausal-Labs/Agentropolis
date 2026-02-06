// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "@uniswap/v4-core/test/utils/Deployers.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {PoolSwapTest} from "@uniswap/v4-core/src/test/PoolSwapTest.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";

import {CouncilFeeHook} from "../src/CouncilFeeHook.sol";
import {SwapGuardHook} from "../src/SwapGuardHook.sol";
import {SentimentOracleHook} from "../src/SentimentOracleHook.sol";

// ─── Test wrappers that skip address validation during impl deploy ───

contract CouncilFeeHookImpl is CouncilFeeHook {
    constructor(IPoolManager _pm, address _owner) CouncilFeeHook(_pm, _owner) {}
    function validateHookAddress(BaseHook) internal pure override {}
}

contract SwapGuardHookImpl is SwapGuardHook {
    constructor(IPoolManager _pm, address _owner) SwapGuardHook(_pm, _owner) {}
    function validateHookAddress(BaseHook) internal pure override {}
}

contract SentimentOracleHookImpl is SentimentOracleHook {
    constructor(IPoolManager _pm, address _owner) SentimentOracleHook(_pm, _owner) {}
    function validateHookAddress(BaseHook) internal pure override {}
}

// ────────────────────────────── CouncilFeeHook Tests ──────────────────────────────

contract CouncilFeeHookTest is Test, Deployers {
    using StateLibrary for IPoolManager;

    CouncilFeeHook hook;
    address owner;

    function setUp() public {
        owner = address(this);
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        // Compute address with beforeSwap flag
        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG);
        address hookAddr = address(uint160(type(uint160).max & ~uint160(Hooks.ALL_HOOK_MASK) | flags));

        // Deploy impl (no address validation) — poolManager immutable is baked into bytecode
        CouncilFeeHookImpl impl = new CouncilFeeHookImpl(manager, owner);
        vm.etch(hookAddr, address(impl).code);
        hook = CouncilFeeHook(hookAddr);

        // Storage layout (immutables are in bytecode, not storage):
        // slot 0: owner (address, 20 bytes) | currentFeeBps (uint24, 3 bytes) — packed
        // Pack owner + currentFeeBps into slot 0
        vm.store(
            hookAddr,
            bytes32(uint256(0)),
            bytes32(uint256(uint160(owner)) | (uint256(3000) << 160))
        );

        // Initialize pool with dynamic fee
        (key,) = initPoolAndAddLiquidity(
            currency0, currency1, IHooks(hookAddr), LPFeeLibrary.DYNAMIC_FEE_FLAG, SQRT_PRICE_1_1
        );
    }

    function test_defaultFee() public view {
        assertEq(hook.currentFeeBps(), 3000);
    }

    function test_setFee() public {
        hook.setFee(5000);
        assertEq(hook.currentFeeBps(), 5000);
    }

    function test_setFee_emitsEvent() public {
        vm.expectEmit(false, false, false, true);
        emit CouncilFeeHook.FeeUpdated(3000, 500, block.timestamp);
        hook.setFee(500);
    }

    function test_setFee_revertNotOwner() public {
        vm.prank(address(0xdead));
        vm.expectRevert("not owner");
        hook.setFee(500);
    }

    function test_setFee_revertTooHigh() public {
        vm.expectRevert("fee too high");
        hook.setFee(100_001);
    }

    function test_beforeSwap_usesDynamicFee() public {
        hook.setFee(10000);
        PoolSwapTest.TestSettings memory settings =
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false});
        swapRouter.swap(key, SWAP_PARAMS, settings, ZERO_BYTES);
    }

    function test_hookPermissions() public view {
        Hooks.Permissions memory perms = hook.getHookPermissions();
        assertTrue(perms.beforeSwap);
        assertFalse(perms.afterSwap);
        assertFalse(perms.beforeInitialize);
    }
}

// ────────────────────────────── SwapGuardHook Tests ──────────────────────────────

contract SwapGuardHookTest is Test, Deployers {
    SwapGuardHook hook;
    address owner;

    function setUp() public {
        owner = address(this);
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG);
        address hookAddr = address(uint160((type(uint160).max - 1) & ~uint160(Hooks.ALL_HOOK_MASK) | flags));

        SwapGuardHookImpl impl = new SwapGuardHookImpl(manager, owner);
        vm.etch(hookAddr, address(impl).code);
        hook = SwapGuardHook(hookAddr);

        // Storage layout:
        // slot 0: owner (address)
        // slot 1: maxSwapSize (uint256)
        // slot 2: blockedCount (uint256)
        vm.store(hookAddr, bytes32(uint256(0)), bytes32(uint256(uint160(owner))));
        vm.store(hookAddr, bytes32(uint256(1)), bytes32(type(uint256).max));

        (key,) = initPoolAndAddLiquidity(currency0, currency1, IHooks(hookAddr), 3000, SQRT_PRICE_1_1);
    }

    function test_defaultMaxSwapSize() public view {
        assertEq(hook.maxSwapSize(), type(uint256).max);
    }

    function test_setMaxSwapSize() public {
        hook.setMaxSwapSize(1000);
        assertEq(hook.maxSwapSize(), 1000);
    }

    function test_setMaxSwapSize_emitsEvent() public {
        vm.expectEmit(false, false, false, true);
        emit SwapGuardHook.MaxSwapSizeUpdated(type(uint256).max, 500);
        hook.setMaxSwapSize(500);
    }

    function test_setMaxSwapSize_revertNotOwner() public {
        vm.prank(address(0xdead));
        vm.expectRevert("not owner");
        hook.setMaxSwapSize(500);
    }

    function test_smallSwap_passes() public {
        PoolSwapTest.TestSettings memory settings =
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false});
        swapRouter.swap(key, SWAP_PARAMS, settings, ZERO_BYTES);
    }

    function test_largeSwap_reverts() public {
        hook.setMaxSwapSize(10);
        PoolSwapTest.TestSettings memory settings =
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false});
        vm.expectRevert();
        swapRouter.swap(key, SWAP_PARAMS, settings, ZERO_BYTES);
    }

    function test_hookPermissions() public view {
        Hooks.Permissions memory perms = hook.getHookPermissions();
        assertTrue(perms.beforeSwap);
        assertFalse(perms.afterSwap);
    }
}

// ────────────────────────────── SentimentOracleHook Tests ──────────────────────────────

contract SentimentOracleHookTest is Test, Deployers {
    SentimentOracleHook hook;
    address owner;

    function setUp() public {
        owner = address(this);
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        uint160 flags = uint160(Hooks.AFTER_SWAP_FLAG);
        address hookAddr = address(uint160(type(uint160).max & ~uint160(Hooks.ALL_HOOK_MASK) | flags));

        SentimentOracleHookImpl impl = new SentimentOracleHookImpl(manager, owner);
        vm.etch(hookAddr, address(impl).code);
        hook = SentimentOracleHook(hookAddr);

        // Storage layout:
        // slot 0: owner (address)
        // slot 1: sentiment (int8) — packed with sentimentReason offset? No, separate slots.
        //   Actually: int8 sentiment is slot 1, string sentimentReason is slot 2,
        //   uint256 swapCount is slot 3, uint256 lastUpdated is slot 4
        vm.store(hookAddr, bytes32(uint256(0)), bytes32(uint256(uint160(owner))));
        // Leave sentiment/swapCount/lastUpdated at defaults (0)

        (key,) = initPoolAndAddLiquidity(currency0, currency1, IHooks(hookAddr), 3000, SQRT_PRICE_1_1);
    }

    function test_initialSentiment() public view {
        (int8 score, uint256 count, uint256 updated, string memory reason) = hook.getSentiment();
        assertEq(score, 0);
        assertEq(count, 0);
        assertEq(updated, 0);
        assertEq(bytes(reason).length, 0);
    }

    function test_updateSentiment() public {
        hook.updateSentiment(75, "bullish market conditions");
        (int8 score,,, string memory reason) = hook.getSentiment();
        assertEq(score, 75);
        assertEq(keccak256(bytes(reason)), keccak256(bytes("bullish market conditions")));
    }

    function test_updateSentiment_negative() public {
        hook.updateSentiment(-50, "bearish");
        (int8 score,,,) = hook.getSentiment();
        assertEq(score, -50);
    }

    function test_updateSentiment_emitsEvent() public {
        vm.expectEmit(false, false, false, true);
        emit SentimentOracleHook.SentimentUpdated(42, "neutral-positive", block.timestamp);
        hook.updateSentiment(42, "neutral-positive");
    }

    function test_updateSentiment_revertNotOwner() public {
        vm.prank(address(0xdead));
        vm.expectRevert("not owner");
        hook.updateSentiment(50, "test");
    }

    function test_updateSentiment_revertOutOfRange() public {
        vm.expectRevert("score out of range");
        hook.updateSentiment(101, "too high");
    }

    function test_updateSentiment_revertNegativeOutOfRange() public {
        vm.expectRevert("score out of range");
        hook.updateSentiment(-101, "too low");
    }

    function test_afterSwap_incrementsCounter() public {
        assertEq(hook.swapCount(), 0);
        PoolSwapTest.TestSettings memory settings =
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false});
        swapRouter.swap(key, SWAP_PARAMS, settings, ZERO_BYTES);
        assertEq(hook.swapCount(), 1);
    }

    function test_afterSwap_multipleSwaps() public {
        PoolSwapTest.TestSettings memory settings =
            PoolSwapTest.TestSettings({takeClaims: false, settleUsingBurn: false});
        swapRouter.swap(key, SWAP_PARAMS, settings, ZERO_BYTES);
        swapRouter.swap(key, SWAP_PARAMS, settings, ZERO_BYTES);
        swapRouter.swap(key, SWAP_PARAMS, settings, ZERO_BYTES);
        assertEq(hook.swapCount(), 3);
    }

    function test_hookPermissions() public view {
        Hooks.Permissions memory perms = hook.getHookPermissions();
        assertFalse(perms.beforeSwap);
        assertTrue(perms.afterSwap);
    }
}
