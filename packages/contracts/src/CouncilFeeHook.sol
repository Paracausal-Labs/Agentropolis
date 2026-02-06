// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";

/// @title CouncilFeeHook
/// @notice AI council votes on swap fees — beforeSwap reads currentFeeBps and overrides the LP fee dynamically.
contract CouncilFeeHook is BaseHook {
    address public owner;
    uint24 public currentFeeBps = 3000; // default 0.3%

    event FeeUpdated(uint24 oldFee, uint24 newFee, uint256 timestamp);

    constructor(IPoolManager _pm, address _owner) BaseHook(_pm) {
        owner = _owner;
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    /// @notice Council relayer calls this to update the fee based on council consensus
    function setFee(uint24 newFeeBps) external {
        require(msg.sender == owner, "not owner");
        require(newFeeBps <= 100_000, "fee too high"); // max 10%
        uint24 oldFee = currentFeeBps;
        currentFeeBps = newFeeBps;
        emit FeeUpdated(oldFee, newFeeBps, block.timestamp);
    }

    function _beforeSwap(address, PoolKey calldata, SwapParams calldata, bytes calldata)
        internal
        view
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        return (
            this.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            currentFeeBps | LPFeeLibrary.OVERRIDE_FEE_FLAG
        );
    }
}
