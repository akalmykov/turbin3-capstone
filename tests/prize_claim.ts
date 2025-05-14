import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { HashingAlgorithm, MerkleTree } from "./merkle-tree/svm_merkle_tree";

// Generate 100 random addresses and amount
let merkleTreeData = Array.from({ length: 100 }, () => ({
  address: Keypair.generate().publicKey, // Example random address
  amount: Math.floor(Math.random() * 1000), // Example random amount
  isClaimed: false, // Default value for isClaimed
}));

// Create Merkle Tree
let merkleTree = new MerkleTree(HashingAlgorithm.Keccak, 32);

merkleTreeData.forEach((entry) => {
  // Serialize address, amount, and isClaimed in binary format
  const entryBytes = Buffer.concat([
    entry.address.toBuffer(),
    Buffer.from(new Uint8Array(new anchor.BN(entry.amount).toArray("le", 8))),
    Buffer.from([entry.isClaimed ? 1 : 0]),
  ]);
  merkleTree.add_leaf(entryBytes);
});

merkleTree.merklize();

const merkleRoot = Array.from(merkleTree.get_merkle_root());
