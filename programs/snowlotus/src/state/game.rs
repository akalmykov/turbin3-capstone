use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub admin: Pubkey,
    pub game_id: u64,
    pub target_price: u64,
    pub bump: u8,
    pub treasury_bump: u8,
}
