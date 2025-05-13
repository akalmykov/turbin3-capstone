import { getLatestRandomness } from "./test_utils";
import { cards } from "./cards";
import seedrandom from "seedrandom";

function openBoosterPack(cards, randomness) {
  cards.sort((a, b) => a.rarity - b.rarity);
  const commons = cards.filter((c) => c.rarity <= 30);
  const uncommonsPlus = cards.filter((c) => c.rarity > 30);
  const pack = [];

  const rng = seedrandom(randomness);

  pack.push(weightedPick(commons, rng));
  pack.push(weightedPick(commons, rng));
  pack.push(weightedPick(commons, rng));
  pack.push(weightedPick(commons, rng));
  pack.push(weightedPick(uncommonsPlus, rng));

  return pack;
}

function weightedPick(cards, rng) {
  const weights = cards.map((c) => 1 / c.rarity);
  const total = weights.reduce((sum, w) => sum + w, 0);
  const r = rng() * total;
  let cumulative = 0;
  for (let i = 0; i < cards.length; i++) {
    cumulative += weights[i];
    if (r <= cumulative) return cards[i];
  }
}

export function openBooster(randomness) {
  // const randomnessHex = await getLatestRandomness();
  // const randomness = Buffer.from(randomnessHex.randomness, "hex");
  const selectedCards = openBoosterPack(cards, randomness);
  // console.log("selectedCards", selectedCards);
  return selectedCards;
}
