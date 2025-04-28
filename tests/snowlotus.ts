import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Snowlotus } from "../target/types/snowlotus";
import {
  getLamportBalance,
  airdropSol,
  confirmTransaction,
  scanNewBoosterPacksSinceSlot,
  getLatestRandomness,
} from "./test_utils";
import { assert } from "chai";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  publicKey,
  sol,
} from "@metaplex-foundation/umi";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { min } from "bn.js";

describe("snowlotus", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.snowlotus as Program<Snowlotus>;

  beforeEach(() => {});

  it("end-to-end", async () => {
    const gameAdmin = anchor.web3.Keypair.generate();
    console.log("Admin key", gameAdmin.publicKey);
    await airdropSol(gameAdmin.publicKey, 10);
    console.log(
      "admin sol balance",
      await getLamportBalance(gameAdmin.publicKey)
    );
    const gameId = new BN(1);
    const targetPrice = new BN(2 * LAMPORTS_PER_SOL);
    const randomnessPeriod = 3;
    const genesisTime = new BN(1692803367);
    anchor.getProvider().wallet.payer = gameAdmin;
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
    const mint = anchor.web3.Keypair.generate();

    const tx = await program.methods
      .initialize(
        gameId,
        targetPrice,
        randomnessPeriod,
        genesisTime,
        new BN(1_000_000)
      )
      .signers([gameAdmin, mint])
      .accounts({
        admin: gameAdmin.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        game: gamePDAAddress,
        treasury: treasuryPDAAddress,
        mint: mint.publicKey,
      })
      .rpc();
    await confirmTransaction(tx);
    console.log("Your transaction signature", tx);

    console.log("PDA address:", gamePDAAddress.toString());
    // Fetch the account data
    const gamePDA = await program.account.game.fetch(gamePDAAddress);
    console.log("Account data:", gamePDA);

    assert.isTrue(gamePDA.admin.equals(gameAdmin.publicKey));
    assert.isTrue(gamePDA.gameId.eq(gameId));
    assert.isTrue(gamePDA.targetPrice.eq(targetPrice));
    assert.isTrue(gamePDA.bump === bump);

    // mint cNFTs

    const rpcUrl = anchor.getProvider().connection.rpcEndpoint;
    console.log("RPC URL:", rpcUrl);
    const umi = createUmi(rpcUrl).use(mplBubblegum());

    const umiAdmin = createSignerFromKeypair(umi, {
      publicKey: publicKey(gameAdmin.publicKey),
      secretKey: gameAdmin.secretKey,
    });
    umi.use(keypairIdentity(umiAdmin));

    // Make gameAdmin the payer

    // Instead of using gameAdmin, generate a fresh signer for the tree
    const merkleTree = generateSigner(umi);
    console.log("Merkle tree public key:", merkleTree.publicKey.toString());
    console.log(
      "umi admin sol balance",
      await umi.rpc.getBalance(umiAdmin.publicKey)
    );
    await umi.rpc.airdrop(umiAdmin.publicKey, sol(2));
    console.log(
      "umi admin sol balance",
      await umi.rpc.getBalance(umiAdmin.publicKey)
    );

    const builder = await createTree(umi, {
      merkleTree,
      maxDepth: 14,
      maxBufferSize: 64,
    });

    await builder.sendAndConfirm(umi);

    const player = anchor.web3.Keypair.generate();
    console.log("Player key", player.publicKey);
    await airdropSol(player.publicKey, 10);
    const [playerPDAAddress, playerBump] =
      await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("player"), player.publicKey.toBuffer()],
        program.programId
      );

    const playerPDA = await program.account.player.fetchNullable(
      playerPDAAddress
    );
    let boosterCount = new BN(0);
    if (playerPDA) {
      boosterCount = playerPDA.boosterPackCount;
    }
    console.log("boosterCount", boosterCount);
    const [boosterPackPDAAddress, boosterPackBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("booster_pack"),
          gameId.toArrayLike(Buffer, "le", 8),
          player.publicKey.toBuffer(),
          boosterCount.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
    const [treasuryPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), gamePDAAddress.toBuffer()],
      program.programId
    );

    const [vrfConfigPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vrf_config"), gamePDAAddress.toBuffer()],
      program.programId
    );
    const latestRandomness = await getLatestRandomness();
    console.log("Latest randomness:", latestRandomness);
    anchor.getProvider().wallet.payer = player;
    const tx2 = await program.methods
      .buyBooster(gameId)
      .signers([player])
      .accounts({
        signer: player.publicKey,
        boosterPack: boosterPackPDAAddress,
      })
      .rpc();
    await confirmTransaction(tx2);
    const slot = await anchor.getProvider().connection.getSlot();
    const newBoosterPacks = await scanNewBoosterPacksSinceSlot(
      anchor.getProvider().connection,
      program.programId,
      slot - 1 // Look back 1 slot
    );
    console.log("New booster packs found:", newBoosterPacks);
    assert.equal(newBoosterPacks.length, 1);
    assert.isTrue(newBoosterPacks[0].equals(boosterPackPDAAddress));
    const boosterPack = await program.account.boosterPack.fetch(
      newBoosterPacks[0]
    );
    console.log("Transaction sent!", tx2);
    const playerPDA2 = await program.account.player.fetchNullable(
      playerPDAAddress
    );
    assert.isTrue(playerPDA2.boosterPackCount.eq(new BN(1)));
    console.log("Booster pack:", boosterPack);
    console.log("randomnessRound:", boosterPack.randomnessRound.toString());
    assert.isBelow(
      latestRandomness.round,
      boosterPack.randomnessRound.toNumber() + 1
    );
    const randomness = Buffer.from(latestRandomness.randomness, "hex");

    anchor.getProvider().wallet.payer = gameAdmin;
    const tx3 = await program.methods
      .mintBooster(
        gameId,
        player.publicKey,
        boosterPack.seqNo,
        randomness,
        new BN(latestRandomness.round)
      )
      .signers([gameAdmin])
      .accounts({
        admin: gameAdmin.publicKey,
        game: gamePDAAddress,
        boosterPack: boosterPackPDAAddress,
      })
      .rpc();

    console.log("boosterPack", boosterPackPDAAddress);
    await confirmTransaction(tx3);
    const openedBoosterPack = await program.account.boosterPack.fetch(
      newBoosterPacks[0]
    );
    console.log(
      "Opened booster pack:",
      openedBoosterPack.randomness.toString("hex")
    );
    assert.isTrue(openedBoosterPack.isOpen);
    assert.strictEqual(
      Buffer.from(openedBoosterPack.randomness).toString("hex"),
      latestRandomness.randomness
    );

    /// mint 5 random cards to player
  });
});
