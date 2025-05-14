#[allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod vrgda;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("HZyyQDqNnQXd1coQB111vyg4VLutgshubTEAPYK99n61");

#[program]
pub mod snowlotus {
    use super::*;

    #[allow(clippy::too_many_arguments)]
    pub fn initialize(
        ctx: Context<Initialize>,
        game_id: u64,
        target_price: u64,
        price_decay: u64,
        game_start_slot: u64,
        game_end_slot: u64,
        drand_generation_time: u8,
        drand_round_delay: u64,
        genesis_time: u64,
        boosters_pack_vrf_callback_fee: u64,
    ) -> Result<()> {
        ctx.accounts.handler(
            game_id,
            target_price,
            price_decay,
            game_start_slot,
            game_end_slot,
            drand_generation_time,
            drand_round_delay,
            genesis_time,
            boosters_pack_vrf_callback_fee,
            ctx.bumps,
        )?;
        Ok(())
    }

    pub fn mint_booster(
        ctx: Context<MintBooster>,
        game_id: u64,
        player: Pubkey,
        booster_pack_seq_no: u64,
        randomness: [u8; 32],
        card_ids: [u64; 5],
        randomness_round: u64,
    ) -> Result<()> {
        ctx.accounts.handler(
            game_id,
            player,
            booster_pack_seq_no,
            randomness,
            card_ids,
            randomness_round,
            ctx.bumps,
        )?;
        Ok(())
    }

    pub fn buy_booster(ctx: Context<BuyBooster>, game_id: u64) -> Result<()> {
        ctx.accounts.handler(game_id, ctx.bumps)?;
        Ok(())
    }

    pub fn play_card(
        ctx: Context<PlayCard>,
        game_id: u64,
        player: Pubkey,
        target: Pubkey,
        booster_pack_seq_no: u64,
        card_seq_no: u8,
    ) -> Result<()> {
        ctx.accounts.handler(card_seq_no, ctx.bumps)?;
        Ok(())
    }

    pub fn finalize(ctx: Context<Finalize>, game_id: u64, merkle_root: [u8; 32]) -> Result<()> {
        ctx.accounts.handler(game_id, merkle_root, ctx.bumps)?;
        Ok(())
    }
}
