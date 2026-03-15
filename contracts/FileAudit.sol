// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FileAudit
 * @notice Minimal contract for anchoring audit log Merkle roots on Polygon.
 *
 * Usage:
 *   - Cloud Function computes Merkle root from a batch of audit log hashes
 *   - Submits root to this contract
 *   - Event emission creates immutable on-chain proof
 *
 * Deploy on Polygon Amoy testnet.
 */
contract FileAudit {
    event LogHashStored(
        bytes32 indexed hash,
        address indexed submitter,
        uint256 timestamp
    );

    /**
     * @notice Store a Merkle root hash on-chain.
     * @param hash The Merkle root of a batch of audit log hashes.
     */
    function storeHash(bytes32 hash) public {
        emit LogHashStored(hash, msg.sender, block.timestamp);
    }
}
