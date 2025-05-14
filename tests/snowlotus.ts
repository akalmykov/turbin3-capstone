import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Snowlotus } from "../target/types/snowlotus";
import { openBooster } from "./open_booster";
import {
  getLamportBalance,
  airdropSol,
  confirmTransaction,
  scanNewBoosterPacksSinceSlot,
  getLatestRandomness,
  getRound,
} from "./test_utils";
import { assert } from "chai";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  none,
  publicKey,
  sol,
} from "@metaplex-foundation/umi";
import {
  createTree,
  fetchTreeConfigFromSeeds,
  findLeafAssetIdPda,
  LeafSchema,
  mintV1,
  parseLeafFromMintV1Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { min } from "bn.js";
import { createSplAssociatedTokenProgram } from "@metaplex-foundation/mpl-toolbox";

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
      // console.log("Admin key", gameAdmin.publicKey);
      await airdropSol(gameAdmin.publicKey, 10);
      // console.log(
      //   "admin sol balance",
      //   await getLamportBalance(gameAdmin.publicKey)
      // );
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
      const oneWeekSlots = new BN(1_512_000);
      const gameEndSlot = gameStartSlot.add(oneWeekSlots);
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
      // console.log("Your transaction signature", tx);

      // console.log("PDA address:", gamePDAAddress.toString());
      // Fetch the account data
      const gamePDA = await program.account.game.fetch(gamePDAAddress);
      // console.log("Account data:", gamePDA);

      assert.isTrue(gamePDA.admin.equals(gameAdmin.publicKey));
      assert.isTrue(gamePDA.gameId.eq(gameId));
      assert.isTrue(gamePDA.targetPrice.eq(targetPrice));
      assert.isTrue(gamePDA.bump === bump);

      // // mint cNFTs
      // const rpcUrl = anchor.getProvider().connection.rpcEndpoint;
      // console.log("RPC URL:", rpcUrl);
      // const umi = createUmi(rpcUrl).use(mplBubblegum()).use(mplTokenMetadata());
      // umi.programs.add(createSplAssociatedTokenProgram());

      // const umiAdmin = createSignerFromKeypair(umi, {
      //   publicKey: publicKey(gameAdmin.publicKey),
      //   secretKey: gameAdmin.secretKey,
      // });
      // umi.use(keypairIdentity(umiAdmin));

      // const merkleTree = generateSigner(umi);
      // console.log("Merkle tree public key:", merkleTree.publicKey.toString());
      // console.log(
      //   "umi admin sol balance",
      //   await umi.rpc.getBalance(umiAdmin.publicKey)
      // );
      // await umi.rpc.airdrop(umiAdmin.publicKey, sol(2));
      // console.log(
      //   "umi admin sol balance",
      //   await umi.rpc.getBalance(umiAdmin.publicKey)
      // );

      // const builder = await createTree(umi, {
      //   merkleTree,
      //   maxDepth: 14,
      //   maxBufferSize: 64,
      // });

      // await builder.sendAndConfirm(umi);
      // const treeConfig = await fetchTreeConfigFromSeeds(umi, { merkleTree });
      // console.log("treeConfig", treeConfig);

      const player = anchor.web3.Keypair.generate();
      // console.log("Player key", player.publicKey);
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
      // console.log("boosterCount", boosterCount);
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

      // const latestRandomness = await getLatestRandomness();
      // console.log("Latest randomness:", latestRandomness);
      anchor.getProvider().wallet.payer = player;
      // console.log(
      //   "treasury balance before purchase",
      //   await getLamportBalance(treasuryPDA)
      // );
      const tx2 = await program.methods
        .buyBooster(gameId)
        .signers([player])
        .accounts({
          signer: player.publicKey,
          boosterPack: boosterPackPDAAddress,
        })
        .rpc();
      await confirmTransaction(tx2);
      // console.log(
      //   "treasury balance after purchase",
      //   (await getLamportBalance(treasuryPDA)) / LAMPORTS_PER_SOL
      // );
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
      // console.log("New booster packs found:", newBoosterPacks);
      assert.equal(newBoosterPacks.length, 1);
      assert.isTrue(newBoosterPacks[0].equals(boosterPackPDAAddress));
      const boosterPack = await program.account.boosterPack.fetch(
        newBoosterPacks[0]
      );
      // console.log("Transaction sent!", tx2);
      const playerPDA2 = await program.account.player.fetchNullable(
        playerPDAAddress
      );
      assert.isTrue(playerPDA2.boosterPackCount.eq(new BN(1)));
      // console.log("Booster pack:", boosterPack);

      const randomnessRound = await getRound(
        boosterPack.randomnessRound.add(drandRoundDelay)
      );
      // console.log("randomnessRound", randomnessRound);
      // console.log(
      //  "boosterPack.randomnessRound.toString():",
      //  boosterPack.randomnessRound.toString()
      //);
      assert.equal(
        randomnessRound.round,
        boosterPack.randomnessRound.toNumber() + drandRoundDelay.toNumber()
      );
      const randomness = Array.from(
        Buffer.from(randomnessRound.randomness, "hex")
      );
      const cards = openBooster(randomness);
      console.log("cards", cards);
      anchor.getProvider().wallet.payer = gameAdmin;
      const tx3 = await program.methods
        .mintBooster(
          gameId,
          player.publicKey,
          boosterPack.seqNo,
          randomness,
          // cards.map((c) => new BN(c.id)),
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

      // console.log("boosterPack", boosterPackPDAAddress);
      await confirmTransaction(tx3);
      const openedBoosterPack = await program.account.boosterPack.fetch(
        newBoosterPacks[0]
      );
      for (let i = 1; i < openedBoosterPack.cardIds.length; i++) {
        assert.equal(cards[i].id, openedBoosterPack.cardIds[i]);
      }
      // console.log(
      //   "Opened booster pack:",
      //   openedBoosterPack.randomness.toString("hex")
      // );
      assert.isTrue(openedBoosterPack.isOpen);
      assert.strictEqual(
        Buffer.from(openedBoosterPack.randomness).toString("hex"),
        randomnessRound.randomness
      );
      console.log("boosterPackPDAAddress", boosterPackPDAAddress);

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

      // const { signature } = await mintV1(umi, {
      //   leafOwner: publicKey(player.publicKey),
      //   merkleTree: merkleTree.publicKey,
      //   metadata: {
      //     name: "My Compressed NFT",
      //     uri: "https://example.com/my-cnft.json",
      //     sellerFeeBasisPoints: 500, // 5%
      //     collection: none(),
      //     creators: [
      //       { address: umi.identity.publicKey, verified: false, share: 100 },
      //     ],
      //   },
      // }).sendAndConfirm(umi);
      // const leaf: LeafSchema = await parseLeafFromMintV1Transaction(
      //   umi,
      //   signature
      // );
      // console.log("leaf", leaf);
      // const assetId = findLeafAssetIdPda(umi, {
      //   merkleTree: merkleTree.publicKey,
      //   leafIndex: leaf.nonce,
      // });
      // console.log("assetId", assetId);
      // const rpcAssetProof = await umi.rpc.getAssetProof(publicKey(assetId));
      // console.log(rpcAssetProof);

      /// mint 5 random cards to player
    } catch (error) {
      console.error("Test failed with error:", error);
      console.error("Stack trace:", error.stack);
      throw error; // Re-throw to fail the test
    }
  });
});
