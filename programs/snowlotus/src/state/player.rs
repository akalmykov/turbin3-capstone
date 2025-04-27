use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub owner: Pubkey,
    pub booster_pack_count: u64,
    pub bump: u8,
}
