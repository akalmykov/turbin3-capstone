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
    ) -> Result<()> {
        ctx.accounts.handler(
            game_id,
            target_price,
            randomness_period,
            genesis_time,
            ctx.bumps,
        )?;
        Ok(())
    }

    pub fn mint_booster(ctx: Context<MintBooster>, game_id: u64) -> Result<()> {
        ctx.accounts.handler(game_id, ctx.bumps)?;
        Ok(())
    }
}
