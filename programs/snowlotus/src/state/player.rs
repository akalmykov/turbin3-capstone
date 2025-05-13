use anchor_lang::prelude::*;

use crate::error::CustomErrorCode;

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub owner: Pubkey,
    pub booster_pack_count: u64,
    pub bump: u8,

    pub hp: u64,
}

fn phyiscal_damage(player: &mut Player, target: &mut Player, damage: u64) -> Result<()> {
    if target.hp > damage {
        target.hp -= damage;
    }
    Ok(())
}

pub fn play(card_id: u64, player: &mut Player, target: &mut Player) -> Result<()> {
    match card_id {
        1 => phyiscal_damage(player, target, 100),
        2 => phyiscal_damage(player, target, 150),
        3 => phyiscal_damage(player, target, 200),
        4 => phyiscal_damage(player, target, 250),
        5 => phyiscal_damage(player, target, 300),
        _ => Err(error!(CustomErrorCode::UnsupportedCard)),
    }
}
