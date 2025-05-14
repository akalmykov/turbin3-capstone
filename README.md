## Deployment

Deployed to the Solana Devnet:

````
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: ./turbin3-wallet.json
Deploying program "snowlotus"...
Program path: /home/lexx/code/turbin3/snowlotus/target/deploy/snowlotus.so...
Program Id: 8dBK1WKr6bxzvggCvnMWwWtEEEozwtXKdCqLL8yJNeec

Signature: 5Kqzo1wJApra6hrNizvNpcawME9Jsk3FyAW5T8aL3MF9eX8yvnpJMFTFUtvnmYSosjQAsPdANowKNdUt1NNyeLp8
```
## Game model

A player has:
```
- HP: i64
- MP: u64
- Resistance/Amplification:
  -- Physical damage (armor): i64
  -- Magic damage: i64
- Buff/de-buffs: u64
  -- Damage reflection: deals 50% of the received damage back to the attacker
  -- Double damage: next attack does x2 damage dealt
  -- Physical Lifesteal: restores HP as a % of the physical damage dealt
  -- Physical Manasteal: restores mana as a % of the physical damage dealt
  -- Arcane Lifesteal: restores HP as a % of the magic damage dealt
  -- Arcane Manasteal: restores mana as a % of the magic damage dealt
  -- Mana Martyr: restores mana as a % of the physical damage received
  -- Mana Burn: burns mana as a % of the physical damage dealt
  -- Mana Shield: if MP > 0, lose MP in 2-to-1 rate instead of HP
  -- Cursed body: healing effects are 30% reduced
  -- Cursed soul: mana restore effects are 30% reduced
  -- Arcane: mana cost is 50% reduced
  -- Equilibrium Blade: 50% of the next physical attack is dealt as magic damage
  -- Crit strike: next physical attack deals +400% damage
  -- Pure strike: next physical attack ignore armor
  -- Pure cast: next physical attack ignores magic damage
