
use crate::{
  error::CustomErrorCode, play, state::{BoosterPack, Game, Player}
};
use anchor_lang::prelude::*;
#[derive(Accounts)]
#[instruction(game_id: u64, player: Pubkey, target: Pubkey, booster_pack_seq_no: u64)]
pub struct PlayCard<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
      seeds = [b"game", game_id.to_le_bytes().as_ref()],
      bump = game.bump,
  )]
  pub game: Account<'info, Game>,

  #[account(
      mut,
      seeds = [b"treasury", game.key().as_ref()],
      bump = game.treasury_bump,
  )]
  pub treasury: SystemAccount<'info>,

  #[account(
      mut,
      seeds = [b"player", signer.key().as_ref()],
      bump = player.bump,
  )]
  pub player: Account<'info, Player>,


  #[account(
    mut,
    seeds = [b"player", target.key().as_ref()],
    bump = target_player.bump,
  )]
  pub target_player: Account<'info, Player>,

  #[account(
      mut,
      seeds = [
        b"booster_pack", 
        game_id.to_le_bytes().as_ref(), 
        signer.key().as_ref(),
        booster_pack_seq_no.to_le_bytes().as_ref()],
      bump,
  )]
  pub booster_pack: Account<'info, BoosterPack>,

  pub clock: Sysvar<'info, Clock>,
  pub system_program: Program<'info, System>,
}

impl<'info> PlayCard<'info> {
  pub fn handler(&mut self, card_seq_no: u8, bumps: PlayCardBumps) -> Result<()> {
    require!(self.game.is_active(self.clock.slot), CustomErrorCode::GameIsNotActive);
    require!(self.signer.key() == self.player.owner, CustomErrorCode::InvalidPlayer);        
    require!(self.booster_pack.is_open, CustomErrorCode::BoosterPackIsNotOpened);
    play(self.booster_pack.card_ids[card_seq_no as usize], &mut self.player, &mut self.target_player)?;
    Ok(())
  }

}