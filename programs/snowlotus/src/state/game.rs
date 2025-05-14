use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub admin: Pubkey,
    pub game_id: u64,
    pub target_price: u64,
    pub price_decay: u64,
    pub boosters_sold: u64,
    pub game_start_slot: u64,
    pub game_end_slot: u64,
    pub bump: u8,
    pub treasury_bump: u8,
    pub prize_pool_bump: u8,
    pub mint: Pubkey,
    pub merkle_root: [u8; 32],
    pub metadata_bump: u8,
    pub master_edition_bump: u8,
    pub vrf_config_bump: u8,
}

impl Game {
    pub fn is_active(&self, current_slot: u64) -> bool {
        self.game_start_slot <= current_slot && current_slot < self.game_end_slot
    }
}
