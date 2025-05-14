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
    #[msg("Booster has not been opened")]
    BoosterPackIsNotOpened,
    #[msg("Invalid randomness round")]
    InvalidRandomnessRound,
    #[msg("Unsupported card")]
    UnsupportedCard,
    #[msg("Game hasn't started or already finished")]
    GameIsNotActive,
    #[msg("Game hasn't finished")]
    GameIsActive,
    #[msg("Game start slot >= game end slot")]
    StartEndSlotInvalid,
    #[msg("Zero drand generation time")]
    ZeroDrandGenerationTime,
    #[msg("Invalid Merkle Proof")]
    InvalidProof,
    #[msg("Insufficient funds in treasury")]
    InsufficientFunds,
}
