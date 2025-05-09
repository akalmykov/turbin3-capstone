use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub admin: Pubkey,
    pub game_id: u64,
    pub target_price: u64,
    pub bump: u8,
    pub treasury_bump: u8,
    pub prize_pool_bump: u8,
    pub mint: Pubkey,
    pub metadata_bump: u8,
    pub master_edition_bump: u8,
    pub vrf_config_bump: u8,
    // Callback fee in lamports
    pub boosters_pack_vrf_callback_fee: u64,
}
