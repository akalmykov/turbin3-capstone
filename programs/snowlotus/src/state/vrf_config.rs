use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VrfConfig {
    // Period in seconds
    pub randomness_period: u8,

    // Genesis time as Unix timestamp
    pub genesis_time: u64,

    // Bump for PDA
    pub bump: u8,
}
