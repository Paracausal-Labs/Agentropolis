// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";
import {CouncilFeeHook} from "../src/CouncilFeeHook.sol";
import {SwapGuardHook} from "../src/SwapGuardHook.sol";
import {SentimentOracleHook} from "../src/SentimentOracleHook.sol";

/// @title DeployHooks
/// @notice Deploys all 3 Agentropolis V4 hooks via CREATE2 with mined salts to Base Sepolia.
contract DeployHooks is Script {
    // Base Sepolia PoolManager (Uniswap V4)
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    // CREATE2 Deployer Proxy used by forge script
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deployer:", deployer);
        console.log("PoolManager:", POOL_MANAGER);

        vm.startBroadcast(deployerKey);

        _deployCouncilFee(deployer);
        _deploySwapGuard(deployer);
        _deploySentiment(deployer);

        vm.stopBroadcast();
    }

    function _deployCouncilFee(address deployer) internal {
        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG);
        (address hookAddr, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER, flags,
            type(CouncilFeeHook).creationCode,
            abi.encode(POOL_MANAGER, deployer)
        );
        CouncilFeeHook hook = new CouncilFeeHook{salt: salt}(
            IPoolManager(POOL_MANAGER), deployer
        );
        require(address(hook) == hookAddr, "CouncilFeeHook: address mismatch");
        console.log("CouncilFeeHook deployed:", address(hook));
    }

    function _deploySwapGuard(address deployer) internal {
        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG);
        (address hookAddr, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER, flags,
            type(SwapGuardHook).creationCode,
            abi.encode(POOL_MANAGER, deployer)
        );
        SwapGuardHook hook = new SwapGuardHook{salt: salt}(
            IPoolManager(POOL_MANAGER), deployer
        );
        require(address(hook) == hookAddr, "SwapGuardHook: address mismatch");
        console.log("SwapGuardHook deployed:", address(hook));
    }

    function _deploySentiment(address deployer) internal {
        uint160 flags = uint160(Hooks.AFTER_SWAP_FLAG);
        (address hookAddr, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER, flags,
            type(SentimentOracleHook).creationCode,
            abi.encode(POOL_MANAGER, deployer)
        );
        SentimentOracleHook hook = new SentimentOracleHook{salt: salt}(
            IPoolManager(POOL_MANAGER), deployer
        );
        require(address(hook) == hookAddr, "SentimentOracleHook: address mismatch");
        console.log("SentimentOracleHook deployed:", address(hook));
    }
}
