export enum RelationshipType {
  FRIENDSHIP = "Friendship",
  LOVE = "Love",
  AFFECTION = "Affection",
  MARRIAGE = "Marriage",
  ENMITY = "Enmity",
  SIBLING = "Sibling",
}

export interface ZodiacSign {
  name: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  symbol: string;
  dateRange: string;
}

export interface ZodiacInfo {
  sign1: string;
  sign2: string;
  compatibility: string;
  score: number;
}

export interface MatchHistoryItem {
  id: string;
  name1: string;
  name2: string;
  relationship: RelationshipType;
  score: number;
  date: string;
  zodiacs?: {
    sign1: string;
    sign2: string;
  };
}

export type MatchMode = "classic" | "zodiac" | "crush";

export interface EliminationStep {
  remainingLetters: string[];
  eliminatedIndex: number;
  eliminatedChar: string;
  startIndex: number;
}
