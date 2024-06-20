// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract NftMerkleDistributor is ERC721Holder {
    address public token;
    bytes32 public merkleRoot;
    uint256[] public tokenIds;
    // mapping(address => bool) private addressesClaimed;
    mapping(uint256 => bool) private tokenClaimed;
    event Claimed(address indexed _from, uint256[] tokenIds);

    constructor(
        address token_,
        uint256[] memory tokenIds_,
        bytes32 merkleRoot_
    ) {
        token = token_;
        tokenIds = tokenIds_;
        merkleRoot = merkleRoot_;
    }

    function claim(
        address account,
        uint256 tokenId,
        bytes32[] calldata merkleProof
    ) external {
        require(
            !tokenClaimed[tokenId],
            "MerkleDistributor: Token already claimed"
        );
        bytes32 leafData = keccak256(abi.encodePacked(account, tokenId));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafData),
            "Invalid proof"
        );
        tokenClaimed[tokenId] = true;
        IERC721(token).safeTransferFrom(address(this), account, tokenId);
        emit Claimed(account, tokenIds);
    }

    //  function sendBackTokens() public {
    //     for (uint256 i = 0; i < tokenIds.length; i++) {
    //         if (!tokenClaimed[tokenIds[i]]) {
    //             IERC721(token).safeTransferFrom(address(this), msg.sender, tokenIds[i]);
    //         }
    //     }
    // }
}
