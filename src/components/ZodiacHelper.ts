import { ZodiacSign, ZodiacInfo } from "../types";

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "Aries", element: "Fire", symbol: "♈", dateRange: "Mar 21 - Apr 19" },
  { name: "Taurus", element: "Earth", symbol: "♉", dateRange: "Apr 20 - May 20" },
  { name: "Gemini", element: "Air", symbol: "♊", dateRange: "May 21 - Jun 20" },
  { name: "Cancer", element: "Water", symbol: "♋", dateRange: "Jun 21 - Jul 22" },
  { name: "Leo", element: "Fire", symbol: "♌", dateRange: "Jul 23 - Aug 22" },
  { name: "Virgo", element: "Earth", symbol: "♍", dateRange: "Aug 23 - Sep 22" },
  { name: "Libra", element: "Air", symbol: "♎", dateRange: "Sep 23 - Oct 22" },
  { name: "Scorpio", element: "Water", symbol: "♏", dateRange: "Oct 23 - Nov 21" },
  { name: "Sagittarius", element: "Fire", symbol: "♐", dateRange: "Nov 22 - Dec 21" },
  { name: "Capricorn", element: "Earth", symbol: "♑", dateRange: "Dec 22 - Jan 19" },
  { name: "Aquarius", element: "Air", symbol: "♒", dateRange: "Jan 20 - Feb 18" },
  { name: "Pisces", element: "Water", symbol: "♓", dateRange: "Feb 19 - Mar 20" },
];

export function getZodiacSign(month: number, day: number): ZodiacSign {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[2];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[6];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[7];
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8];
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10];
  return ZODIAC_SIGNS[11]; // Pisces
}

export function calculateZodiacCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): ZodiacInfo {
  const el1 = sign1.element;
  const el2 = sign2.element;

  let score = 70;
  let compatibility = "Stable Connection";

  if (el1 === el2) {
    score = 90;
    if (el1 === "Fire") {
      compatibility = "Flaming Passion (Highly Dynamic)";
    } else if (el1 === "Air") {
      compatibility = "Intellectual Spark (Endless Conversations)";
    } else if (el1 === "Water") {
      compatibility = "Deep Emotional Resonance (Soulmate Match)";
    } else {
      compatibility = "Grounded & Rock Solid (Unshakeable Loyalty)";
    }
  } else if (
    (el1 === "Fire" && el2 === "Air") ||
    (el1 === "Air" && el2 === "Fire")
  ) {
    score = 85;
    compatibility = "Inspirational Flow (Fueling Each Other's Sparks)";
  } else if (
    (el1 === "Earth" && el2 === "Water") ||
    (el1 === "Water" && el2 === "Earth")
  ) {
    score = 88;
    compatibility = "Nurturing Union (Beautiful Growth & Protection)";
  } else if (
    (el1 === "Fire" && el2 === "Water") ||
    (el1 === "Water" && el2 === "Fire")
  ) {
    score = 55;
    compatibility = "Steam and Spark (Intense but Volatile)";
  } else if (
    (el1 === "Air" && el2 === "Earth") ||
    (el1 === "Earth" && el2 === "Air")
  ) {
    score = 65;
    compatibility = "Practical Winds (Structure meets Ideas)";
  } else if (
    (el1 === "Fire" && el2 === "Earth") ||
    (el1 === "Earth" && el2 === "Fire")
  ) {
    score = 60;
    compatibility = "Molten Hearth (Warm but requires patience)";
  } else if (
    (el1 === "Air" && el2 === "Water") ||
    (el1 === "Water" && el2 === "Air")
  ) {
    score = 62;
    compatibility = "Misty Currents (Intuitive but slightly vague)";
  }

  return {
    sign1: sign1.name + " " + sign1.symbol,
    sign2: sign2.name + " " + sign2.symbol,
    compatibility,
    score,
  };
}
