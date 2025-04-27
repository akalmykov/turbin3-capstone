#[allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("HZyyQDqNnQXd1coQB111vyg4VLutgshubTEAPYK99n61");

#[program]
pub mod snowlotus {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        game_id: u64,
        target_price: u64,
        randomness_period: u8,
        genesis_time: u64,
        boosters_pack_vrf_callback_fee: u64,
    ) -> Result<()> {
        ctx.accounts.handler(
            game_id,
            target_price,
            randomness_period,
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
    ) -> Result<()> {
        ctx.accounts
            .handler(game_id, player, booster_pack_seq_no, randomness, ctx.bumps)?;
        Ok(())
    }

    pub fn buy_booster(ctx: Context<BuyBooster>, game_id: u64) -> Result<()> {
        ctx.accounts.handler(game_id, ctx.bumps)?;
        Ok(())
    }
}
