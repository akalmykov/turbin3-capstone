use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserReceipt {
    pub user: Pubkey,
}
