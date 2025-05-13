import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { createHash } from "crypto";
import { Buffer } from "buffer";

interface DrandResponse {
  round: number;
  signature: string;
  randomness: string;
}

export async function getLamportBalance(accountPubKey: PublicKey) {
  const balance = await anchor
    .getProvider()
    .connection.getBalance(accountPubKey);
  return balance;
}

export async function airdropSol(publicKey, amount) {
  let airdropTx = await anchor
    .getProvider()
    .connection.requestAirdrop(
      publicKey,
      amount * anchor.web3.LAMPORTS_PER_SOL
    );

  await confirmTransaction(airdropTx);
}

export async function confirmTransaction(tx) {
  const latestBlockHash = await anchor
    .getProvider()
    .connection.getLatestBlockhash();

  await anchor.getProvider().connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: tx,
  });
}

function getDiscriminator(accountName: string): Buffer {
  return createHash("sha256")
    .update(`account:${accountName}`)
    .digest()
    .slice(0, 8);
}

export async function scanNewBoosterPacksSinceSlot(
  connection,
  programId,
  startSlot
) {
  // TODO: look into webhooks in RPC
  const currentSlot = await connection.getSlot("confirmed");
  const slots = [];
  for (let slot = startSlot + 1; slot <= currentSlot; slot++) {
    slots.push(slot);
  }

  const newBoosterPacks = [];
  for (const slot of slots) {
    const block = await connection.getBlock(slot, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if (!block) continue;
    for (const tx of block.transactions) {
      if (!tx.transaction.message.accountKeys.some((k) => k.equals(programId)))
        continue;
      for (const key of tx.transaction.message.accountKeys) {
        const accountInfo = await connection.getAccountInfo(key);
        if (!accountInfo) continue;

        const boosterPackDiscriminator = getDiscriminator("BoosterPack");
        if (accountInfo.data.slice(0, 8).equals(boosterPackDiscriminator)) {
          newBoosterPacks.push(key);
        }
      }
    }
  }
  return newBoosterPacks;
}

export const QUICKNET_CHAIN_HASH =
  "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";

import { Agent } from "undici";

export async function getLatestRandomness(
  timeout = 60000
): Promise<DrandResponse> {
  const response = await fetch(
    `https://drand.cloudflare.com/${QUICKNET_CHAIN_HASH}/public/latest`,
    {
      dispatcher: new Agent({ connectTimeout: timeout }),
    }
  );

  const data = (await response.json()) as DrandResponse;

  return {
    round: data.round,
    signature: data.signature,
    randomness: data.randomness,
  };
}

export async function getRound(round, timeout = 60000): Promise<DrandResponse> {
  const response = await fetch(
    `https://drand.cloudflare.com/${QUICKNET_CHAIN_HASH}/public/${round}`,
    {
      dispatcher: new Agent({ connectTimeout: timeout }),
    }
  );

  const data = (await response.json()) as DrandResponse;

  return {
    round: data.round,
    signature: data.signature,
    randomness: data.randomness,
  };
}
