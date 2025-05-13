interface Card {
  id: number,
  name: string;
  rarity: number;
  description: string;
}

export const cards: (Card & { id: number })[] = [
  // Physical Damage Cards
  {
    id: 1,
    name: "Brutal Slash",
    rarity: 5,
    description: "Deal 100 physical damage.",
  },
  {
    id: 2,
    name: "Cleaving Blow",
    rarity: 10,
    description: "Deal 150 physical damage.",
  },
  {
    id: 3,
    name: "Heavy Smash",
    rarity: 15,
    description: "Deal 200 physical damage.",
  },
  {
    id: 4,
    name: "Death Chop",
    rarity: 22,
    description: "Deal 250 physical damage.",
  },
  {
    id: 5,
    name: "Bone Breaker",
    rarity: 30,
    description: "Deal 300 physical damage.",
  },
  {
    id: 6,
    name: "Executioner's Mark",
    rarity: 40,
    description: "Deal 400 physical damage.",
  },
  {
    id: 7,
    name: "Titan's Wrath",
    rarity: 50,
    description: "Deal 500 physical damage.",
  },
  {
    id: 8,
    name: "Godsplitter",
    rarity: 70,
    description: "Deal 750 physical damage.",
  },
  {
    id: 9,
    name: "Planet Cleaver",
    rarity: 90,
    description: "Deal 1000 physical damage.",
  },

  // Magic Damage Cards
  {
    id: 10,
    name: "Arcane Bolt",
    rarity: 5,
    description: "Deal 100 magic damage.",
  },
  {
    id: 11,
    name: "Fire Surge",
    rarity: 10,
    description: "Deal 150 magic damage.",
  },
  {
    id: 12,
    name: "Lightning Pulse",
    rarity: 15,
    description: "Deal 200 magic damage.",
  },
  {
    id: 13,
    name: "Frost Spike",
    rarity: 20,
    description: "Deal 250 magic damage.",
  },
  {
    id: 14,
    name: "Void Ray",
    rarity: 25,
    description: "Deal 300 magic damage.",
  },
  {
    id: 15,
    name: "Astral Lance",
    rarity: 35,
    description: "Deal 400 magic damage.",
  },
  {
    id: 16,
    name: "Mana Implosion",
    rarity: 45,
    description: "Deal 500 magic damage.",
  },

  // Advanced Attack Cards
  {
    id: 17,
    name: "Celestial Sever",
    rarity: 65,
    description:
      "Deal 600 physical damage. Restore mana equal to 15% of damage dealt.",
  },
  {
    id: 18,
    name: "Abyssal Sunder",
    rarity: 80,
    description:
      "Deal 800 physical damage. If the target has a mana shield active, deal 50% bonus damage.",
  },
  {
    id: 19,
    name: "Reaper's Toll",
    rarity: 60,
    description:
      "Deal 450 physical damage. If this the damage dealt is more than 400, deal an additional 100 true damage.",
  },
  {
    id: 20,
    name: "Blood Pact",
    rarity: 50,
    description:
      "Deal 400 physical damage. Lose HP equal to 10% of damage dealt, but restore mana equal to 20% of damage dealt.",
  },
  {
    id: 21,
    name: "Echoing Annihilation",
    rarity: 75,
    description:
      "Deal 700 physical damage. If the target has damage reflection, this attack is not reflected.",
  },
  {
    id: 22,
    name: "Necrotic Beam",
    rarity: 25,
    description:
      "Deal 170 magic damage. Restore HP equal to 25% of damage dealt.",
  },
  {
    id: 23,
    name: "Twin Strike",
    rarity: 15,
    description: "Deal 80 physical and 80 magic damage.",
  },
  {
    id: 24,
    name: "Echoing Strike",
    rarity: 20,
    description: "Deal 200 physical damage to the target and yourself.",
  },
  {
    id: 25,
    name: "Echoing Charge",
    rarity: 20,
    description: "Deal 200 magical damage to the target and yourself.",
  },
  {
    id: 26,
    name: "Last Reserve",
    rarity: 25,
    description:
      "Deal 200 magic damage. If your MP is below 50, this costs 0 MP and deals +50 damage.",
  },

  // Health Restoration Cards
  { id: 27, name: "Minor Bandage", rarity: 3, description: "Restore 50 HP." },
  { id: 28, name: "Vital Herb", rarity: 6, description: "Restore 100 HP." },
  {
    id: 29,
    name: "Healing Potion",
    rarity: 12,
    description: "Restore 200 HP.",
  },
  { id: 30, name: "Major Remedy", rarity: 20, description: "Restore 300 HP." },
  { id: 31, name: "Blessed Salve", rarity: 35, description: "Restore 500 HP." },
  {
    id: 32,
    name: "Divine Renewal",
    rarity: 60,
    description: "Restore 1000 HP.",
  },

  // Mana Restoration Cards
  { id: 33, name: "Mana Drip", rarity: 3, description: "Restore 25 MP." },
  { id: 34, name: "Focus Crystal", rarity: 6, description: "Restore 50 MP." },
  { id: 35, name: "Mana Flask", rarity: 12, description: "Restore 100 MP." },
  { id: 36, name: "Ether Bloom", rarity: 20, description: "Restore 200 MP." },
  {
    id: 37,
    name: "Grand Mindroot",
    rarity: 35,
    description: "Restore 350 MP.",
  },
  { id: 38, name: "Arcane Surge", rarity: 60, description: "Restore 500 MP." },
  {
    id: 39,
    name: "Infinite Spark",
    rarity: 85,
    description: "Restore 1000 MP.",
  },

  // Enablers
  {
    id: 40,
    name: "Reflect Spark",
    rarity: 45,
    description: "Enable Damage Reflection.",
  },
  {
    id: 41,
    name: "Blood Rush",
    rarity: 45,
    description: "Enable Double Damage.",
  },
  {
    id: 42,
    name: "Leech Fang",
    rarity: 30,
    description: "Enable Physical Lifesteal.",
  },
  {
    id: 43,
    name: "Drain Fang",
    rarity: 28,
    description: "Enable Physical Manasteal.",
  },
  {
    id: 44,
    name: "Arcane Leech",
    rarity: 32,
    description: "Enable Arcane Lifesteal.",
  },
  {
    id: 45,
    name: "Arcane Siphon",
    rarity: 40,
    description: "Enable Arcane Manasteal.",
  },
  {
    id: 46,
    name: "Martyr's Pact",
    rarity: 45,
    description: "Enable Mana Martyr.",
  },
  {
    id: 47,
    name: "Burn Infusion",
    rarity: 48,
    description: "Enable Mana Burn.",
  },
  {
    id: 48,
    name: "Mana Shell",
    rarity: 40,
    description: "Enable Mana Shield.",
  },
  {
    id: 49,
    name: "Rotting Flesh",
    rarity: 45,
    description: "Enable Cursed Body.",
  },
  {
    id: 50,
    name: "Tainted Soul",
    rarity: 45,
    description: "Enable Cursed Soul.",
  },
  {
    id: 51,
    name: "Arcane Focus",
    rarity: 58,
    description: "Enable Arcane (50% reduced mana cost).",
  },
  {
    id: 52,
    name: "Energy Balance",
    rarity: 45,
    description: "Enable Balance (50% of physical dealt as magic).",
  },
  {
    id: 53,
    name: "Critical Instinct",
    rarity: 60,
    description: "Enable Crit Strike (+400% damage).",
  },
  {
    id: 54,
    name: "Piercing Blow",
    rarity: 50,
    description: "Enable Pure Strike (ignore armor).",
  },
  {
    id: 55,
    name: "Arcane Strike",
    rarity: 50,
    description: "Enable Pure Cast (ignore magic resistance).",
  },

  // Non-trivial Cards
  {
    id: 56,
    name: "Life break",
    rarity: 90,
    description: "Deal 90% of your HP as physical damage. Lose 90% of your HP.",
  },
  {
    id: 57,
    name: "Mana void",
    rarity: 90,
    description:
      "Deal the amount of magic damage equal to your MP. Lose all your MP.",
  },
  {
    id: 58,
    name: "Chaotic Harmony",
    rarity: 99,
    description:
      "Your next physical attack triggers Balance, Crit Strike, Pure Strike, and Double Damage.",
  },
  {
    id: 59,
    name: "Manablood Exchange",
    rarity: 55,
    description:
      "Convert at most 150 HP into MP or at most 150 MP into HP (whichever you have more of).",
  },
  {
    id: 60,
    name: "Curse Chain",
    rarity: 35,
    description:
      "If Cursed Body is active, apply Cursed Soul too. If Cursed Soul is already active, deal 100 magic damage.",
  },
  {
    id: 61,
    name: "Mana Sabotage",
    rarity: 38,
    description:
      "If the target has Mana Shield, disable it and deal 100 bonus damage.",
  },
  {
    id: 62,
    name: "Lifesteal Transfer",
    rarity: 40,
    description:
      "Convert Physical Lifesteal into Arcane Lifesteal, or vice versa.",
  },
  {
    id: 63,
    name: "Buff Breaker",
    rarity: 50,
    description: "Remove all beneficial buffs from both players.",
  },
  {
    id: 64,
    name: "Purge Equilibrium",
    rarity: 55,
    description:
      "If Balance is active, cancel it and deal 75 physical and 75 magic damage.",
  },
  {
    id: 65,
    name: "Overcast Ritual",
    rarity: 60,
    description: "Enable Arcane, Pure Cast, and Mana Burn simultaneously.",
  },
  {
    id: 66,
    name: "Null",
    rarity: 45,
    description: "Disable one active buff or debuff.",
  },
  {
    id: 67,
    name: "Power Void",
    rarity: 45,
    description:
      "Deal 100 physical damage and burn 200 MP from the target. If target has no MP, deal 100 extra physical damage.",
  },
  {
    id: 68,
    name: "Lifeburn Slash",
    rarity: 35,
    description: "Spend 150 HP to deal 300 physical damage.",
  },
  {
    id: 69,
    name: "Final Debt",
    rarity: 55,
    description:
      "Deal 200 physical damage. If you have less MP than the target, steal 100 MP.",
  },
  {
    id: 70,
    name: "Arcane Faultline",
    rarity: 60,
    description:
      "Deal 250 magic damage. Ignore the target's magic resistance if their MP is above yours.",
  },

  // Armor Cards
  { id: 71, name: "Ironhide Salve", rarity: 15, description: "Gain 10 armor." },
  { id: 72, name: "Steel Infusion", rarity: 25, description: "Gain 25 armor." },
  {
    id: 73,
    name: "Shatter Guard",
    rarity: 30,
    description: "Reduce target's armor by -10.",
  },
  {
    id: 74,
    name: "Expose Weakness",
    rarity: 70,
    description: "Set target's armor to 0.",
  },

  // Magic Resistance Cards
  {
    id: 75,
    name: "Arcane Shell",
    rarity: 15,
    description: "Gain +10 magic resistance.",
  },
  {
    id: 76,
    name: "Mind Drape",
    rarity: 25,
    description: "Gain +25 magic resistance.",
  },
  {
    id: 77,
    name: "Spirit Rend",
    rarity: 30,
    description: "Reduce target's magic resistance by -10.",
  },
  {
    id: 78,
    name: "Null Core",
    rarity: 70,
    description: "Set target's magic resistance to 0.",
  },

  // Armor / Magic Resistance Interaction Cards
  {
    id: 79,
    name: "Elemental Shift",
    rarity: 30,
    description: "Convert 100 armor into 100 magic resistance.",
  },
  {
    id: 80,
    name: "Hardened Will",
    rarity: 30,
    description: "Convert 100 magic resistance into 100 armor.",
  },
  {
    id: 81,
    name: "Dual Reinforcement",
    rarity: 35,
    description: "Gain +75 armor and +75 magic resistance.",
  },
  {
    id: 82,
    name: "Shatter Focus",
    rarity: 28,
    description: "Reduce armor by 50 and gain +100 magic resistance.",
  },
  {
    id: 83,
    name: "Arcane Harden",
    rarity: 28,
    description: "Reduce magic resistance by 50 and gain +100 armor.",
  },
  {
    id: 84,
    name: "Balance Breaker",
    rarity: 40,
    description:
      "If armor > magic resistance, halve armor and double magic resistance.",
  },
  {
    id: 85,
    name: "Armor Swap",
    rarity: 70,
    description: "Swap armor and magic resistance.",
  },
];
