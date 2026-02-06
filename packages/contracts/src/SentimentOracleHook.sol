// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";

/// @title SentimentOracleHook
/// @notice Records the council's latest market sentiment as an on-chain oracle after each swap.
contract SentimentOracleHook is BaseHook {
    address public owner;
    address public pendingOwner;
    int8 public sentiment; // -100 to +100
    string public sentimentReason;
    uint256 public swapCount;
    uint256 public lastUpdated;

    event SentimentUpdated(int8 score, string reason, uint256 timestamp);
    event OwnershipTransferInitiated(address indexed currentOwner, address indexed pendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(IPoolManager _pm, address _owner) BaseHook(_pm) {
        owner = _owner;
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "not owner");
        require(newOwner != address(0), "zero address");
        pendingOwner = newOwner;
        emit OwnershipTransferInitiated(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    /// @notice Council relayer calls this to update sentiment after deliberation
    function updateSentiment(int8 _score, string calldata _reason) external {
        require(msg.sender == owner, "not owner");
        require(_score >= -100 && _score <= 100, "score out of range");
        require(bytes(_reason).length <= 500, "reason too long");
        sentiment = _score;
        sentimentReason = _reason;
        lastUpdated = block.timestamp;
        emit SentimentUpdated(_score, _reason, block.timestamp);
    }

    function _afterSwap(address, PoolKey calldata, SwapParams calldata, BalanceDelta, bytes calldata)
        internal
        override
        returns (bytes4, int128)
    {
        swapCount++;
        return (this.afterSwap.selector, 0);
    }

    /// @notice Read-only oracle interface for external contracts
    function getSentiment() external view returns (int8, uint256, uint256, string memory) {
        return (sentiment, swapCount, lastUpdated, sentimentReason);
    }
}
