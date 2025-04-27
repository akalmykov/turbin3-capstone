use crate::{
    error::CustomErrorCode,
    state::{BoosterPack, Game, Player, VrfConfig},
};
use anchor_lang::prelude::*;
#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct BuyBooster<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [b"game", game_id.to_le_bytes().as_ref()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        seeds = [b"treasury", game.key().as_ref()],
        bump = game.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        seeds = [b"player", signer.key().as_ref()],
        bump,
        space = 8 + Player::INIT_SPACE,
    )]
    pub player: Account<'info, Player>,

    #[account(
        init,
        payer = signer,
        seeds = [
          b"booster_pack", 
          game_id.to_le_bytes().as_ref(), 
          signer.key().as_ref(),
          player.booster_pack_count.to_le_bytes().as_ref()],
        bump,
        space = 8 + BoosterPack::INIT_SPACE,
    )]
    pub booster_pack: Account<'info, BoosterPack>,

    #[account(
        seeds = [b"vrf_config", game.key().as_ref()],
        bump = game.vrf_config_bump,
    )]
    pub vrf_config: Account<'info, VrfConfig>,

    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
}

impl<'info> BuyBooster<'info> {
    pub fn round_for_time(
        &self,
        current_time: u64,
        genesis_time: u64,
        period_seconds: u8,
    ) -> Result<u64> {
        if current_time <= genesis_time {
            return Err(CustomErrorCode::RoundBeforeGenesis.into());
        }
        // at genesis, the round == 1, so we add 1
        Ok((current_time - genesis_time) / period_seconds as u64 + 1)
    }

    pub fn handler(&mut self, game_id: u64, bumps: BuyBoosterBumps) -> Result<()> {
        let current_time = self.clock.unix_timestamp as u64;
        let randomness_round = self.round_for_time(
            current_time,
            self.vrf_config.genesis_time,
            self.vrf_config.randomness_period,
        )?;

        let slot = self.clock.slot;

        let booster_pack_count = self.player.booster_pack_count;
        if booster_pack_count == 0 {
          self.player.set_inner(Player {
              owner: self.signer.key(),
              booster_pack_count,
              bump: bumps.player,
          });
        }
  
        self.booster_pack.set_inner(BoosterPack {
            slot,
            randomness_round,
            timestamp: current_time,
            game_id,
            owner: self.signer.key(),
            seq_no: booster_pack_count,
            pack_price: self.game.target_price,
            bump: bumps.booster_pack,
            is_open: false,
            randomness: [0; 32],
        });

        self.player.booster_pack_count += 1;

        Ok(())
    }
}
