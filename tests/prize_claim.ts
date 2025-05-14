import * as anchor from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import {
  HashingAlgorithm,
  MerkleTree,
} from "../js-merkle-tree/svm_merkle_tree";
import { ReservationArrayShouldBeSizeOneError } from "@metaplex-foundation/mpl-token-metadata";

export function generateClaimMerkleTree(address, amount) {
  // Generate 255 random addresses and amount
  let merkleTreeData = Array.from({ length: 255 }, () => ({
    address: Keypair.generate().publicKey, // Example random address
    amount: Math.floor(Math.random() * 1000), // Example random amount
    isClaimed: false, // Default value for isClaimed
  }));
  // Add our test user
  merkleTreeData.push({
    address,
    amount,
    isClaimed: false,
  });

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
  const index = merkleTreeData.findIndex((data) =>
    data.address.equals(address)
  );

  if (index === -1) {
    throw new Error("Address not found in Merkle tree data");
  }

  const proof = merkleTree.merkle_proof_index(index);
  const proofArray = Buffer.from(proof.get_pairing_hashes());

  return {
    root: Array.from(merkleTree.get_merkle_root()),
    proof: proofArray,
    index,
  };
}
