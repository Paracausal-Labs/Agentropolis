// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

/// @title SwapGuardHook
/// @notice Risk Sentinel agent sets maxSwapSize — any swap exceeding the threshold is reverted.
contract SwapGuardHook is BaseHook {
    address public owner;
    uint256 public maxSwapSize = type(uint256).max; // no limit by default
    uint256 public blockedCount;

    event SwapBlocked(address indexed sender, int256 amount, uint256 maxAllowed);
    event MaxSwapSizeUpdated(uint256 oldMax, uint256 newMax);

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

    /// @notice Risk Sentinel calls this to update the max swap size
    function setMaxSwapSize(uint256 _max) external {
        require(msg.sender == owner, "not owner");
        uint256 old = maxSwapSize;
        maxSwapSize = _max;
        emit MaxSwapSizeUpdated(old, _max);
    }

    function _beforeSwap(address sender, PoolKey calldata, SwapParams calldata params, bytes calldata)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        uint256 absAmount = params.amountSpecified < 0
            ? uint256(-params.amountSpecified)
            : uint256(params.amountSpecified);

        if (absAmount > maxSwapSize) {
            blockedCount++;
            emit SwapBlocked(sender, params.amountSpecified, maxSwapSize);
            revert("SwapGuard: exceeds max swap size");
        }

        return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
}
