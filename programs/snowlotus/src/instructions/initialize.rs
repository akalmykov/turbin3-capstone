use anchor_lang::prelude::*;

use crate::{state::Game, VrfConfig};
use anchor_spl::{
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, mpl_token_metadata::types::DataV2,
        CreateMasterEditionV3, CreateMetadataAccountsV3, MasterEditionAccount, Metadata,
        MetadataAccount,
    },

    token_interface::{Mint, TokenInterface, TokenAccount},
    token::{self, MintTo},
    associated_token::AssociatedToken,
};

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        mint::decimals = 0,
        mint::authority = game,
        mint::freeze_authority = game,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    /// CHECK: Account will be created by create_metadata_accounts_v3
    #[account(
        mut,
        seeds = [b"metadata", metadata_program.key().as_ref(), mint.key().as_ref()],
        bump,
        seeds::program = metadata_program.key(),
    )]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Account will be created by create_master_edition_v3
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
    pub master_edition: UncheckedAccount<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [
            b"game", 
            game_id.to_le_bytes().as_ref(), 
        ],
        bump,
        space = 8 + Game::INIT_SPACE,
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        payer = admin,
        seeds = [b"vrf_config", game.key().as_ref()],   
        bump,
        space = 8 + VrfConfig::INIT_SPACE,
    )]
    pub vrf_config: Account<'info, VrfConfig>,

    #[account(
        seeds = [b"treasury", game.key().as_ref()],
        bump,
    )]
    pub treasury: SystemAccount<'info>,
    #[account(
        seeds = [b"prize_pool", game.key().as_ref()],
        bump,
    )]
    pub prize_pool: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,

    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = game,
    )]
    pub master_edition_ata: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Initialize<'info> {

    pub fn handler(
        &mut self,
        game_id: u64,
        target_price: u64,
        randomness_period: u8,
        genesis_time: u64,
        bumps: InitializeBumps,
    ) -> Result<()> {
        msg!("Greetings");
        self.game.set_inner(Game {
            admin: self.admin.key(),
            game_id,
            target_price,
            bump: bumps.game,
            treasury_bump: bumps.treasury,
            mint: self.mint.key(),
            metadata_bump: bumps.metadata,
            master_edition_bump: bumps.master_edition,
            prize_pool_bump: bumps.prize_pool,
            vrf_config_bump: bumps.vrf_config,
        });
        self.vrf_config.set_inner(VrfConfig {
            randomness_period,
            genesis_time,
            bump: bumps.vrf_config,
        });

        let game_id_bytes = game_id.to_le_bytes();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"game", 
            &game_id_bytes, 
            &[self.game.bump]
        ]];
        // Create metadata first
        let metadata_cpi = CpiContext::new_with_signer(
            self.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: self.metadata.to_account_info(),
                mint: self.mint.to_account_info(),
                mint_authority: self.game.to_account_info(), //self.admin.to_account_info(),
                payer: self.admin.to_account_info(),
                update_authority: self.game.to_account_info(),
                system_program: self.system_program.to_account_info(),
                rent: self.rent.to_account_info(),
            },
            signer_seeds,
        );

        // Base URI that will be modified for each edition
        let base_uri = "https://api.example.com/metadata/";

        create_metadata_accounts_v3(
            metadata_cpi,
            DataV2 {
                name: "Booster NFT".to_string(),
                symbol: "BNFT".to_string(),
                uri: base_uri.to_string(),
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            false,
            false,
            None,
        )?;

        // Mint one token first
        let mint_cpi = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            MintTo {
                mint: self.mint.to_account_info(),
                to: self.master_edition_ata.to_account_info(),
                authority: self.game.to_account_info(),
            },
            signer_seeds,
        );
        token::mint_to(mint_cpi, 1)?;

        // Create master edition
        let master_edition_cpi = CpiContext::new_with_signer(
            self.metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: self.master_edition.to_account_info(),
                mint: self.mint.to_account_info(),
                update_authority: self.game.to_account_info(),
                mint_authority: self.game.to_account_info(),
                metadata: self.metadata.to_account_info(),
                payer: self.admin.to_account_info(),
                token_program: self.token_program.to_account_info(),
                system_program: self.system_program.to_account_info(),
                rent: self.rent.to_account_info(),
            },
            signer_seeds,
        );

        create_master_edition_v3(
            master_edition_cpi,
            Some(0), // Max supply of 0 means unlimited editions
        )?;
        
        Ok(())
    }
}
