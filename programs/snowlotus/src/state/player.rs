use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub owner: Pubkey,
    pub bump: u8,
}
