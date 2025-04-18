import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Snowlotus } from "../target/types/snowlotus";
import {
  getLamportBalance,
  airdropSol,
  confirmTransaction,
} from "./test_utils";

describe("snowlotus", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.snowlotus as Program<Snowlotus>;

  it("Is initialized!", async () => {
    const gameAdmin = anchor.web3.Keypair.generate();
    await airdropSol(gameAdmin.publicKey, 10);

    const tx = await program.methods
      .initialize(new BN(1), new BN(1))
      .signers([gameAdmin])
      .accounts({
        admin: gameAdmin.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
