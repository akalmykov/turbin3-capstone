use anchor_lang::prelude::*;

#[error_code]
pub enum CustomErrorCode {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Invalid mint account")]
    InvalidMint,
    #[msg("Round before genesis")]
    RoundBeforeGenesis,
    #[msg("Invalid admin")]
    InvalidAdmin,
    #[msg("Invalid player")]
    InvalidPlayer,
    #[msg("Booster pack already opened")]
    BoosterPackAlreadyOpened,
    #[msg("Invalid randomness round")]
    InvalidRandomnessRound,
}
