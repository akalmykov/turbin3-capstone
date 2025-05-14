import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Snowlotus } from "../target/types/snowlotus";
import { openBooster } from "./open_booster";
import {
  getLamportBalance,
  airdropSol,
  confirmTransaction,
  scanNewBoosterPacksSinceSlot,
  getRound,
  waitForBlocks,
} from "./test_utils";
import { assert } from "chai";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateClaimMerkleTree } from "./prize_claim";

describe("snowlotus", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.snowlotus as Program<Snowlotus>;

  beforeEach(() => {});

  async function buyBooster(gameId, player, boosterCount = new BN(0)) {
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

    anchor.getProvider().wallet.payer = player;
    const tx = await program.methods
      .buyBooster(gameId)
      .signers([player])
      .accounts({
        signer: player.publicKey,
        boosterPack: boosterPackPDAAddress,
      })
      .rpc();
    await confirmTransaction(tx);
  }

  it("end-to-end", async function () {
    this.timeout(60000);

    try {
      const gameAdmin = anchor.web3.Keypair.generate();
      await airdropSol(gameAdmin.publicKey, 10);
      const defaultTxFee = new BN(10_000);
      const gameId = new BN(1);
      const targetPrice = new BN(LAMPORTS_PER_SOL / 10); // 0.1 SOL
      const priceDecay = new BN(LAMPORTS_PER_SOL / 10_000); // 0.01% price decay per slot
      const randomnessPeriod = 3; // we use drand's 3 sec quickchain
      const drandRoundDelay = new BN(1); // we will wait for 1 round to get the randomness
      const drandGenesisTime = new BN(1692803367);
      const vrfFee = new BN(LAMPORTS_PER_SOL / 200); // 0.05 SOL
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
      const gameStartSlot = new BN(
        (await anchor.getProvider().connection.getSlot()) + 1
      ); // +1 to match exact booster pack price in the next slot
      // const oneWeekSlots = new BN(1_512_000);
      // const gameEndSlot = gameStartSlot.add(new BN(20));
      const gameDuration = new BN(50);
      const gameEndSlot = gameStartSlot.add(gameDuration);
      // console.log("Start slot:", gameStartSlot);

      const tx = await program.methods
        .initialize(
          gameId,
          targetPrice,
          priceDecay,
          gameStartSlot,
          gameEndSlot,
          randomnessPeriod,
          drandRoundDelay,
          drandGenesisTime,
          vrfFee
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
      const gamePDA = await program.account.game.fetch(gamePDAAddress);

      assert.isTrue(gamePDA.admin.equals(gameAdmin.publicKey));
      assert.isTrue(gamePDA.gameId.eq(gameId));
      assert.isTrue(gamePDA.targetPrice.eq(targetPrice));
      assert.isTrue(gamePDA.bump === bump);

      const player = anchor.web3.Keypair.generate();
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
      const [treasuryPDA, treasuryPDABump] =
        await anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("treasury"), gamePDAAddress.toBuffer()],
          program.programId
        );

      const [vrfConfigPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vrf_config"), gamePDAAddress.toBuffer()],
        program.programId
      );

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
      assert.equal(
        await getLamportBalance(treasuryPDA),
        targetPrice.add(vrfFee).sub(defaultTxFee).toNumber()
      );

      const slot = await anchor.getProvider().connection.getSlot();
      const newBoosterPacks = await scanNewBoosterPacksSinceSlot(
        anchor.getProvider().connection,
        program.programId,
        slot - 1 // Look back 1 slot
      );
      assert.equal(newBoosterPacks.length, 1);
      assert.isTrue(newBoosterPacks[0].equals(boosterPackPDAAddress));
      const boosterPack = await program.account.boosterPack.fetch(
        newBoosterPacks[0]
      );
      const playerPDA2 = await program.account.player.fetchNullable(
        playerPDAAddress
      );
      assert.isTrue(playerPDA2.boosterPackCount.eq(new BN(1)));

      const randomnessRound = await getRound(
        boosterPack.randomnessRound.add(drandRoundDelay)
      );
      assert.equal(
        randomnessRound.round,
        boosterPack.randomnessRound.toNumber() + drandRoundDelay.toNumber()
      );
      const randomness = Array.from(
        Buffer.from(randomnessRound.randomness, "hex")
      );
      const cards = openBooster(randomness);
      anchor.getProvider().wallet.payer = gameAdmin;
      const tx3 = await program.methods
        .mintBooster(
          gameId,
          player.publicKey,
          boosterPack.seqNo,
          randomness,
          [
            new BN(1),
            new BN(cards[1].id),
            new BN(cards[2].id),
            new BN(cards[3].id),
            new BN(cards[4].id),
          ],
          new BN(randomnessRound.round)
        )
        .signers([gameAdmin])
        .accounts({
          admin: gameAdmin.publicKey,
          game: gamePDAAddress,
          boosterPack: boosterPackPDAAddress,
        })
        .rpc();

      await confirmTransaction(tx3);
      const openedBoosterPack = await program.account.boosterPack.fetch(
        newBoosterPacks[0]
      );
      for (let i = 1; i < openedBoosterPack.cardIds.length; i++) {
        assert.equal(cards[i].id, openedBoosterPack.cardIds[i]);
      }
      assert.isTrue(openedBoosterPack.isOpen);
      assert.strictEqual(
        Buffer.from(openedBoosterPack.randomness).toString("hex"),
        randomnessRound.randomness
      );

      const targetPlayer = anchor.web3.Keypair.generate();
      await airdropSol(targetPlayer.publicKey, 10);
      await buyBooster(gameId, targetPlayer);

      anchor.getProvider().wallet.payer = player;
      const txPlayCard = await program.methods
        .playCard(
          gameId,
          player.publicKey,
          targetPlayer.publicKey,
          new BN(0),
          0
        )
        .signers([player])
        .accounts({
          signer: player.publicKey,
        })
        .rpc();
      await confirmTransaction(txPlayCard);
      const [targetPlayerPDAAddress, targetPlayerBump] =
        await anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("player"), targetPlayer.publicKey.toBuffer()],
          program.programId
        );
      const targetPlayerPDA = await program.account.player.fetch(
        targetPlayerPDAAddress
      );
      assert.isTrue(targetPlayerPDA.hp.eq(new BN(900)));

      await waitForBlocks(gameDuration.toNumber());
      const { root, proof, index } = generateClaimMerkleTree(
        player.publicKey,
        targetPrice
      );
      anchor.getProvider().wallet.payer = gameAdmin;
      const txFinalize = await program.methods
        .finalize(gameId, root)
        .signers([gameAdmin])
        .accounts({
          admin: gameAdmin.publicKey,
        })
        .rpc();
      await confirmTransaction(txFinalize);
      const finalGamePDA = await program.account.game.fetch(gamePDAAddress);
      assert.deepEqual(finalGamePDA.merkleRoot, root);

      anchor.getProvider().wallet.payer = player;
      const balanceBeforeClaim = await getLamportBalance(player.publicKey);
      const txClaim = await program.methods
        .claim(gameId, targetPrice, proof, new BN(index))
        .signers([player])
        .accounts({
          player: player.publicKey,
        })
        .rpc();
      await confirmTransaction(txClaim);
      const balanceAfterClaim = await getLamportBalance(player.publicKey);
      assert.isTrue(balanceAfterClaim > balanceBeforeClaim);
    } catch (error) {
      console.error("Test failed with error:", error);
      console.error("Stack trace:", error.stack);
      throw error; // Re-throw to fail the test
    }
  });
});
