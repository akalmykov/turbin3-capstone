use crate::{
    error::CustomErrorCode,
    state::{BoosterPack, Game, Player, VrfConfig},
    vrf_config,
    vrgda::sqrt_vrgda_price,
};
use anchor_lang::prelude::*;
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct Finalize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
      mut,
      seeds = [b"game", game_id.to_le_bytes().as_ref()],
      bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    pub clock: Sysvar<'info, Clock>,
}

impl<'info> Finalize<'info> {
    pub fn handler(
        &mut self,
        _game_id: u64,
        merkle_root: [u8; 32],
        bumps: FinalizeBumps,
    ) -> Result<()> {
        require!(
            self.admin.key() == self.game.admin,
            CustomErrorCode::InvalidAdmin
        );
        require!(
            self.clock.slot > self.game.game_end_slot,
            CustomErrorCode::GameIsActive
        );
        self.game.merkle_root = merkle_root;
        Ok(())
    }
}
