use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct BoosterPack {
    pub game_id: u64,
    pub slot: u64,
    pub randomness_round: u64,
    pub timestamp: u64,
    pub owner: Pubkey,
    pub seq_no: u64,
    pub pack_price: u64,
    pub bump: u8,
    pub is_open: bool,
    pub randomness: [u8; 32],
    pub card_ids: [u64; 5],
}