```
## Physical Damage Cards:

1. Brutal Slash
   Effect: Deal 100 physical damage.
   Rarity: 5

2. Cleaving Blow
   Effect: Deal 150 physical damage.
   Rarity: 10

3. Heavy Smash
   Effect: Deal 200 physical damage.
   Rarity: 15

4. Death Chop
   Effect: Deal 250 physical damage.
   Rarity: 22

5. Bone Breaker
   Effect: Deal 300 physical damage.
   Rarity: 30

6. Executioner’s Mark
   Effect: Deal 400 physical damage.
   Rarity: 40

7. Titan’s Wrath
   Effect: Deal 500 physical damage.
   Rarity: 50

8. Godsplitter
   Effect: Deal 750 physical damage.
   Rarity: 70

9. Planet Cleaver
   Effect: Deal 1000 physical damage.
   Rarity: 90

## Magic Damage cards

1. Arcane Bolt
   Effect: Deal 100 magic damage.
   Rarity: 5

2. Fire Surge
   Effect: Deal 150 magic damage.
   Rarity: 10

3. Lightning Pulse
   Effect: Deal 200 magic damage.
   Rarity: 15

4. Frost Spike
   Effect: Deal 250 magic damage.
   Rarity: 20

5. Void Ray
   Effect: Deal 300 magic damage.
   Rarity: 25

6. Astral Lance
   Effect: Deal 400 magic damage.
   Rarity: 35

7. Mana Implosion
   Effect: Deal 500 magic damage.
   Rarity: 45

## Advanced attack cards

1. Celestial Sever
   Effect: Deal 600 physical damage. Restore mana equal to 15% of damage dealt.
   Rarity: 65

2. Abyssal Sunder
   Effect: Deal 800 physical damage. If the target has a mana shield active, deal 50% bonus damage.
   Rarity: 80

3. Reaper’s Toll
   Effect: Deal 450 physical damage. If this the damage dealt is more than 400, deal an additional 100 true damage.
   Rarity: 60

4. Blood Pact
   Effect: Deal 400 physical damage. Lose HP equal to 10% of damage dealt, but restore mana equal to 20% of damage dealt.
   Rarity: 50

5. Echoing Annihilation
   Effect: Deal 700 physical damage. If the target has damage reflection, this attack is not reflected.
   Rarity: 75

6. Necrotic Beam
   Effect: Deal 170 magic damage. Restore HP equal to 25% of damage dealt.
   Rarity: 25

7. Twin Strike
   Effect: Deal 80 physical and 80 magic damage.
   Rarity: 15

8. Echoing Strike (Rarity: 30)
   Effect: Deal 200 physical damage to the the target and yourself.
   Rarity: 20

9. Echoing Charge (Rarity: 30)
   Effect: Deal 200 magical damage to the the target and yourself.
   Rarity: 20

10. Last Reserve
    Effect: Deal 200 magic damage.If your MP is below 50, this costs 0 MP and deals +50 damage.
    Rarity: 25

## Health restoration cards:

1. Minor Bandage
   Effect: Restore 50 HP.
   Rarity: 3

2. Vital Herb
   Effect: Restore 100 HP.
   Rarity: 6

3. Healing Potion
   Effect: Restore 200 HP.
   Rarity: 12

4. Major Remedy
   Effect: Restore 300 HP.
   Rarity: 20

5. Blessed Salve
   Effect: Restore 500 HP.
   Rarity: 35

6. Divine Renewal
   Effect: Restore 1000 HP.
   Rarity: 60

7. Mana Drip
   Effect: Restore 25 MP.
   Rarity: 3

8. Focus Crystal
   Effect: Restore 50 MP.
   Rarity: 6

9. Mana Flask
   Effect: Restore 100 MP.
   Rarity: 12

10. Ether Bloom
    Effect: Restore 200 MP.
    Rarity: 20

11. Grand Mindroot
    Effect: Restore 350 MP.
    Rarity: 35

12. Arcane Surge
    Effect: Restore 500 MP.
    Rarity: 60

13. Infinite Spark
    Effect: Restore 1000 MP.
    Rarity: 85

## Enablers

1. Reflect Spark
   Effect: Enable Damage Reflection.
   Rarity: 35

2. Blood Rush
   Effect: Enable Double Damage.
   Rarity: 45

3. Leech Fang
   Effect: Enable Physical Lifesteal.
   Rarity: 30

4. Drain Fang
   Effect: Enable Physical Manasteal.
   Rarity: 28

5. Arcane Leech
   Effect: Enable Arcane Lifesteal.
   Rarity: 32

6. Arcane Siphon
   Effect: Enable Arcane Manasteal.
   Rarity: 30

7. Martyr’s Pact
   Effect: Enable Mana Martyr.
   Rarity: 35

8. Burn Infusion
   Effect: Enable Mana Burn.
   Rarity: 38

9. Mana Shell
   Effect: Enable Mana Shield.
   Rarity: 40

10. Rotting Flesh
    Effect: Enable Cursed Body.
    Rarity: 25

11. Tainted Soul
    Effect: Enable Cursed Soul.
    Rarity: 25

12. Arcane Focus
    Effect: Enable Arcane (50% reduced mana cost).
    Rarity: 28

13. Energy Balance
    Effect: Enable Balance (50% of physical dealt as magic).
    Rarity: 35

14. Critical Instinct
    Effect: Enable Crit Strike (+400% damage).
    Rarity: 60

15. Piercing Blow
    Effect: Enable Pure Strike (ignore armor).
    Rarity: 50

16. Arcane Strike
    Effect: Enable Pure Cast (ignore magic resistance).
    Rarity: 50

## Non-trivial cards

1. Life break
   Effect: Deal 90% of your HP as physical damage. Lose 90% of your HP.
   Rarity: 90
2. Mana void
   Effect: Deal the amount of magic damage equal to your MP. Lose all your MP.
   Rarity: 90
3. Chaotic Harmony
   Effect: Your next physical attack triggers Balance, Crit Strike, Pure Strike, and Double Damage.
   Rarity: 99
4. Manablood Exchange
   Effect: Convert at most 150 HP into MP or at most 150 MP into HP (whichever you have more of).
   Rarity: 55
5. Curse Chain
   Effect: If Cursed Body is active, apply Cursed Soul too. If Cursed Soul is already active, deal 100 magic damage.
   Rarity: 35
6. Mana Sabotage
   Effect: If the target has Mana Shield, disable it and deal 100 bonus damage.
   Rarity: 38
7. Lifesteal Transfer
   Effect: Convert Physical Lifesteal into Arcane Lifesteal, or vice versa.
   Rarity: 40
8. Buff Breaker
   Effect: Remove all beneficial buffs from both players.
   Rarity: 50
9. Purge Equilibrium
   Effect: If Balance is active, cancel it and deal 75 physical and 75 magic damage.
   Rarity: 55
10. Overcast Ritual
    Effect: Enable Arcane, Pure Cast, and Mana Burn simultaneously.
    Rarity: 60
11. Null
    Effect: Disable one active buff or debuff.
    Rarity: 75
12. Power Void
    Effect: Deal 100 physical damage and burn 200 MP from the target. If target has no MP, deal 100 extra physical damage.
    Rarity: 45
13. Lifeburn Slash
    Effect: Spend 150 HP to deal 300 physical damage.
    Rarity: 35
14. Final Debt
    Effect: Deal 200 physical damage. If you have less MP than the target, steal 100 MP.
    Rarity: 55
15. Arcane Faultline
    Effect: Deal 250 magic damage. Ignore the target's magic resistance if their MP is above yours.
    Rarity: 60

## Armor

1. Ironhide Salve
   Effect: Gain 10 armor.
   Rarity: 15

2. Steel Infusion
   Effect: Gain 25 armor.
   Rarity: 25

3. Shatter Guard
   Effect: Reduce target’s armor by -10.
   Rarity: 30

4. Expose Weakness
   Effect: Set target’s armor to 0.
   Rarity: 70

## Magic resistance

1. Arcane Shell
   Effect: Gain +10 magic resistance.
   Rarity: 15

2. Mind Drape
   Effect: Gain +25 magic resistance.
   Rarity: 25

3. Spirit Rend
   Effect: Reduce target’s magic resistance by -10
   Rarity: 30

4. Null Core
   Effect: Set target’s magic resistance to 0.
   Rarity: 70

## Armor/Magic resistance interaction

1. Elemental Shift
   Effect: Convert 100 armor into 100 magic resistance.
   Rarity: 30

2. Hardened Will
   Effect: Convert 100 magic resistance into 100 armor.
   Rarity: 30

3. Dual Reinforcement
   Effect: Gain +75 armor and +75 magic resistance.
   Rarity: 35

4. Shatter Focus
   Effect: Reduce armor by 50 and gain +100 magic resistance.
   Rarity: 28

5. Arcane Harden
   Effect: Reduce magic resistance by 50 and gain +100 armor.
   Rarity: 28

6. Balance Breaker
   Effect: If armor > magic resistance, halve armor and double magic resistance.
   Rarity: 40

7. Armor Swap
   Effect: Swap armor and magic resistance
   Rarity: 70

## Randomness source

https://docs.drand.love/dev-guide/API%20Documentation%20v2/v-2-beacons-beacon-id-info/
````
