import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export async function getLamportBalance(accountPubKey: PublicKey) {
  const balance = await anchor
    .getProvider()
    .connection.getBalance(accountPubKey);
  console.log(
    `Balance: ${balance} Lamports (${balance / LAMPORTS_PER_SOL} SOL)`
  );
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
