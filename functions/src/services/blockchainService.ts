import * as admin from "firebase-admin";
import { ethers } from "ethers";
import { computeMerkleRoot } from "../utils/merkle";

const db = admin.firestore();

// Minimal ABI for the FileAudit contract
const FILE_AUDIT_ABI = [
  "function storeHash(bytes32 hash) public",
  "event LogHashStored(bytes32 hash)",
];

/**
 * Batch audit logs, compute Merkle root, and anchor on Polygon testnet.
 *
 * Process:
 * 1. Fetch unanchored audit logs (up to batchSize)
 * 2. Compute Merkle root from their hashes
 * 3. Submit root hash to Polygon smart contract
 * 4. Store anchor metadata in blockchain_anchors collection
 *
 * Requires environment config:
 * - POLYGON_RPC_URL: Polygon testnet RPC endpoint
 * - POLYGON_PRIVATE_KEY: Wallet private key for signing
 * - CONTRACT_ADDRESS: Deployed FileAudit contract address
 */
export async function anchorAuditLogs(batchSize = 100): Promise<{
  anchored: boolean;
  batchId?: string;
  txHash?: string;
  logsProcessed?: number;
}> {
  // Get environment config
  const rpcUrl = process.env.POLYGON_RPC_URL;
  const privateKey = process.env.POLYGON_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    console.warn(
      "Blockchain config not set. Skipping anchor. Set POLYGON_RPC_URL, POLYGON_PRIVATE_KEY, CONTRACT_ADDRESS."
    );
    return { anchored: false };
  }

  // Fetch unanchored audit logs
  const logsSnapshot = await db
    .collection("audit_logs")
    .where("anchored", "==", false)
    .orderBy("timestamp", "asc")
    .limit(batchSize)
    .get();

  if (logsSnapshot.empty) {
    return { anchored: false, logsProcessed: 0 };
  }

  const logDocs = logsSnapshot.docs;
  const hashes = logDocs.map((doc) => doc.data().currentHash as string);
  const merkleRoot = computeMerkleRoot(hashes);

  // Submit to blockchain
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, FILE_AUDIT_ABI, wallet);

  const merkleRootBytes = ethers.zeroPadValue(
    ethers.toBeHex(BigInt("0x" + merkleRoot)),
    32
  );
  const tx = await contract.storeHash(merkleRootBytes);
  const receipt = await tx.wait();

  // Store anchor metadata
  const anchorRef = db.collection("blockchain_anchors").doc();
  const anchorData = {
    batchId: anchorRef.id,
    startLogId: logDocs[0].id,
    endLogId: logDocs[logDocs.length - 1].id,
    merkleRoot,
    txHash: receipt.hash,
    timestamp: new Date().toISOString(),
    network: "polygon-amoy",
    logsCount: logDocs.length,
  };

  await anchorRef.set(anchorData);

  // Mark all logs as anchored
  const batch = db.batch();
  for (const doc of logDocs) {
    batch.update(doc.ref, { anchored: true, anchorBatchId: anchorRef.id });
  }
  await batch.commit();

  return {
    anchored: true,
    batchId: anchorRef.id,
    txHash: receipt.hash,
    logsProcessed: logDocs.length,
  };
}
