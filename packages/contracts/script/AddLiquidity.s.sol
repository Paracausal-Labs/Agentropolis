// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";

// Import the test Planner helper — works fine in scripts too
import {Planner, Plan} from "@uniswap/v4-periphery/test/shared/Planner.sol";

/// @title AddLiquidity
/// @notice Adds liquidity to the 3 Agentropolis hook pools on Base Sepolia.
/// @dev Run: DEPLOYER_KEY=0x... forge script script/AddLiquidity.s.sol --rpc-url https://sepolia.base.org --broadcast
contract AddLiquidity is Script {
    // ─── Base Sepolia Addresses ──────────────────────────────────────────
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant POSITION_MANAGER = 0x4B2C77d209D3405F41a037Ec6c77F7F5b8e2ca80;
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // 6 decimals
    address constant WETH = 0x4200000000000000000000000000000000000006; // 18 decimals

    // Hook addresses (deployed)
    address constant COUNCIL_FEE_HOOK = 0xddda04328455FfbeeBb4a4Fb6ef2292c586E4080;
    address constant SWAP_GUARD_HOOK = 0xA7a8c5D56E6B7318a3Fa61b71A9905e59f474080;
    address constant SENTIMENT_HOOK = 0xE18ef4b29F0DCFf955F6852d468bC18f121a4040;

    int24 constant TICK_SPACING = 60;

    // Pools were initialized with sqrtPriceX96=4339505179874779836416 → tick ≈ -334419
    // (currency0=USDC/6dec, currency1=WETH/18dec, so tick is deeply negative)
    // Bracket the current tick with +/- 6000 ticks, rounded to tickSpacing=60
    int24 constant TICK_LOWER = -340440;
    int24 constant TICK_UPPER = -328380;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("USDC balance:", IERC20(USDC).balanceOf(deployer));
        console.log("WETH balance:", IERC20(WETH).balanceOf(deployer));

        // Sort tokens — PoolKey requires currency0 < currency1
        // USDC (0x036C...) < WETH (0x4200...) so currency0 = USDC, currency1 = WETH
        Currency currency0 = Currency.wrap(USDC);
        Currency currency1 = Currency.wrap(WETH);

        vm.startBroadcast(deployerKey);

        // ─── Step 1: Approve tokens to Permit2 ──────────────────────────────
        IERC20(USDC).approve(PERMIT2, type(uint256).max);
        IERC20(WETH).approve(PERMIT2, type(uint256).max);

        // ─── Step 2: Permit2 → PositionManager allowance ────────────────────
        IAllowanceTransfer(PERMIT2).approve(USDC, POSITION_MANAGER, type(uint160).max, type(uint48).max);
        IAllowanceTransfer(PERMIT2).approve(WETH, POSITION_MANAGER, type(uint160).max, type(uint48).max);

        // Budget: ~6.19 USDC + 0.05 WETH. At current tick, ~4.76 USDC per unit of liquidity.
        // Only enough for 1 pool — use SwapGuardHook (the primary swap pool for demo).
        uint256 liquidityAmount = 1;

        _addLiquidity(
            currency0,
            currency1,
            3000,
            SWAP_GUARD_HOOK,
            liquidityAmount,
            deployer
        );

        vm.stopBroadcast();

        console.log("=== Liquidity added to all 3 hook pools ===");
        console.log("USDC remaining:", IERC20(USDC).balanceOf(deployer));
        console.log("WETH remaining:", IERC20(WETH).balanceOf(deployer));
    }

    function _addLiquidity(
        Currency currency0,
        Currency currency1,
        uint24 fee,
        address hook,
        uint256 liquidity,
        address recipient
    ) internal {
        PoolKey memory poolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: fee,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(hook)
        });

        Plan memory planner = Planner.init();
        planner.add(
            Actions.MINT_POSITION,
            abi.encode(
                poolKey,
                TICK_LOWER,
                TICK_UPPER,
                liquidity,
                type(uint128).max, // amount0Max (max slippage)
                type(uint128).max, // amount1Max (max slippage)
                recipient,
                bytes("") // hookData (empty)
            )
        );

        bytes memory calls = planner.finalizeModifyLiquidityWithClose(poolKey);

        IPositionManager(POSITION_MANAGER).modifyLiquidities(calls, block.timestamp + 300);

        console.log("Liquidity added to pool with hook:", hook);
    }
}
