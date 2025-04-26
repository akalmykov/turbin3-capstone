use anchor_lang::prelude::*;

#[error_code]
pub enum CustomErrorCode {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Invalid mint account")]
    InvalidMint,
    #[msg("Round before genesis")]
    RoundBeforeGenesis,
}
