use anchor_lang::prelude::*;

use crate::state::Game;
use anchor_spl::token_interface::{Mint, TokenInterface};

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"game", admin.key().as_ref(), game_id.to_le_bytes().as_ref()],
        bump,
        space = 8 + Game::INIT_SPACE,
    )]
    pub game: Account<'info, Game>,

    #[account(
        seeds = [b"treasury", game.key().as_ref()],
        bump,
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> Initialize<'info> {
    pub fn handler(
        &mut self,
        game_id: u64,
        target_price: u64,
        bumps: InitializeBumps,
    ) -> Result<()> {
        msg!("Greetings");
        self.game.set_inner(Game {
            admin: self.admin.key(),
            game_id,
            target_price,
            bump: bumps.game,
            treasury_bump: bumps.treasury,
        });
        Ok(())
    }
}
