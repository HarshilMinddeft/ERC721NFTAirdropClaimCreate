// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./NftMerkleDistributor.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract NftMerkleDistributorFactory is ERC721Holder {
    mapping(address => bool) public deployedContracts;
    address[] public deployedContractsList;

    event NftMerkleDistributorDeployed(
        address indexed distributor,
        address indexed creator,
        address indexed token,
        uint256[] tokenIds
    );

    function createMerkleDistributor(
        address token,
        uint256[] memory tokenIds,
        bytes32 merkleRoot
    ) external {
        require(tokenIds.length > 0, "Must provide at least one token ID");
        // require(
        //     !deployedContracts[token],
        //     "MerkleDistributor for this token is already deployed"
        // );
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                IERC721(token).ownerOf(tokenIds[i]) == msg.sender,
                "You must own the token"
            );
            IERC721(token).transferFrom(msg.sender, address(this), tokenIds[i]);
        }

        NftMerkleDistributor newDistributor = new NftMerkleDistributor(
            token,
            tokenIds,
            merkleRoot
        );

        for (uint256 i = 0; i < tokenIds.length; i++) {
            IERC721(token).transferFrom(
                address(this),
                address(newDistributor),
                tokenIds[i]
            );
        }

        deployedContracts[address(newDistributor)] = true;
        deployedContractsList.push(address(newDistributor));
        emit NftMerkleDistributorDeployed(
            address(newDistributor),
            msg.sender,
            token,
            tokenIds
        );
    }

    function claim(
        address[] memory distributors,
        address account,
        uint256[] memory tokenIds,
        bytes32[][] calldata merkleProofs
    ) external {
        require(
            distributors.length == merkleProofs.length,
            "Array length mismatch"
        );
        for (uint256 i = 0; i < distributors.length; i++) {
            address distributor = distributors[i];
            bytes32[] calldata merkleProof = merkleProofs[i];
            require(
                deployedContracts[distributor],
                "Invalid distributor contract"
            );
            NftMerkleDistributor(distributor).claim(
                account,
                tokenIds[i],
                merkleProof
            );
        }
    }

    function getAllDeployedContracts()
        external
        view
        returns (address[] memory)
    {
        return deployedContractsList;
    }
}
