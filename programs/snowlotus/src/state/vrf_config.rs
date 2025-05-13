use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VrfConfig {
    // Period in seconds between rounds
    pub drand_generation_time: u8,

    // Randomness chain genesis time as Unix timestamp
    pub genesis_time: u64,

    // Bump for PDA
    pub bump: u8,

    // Callback fee in lamports
    pub boosters_pack_vrf_callback_fee: u64,

    // Drand roundness delay
    pub drand_round_delay: u64,
}
