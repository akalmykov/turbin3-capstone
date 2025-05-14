use crate::{error::CustomErrorCode, state::Game, state::UserReceipt};
use anchor_lang::prelude::*;
use svm_merkle_tree::{HashingAlgorithm, MerkleProof};

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct Claim<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
      mut,
      seeds = [b"game", game_id.to_le_bytes().as_ref()],
      bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
      mut,
      seeds = [b"treasury", game.key().as_ref()],
      bump = game.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>,

    #[account(
      init,
      payer = player,
      seeds = [b"user_receipt".as_ref(), player.key().to_bytes().as_ref()],
      bump,
      space = 8 + UserReceipt::INIT_SPACE
    )]
    pub user_receipt: Account<'info, UserReceipt>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info, Clock>,
}

impl<'info> Claim<'info> {
    pub fn handler(
        &mut self,
        _game_id: u64,
        amount: u64,
        hashes: Vec<u8>,
        index: u64,
        bumps: ClaimBumps,
    ) -> Result<()> {
        let mut original_leaf = Vec::new();
        original_leaf.extend_from_slice(&self.player.key().to_bytes());
        original_leaf.extend_from_slice(&amount.to_le_bytes());
        original_leaf.push(0u8); // isClaimed = false

        let merkle_proof =
            MerkleProof::new(HashingAlgorithm::Keccak, 32, index as u32, hashes.clone());

        let computed_root = merkle_proof
            .merklize(&original_leaf)
            .map_err(|_| CustomErrorCode::InvalidProof)?;

        require!(
            computed_root.eq(&self.game.merkle_root),
            CustomErrorCode::InvalidProof
        );

        let accounts = anchor_lang::system_program::Transfer {
            from: self.treasury.to_account_info(),
            to: self.player.to_account_info(),
        };

        let seeds = &[
            b"treasury",
            self.game.to_account_info().key.as_ref(),
            &[self.game.treasury_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            accounts,
            signer_seeds,
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;
        Ok(())
    }
}
