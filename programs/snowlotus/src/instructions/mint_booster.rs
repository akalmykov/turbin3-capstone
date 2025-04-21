use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::Game};
use anchor_spl::{
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
        CreateMasterEditionV3, CreateMetadataAccountsV3, MasterEditionAccount, Metadata,
        MetadataAccount, MintNewEditionFromMasterEditionViaToken,
    },
    token::{self, MintTo},
    token_interface::{Mint, TokenInterface},
};

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct MintBooster<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        seeds = [b"game", game_id.to_le_bytes().as_ref()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,
    #[account(
        mut,
        address = game.mint @ ErrorCode::InvalidMint,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        seeds = [b"treasury", game.key().as_ref()],
        bump = game.treasury_bump,
    )]
    pub treasury: SystemAccount<'info>,

    #[account(
        seeds = [b"metadata", metadata_program.key().as_ref(), mint.key().as_ref()],
        bump = game.metadata_bump,
        seeds::program = metadata_program.key(),
    )]
    pub metadata: Account<'info, MetadataAccount>,
    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition",
        ],
        bump,
        seeds::program = metadata_program.key(),
    )]
    pub master_edition: Account<'info, MasterEditionAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintBooster<'info> {
    pub fn handler(&self, game_id: u64, bumps: MintBoosterBumps) -> Result<()> {
        let game_seeds = &[b"game", game_id.to_le_bytes().as_ref(), &[self.game.bump]];
        let signer_seeds = &[&game_seeds[..]];

        // Mint 5 editions
        for edition_number in 0..5 {
            let edition_cpi = CpiContext::new_with_signer(
                self.metadata_program.to_account_info(),
                MintNewEditionFromMasterEditionViaToken {
                    new_metadata: self.new_metadata.to_account_info(),
                    new_edition: self.new_edition.to_account_info(),
                    new_mint: self.new_mint.to_account_info(),
                    metadata: self.metadata.to_account_info(),
                    master_edition: self.master_edition.to_account_info(),
                    mint_authority: self.game.to_account_info(),
                    payer: self.player.to_account_info(),
                    token_account: self.master_edition_ata.to_account_info(),
                    token_program: self.token_program.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                    rent: self.rent.to_account_info(),
                },
                signer_seeds,
            );

            mint_new_edition_from_master_edition_via_token(edition_cpi, edition_number)?;
        }

        Ok(())
    }
}
