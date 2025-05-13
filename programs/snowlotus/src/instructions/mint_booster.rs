use anchor_lang::prelude::*;

use crate::{error::CustomErrorCode, state::Game, BoosterPack, VrfConfig};
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
#[instruction(game_id: u64, player: Pubkey, booster_pack_seq_no: u64)]
pub struct MintBooster<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [b"game", game_id.to_le_bytes().as_ref()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        mut,
        seeds = [
          b"booster_pack", 
          game_id.to_le_bytes().as_ref(), 
          player.key().as_ref(),
          booster_pack_seq_no.to_le_bytes().as_ref()],
        bump,
    )]
    pub booster_pack: Account<'info, BoosterPack>,

    #[account(
        seeds = [b"vrf_config", game.key().as_ref()],
        bump = game.vrf_config_bump,
    )]
    pub vrf_config: Account<'info, VrfConfig>,

    // #[account(
    //     seeds = [b"treasury", game.key().as_ref()],
    //     bump = game.treasury_bump,
    // )]
    // pub treasury: SystemAccount<'info>,


    // #[account(
    //     mut,
    //     address = game.mint @ CustomErrorCode::InvalidMint,
    // )]
    // pub mint: InterfaceAccount<'info, Mint>,

    // #[account(
    //     seeds = [b"metadata", metadata_program.key().as_ref(), mint.key().as_ref()],
    //     bump = game.metadata_bump,
    //     seeds::program = metadata_program.key(),
    // )]
    // pub metadata: Account<'info, MetadataAccount>,
    // #[account(
    //     mut,
    //     seeds = [
    //         b"metadata",
    //         metadata_program.key().as_ref(),
    //         mint.key().as_ref(),
    //         b"edition",
    //     ],
    //     bump,
    //     seeds::program = metadata_program.key(),
    // )]
    // pub master_edition: Account<'info, MasterEditionAccount>,
    pub system_program: Program<'info, System>,
    // pub token_program: Interface<'info, TokenInterface>,
    // pub metadata_program: Program<'info, Metadata>,
    // pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintBooster<'info> {
    pub fn handler(
        &mut self, 
        game_id: u64, 
        player: Pubkey, 
        booster_pack_seq_no: u64, 
        randomness: [u8; 32], 
        card_ids: [u64; 5], 
        randomness_round: u64, 
        bumps: MintBoosterBumps
    ) -> Result<()> {
        require!(
            self.booster_pack.randomness_round + self.vrf_config.drand_round_delay == randomness_round, 
            CustomErrorCode::InvalidRandomnessRound
        );
        require!(self.admin.key() == self.game.admin, CustomErrorCode::InvalidAdmin);        
        require!(!self.booster_pack.is_open, CustomErrorCode::BoosterPackAlreadyOpened);
        self.booster_pack.randomness = randomness;
        self.booster_pack.is_open = true;
        self.booster_pack.card_ids = card_ids;

        Ok(())
    }
}
