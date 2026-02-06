// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";

/// @title InitHookPools
/// @notice Initializes pools on Base Sepolia with the deployed hook addresses.
contract InitHookPools is Script {
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;

    // Base Sepolia test tokens — set these via env or update after deploy
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // Base Sepolia USDC
    address constant WETH = 0x4200000000000000000000000000000000000006; // Base Sepolia WETH

    // 1 ETH = ~3000 USDC → sqrtPriceX96 ≈ sqrt(3000) * 2^96 ≈ 4_339_505_179_874_779_836_416
    uint160 constant SQRT_PRICE_3000 = 4_339_505_179_874_779_836_416;

    int24 constant TICK_SPACING = 60;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");

        address councilFeeHook = vm.envAddress("COUNCIL_FEE_HOOK");
        address swapGuardHook = vm.envAddress("SWAP_GUARD_HOOK");
        address sentimentHook = vm.envAddress("SENTIMENT_ORACLE_HOOK");

        // Sort tokens — PoolKey requires currency0 < currency1
        (address token0, address token1) = USDC < WETH ? (USDC, WETH) : (WETH, USDC);
        Currency currency0 = Currency.wrap(token0);
        Currency currency1 = Currency.wrap(token1);

        IPoolManager pm = IPoolManager(POOL_MANAGER);

        vm.startBroadcast(deployerKey);

        // Pool 1: CouncilFeeHook — dynamic fee pool
        {
            PoolKey memory key = PoolKey({
                currency0: currency0,
                currency1: currency1,
                fee: LPFeeLibrary.DYNAMIC_FEE_FLAG,
                tickSpacing: TICK_SPACING,
                hooks: IHooks(councilFeeHook)
            });
            int24 tick = pm.initialize(key, SQRT_PRICE_3000);
            console.log("CouncilFeeHook pool initialized, tick:", tick);
        }

        // Pool 2: SwapGuardHook — standard fee pool with guard
        {
            PoolKey memory key = PoolKey({
                currency0: currency0,
                currency1: currency1,
                fee: 3000,
                tickSpacing: TICK_SPACING,
                hooks: IHooks(swapGuardHook)
            });
            int24 tick = pm.initialize(key, SQRT_PRICE_3000);
            console.log("SwapGuardHook pool initialized, tick:", tick);
        }

        // Pool 3: SentimentOracleHook — standard fee pool with sentiment tracking
        {
            PoolKey memory key = PoolKey({
                currency0: currency0,
                currency1: currency1,
                fee: 3000,
                tickSpacing: TICK_SPACING,
                hooks: IHooks(sentimentHook)
            });
            int24 tick = pm.initialize(key, SQRT_PRICE_3000);
            console.log("SentimentOracleHook pool initialized, tick:", tick);
        }

        vm.stopBroadcast();
    }
}
