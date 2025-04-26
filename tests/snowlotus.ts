import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Snowlotus } from "../target/types/snowlotus";
import {
  getLamportBalance,
  airdropSol,
  confirmTransaction,
} from "./test_utils";
import { assert } from "chai";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

describe("snowlotus", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.snowlotus as Program<Snowlotus>;

  beforeEach(() => {});

  it("end-to-end", async () => {
    const gameAdmin = anchor.web3.Keypair.generate();
    console.log("Admin key", gameAdmin.publicKey);
    await airdropSol(gameAdmin.publicKey, 10);
    const gameId = new BN(1);
    const targetPrice = new BN(2 * LAMPORTS_PER_SOL);
    const randomnessPeriod = new BN(3);
    const genesisTime = new BN(1692803367);
    const tx = await program.methods
      .initialize(gameId, targetPrice, randomnessPeriod, genesisTime)
      .signers([gameAdmin])
      .accounts({
        admin: gameAdmin.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();
    await confirmTransaction(tx);
    console.log("Your transaction signature", tx);
    // Get the PDA address: b"game", admin.key().as_ref(), game_id.to_le_bytes().as_ref()
    const [gamePDAAddress, bump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("game"), // Replace with your actual seed prefix
          new BN(gameId).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

    const [treasuryPDAAddress, treasuryBump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("treasury"), gamePDAAddress.toBuffer()],
        program.programId
      );

    console.log("PDA address:", gamePDAAddress.toString());
    // Fetch the account data
    const gamePDA = await program.account.game.fetch(gamePDAAddress);
    console.log("Account data:", gamePDA);

    assert.isTrue(gamePDA.admin.equals(gameAdmin.publicKey));
    assert.isTrue(gamePDA.gameId.eq(gameId));
    assert.isTrue(gamePDA.targetPrice.eq(targetPrice));
    assert.isTrue(gamePDA.bump === bump);

    let mint = gamePDA.mint;

    // const player = anchor.web3.Keypair.generate();
    // console.log("Player key", player.publicKey);
    // await airdropSol(player.publicKey, 10);

    // const [metadataAddress] = PublicKey.findProgramAddressSync(
    //   [
    //     Buffer.from("metadata"),
    //     MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    //     mint.toBuffer(),
    //   ],
    //   MPL_TOKEN_METADATA_PROGRAM_ID
    // );

    // const [masterEditionAddress] = PublicKey.findProgramAddressSync(
    //   [
    //     Buffer.from("metadata"),
    //     MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    //     mint.toBuffer(),
    //     Buffer.from("edition"),
    //   ],
    //   MPL_TOKEN_METADATA_PROGRAM_ID
    // );

    // const mintBoosterTx = await program.methods
    //   .mintBooster(gameId)
    //   .accounts({
    //     player: player.publicKey,
    //     // game: gamePDAAddress,
    //     mint: mint,
    //     // treasury: treasuryPDAAddress,
    //     // metadata: metadataAddress,
    //     // masterEdition: masterEditionAddress,
    //     // systemProgram: anchor.web3.SystemProgram.programId,
    //     tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    //     // metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
    //     // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //   })
    //   .signers([player])
    //   .rpc();
    // await confirmTransaction(mintBoosterTx);
  });
});
