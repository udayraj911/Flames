import { RelationshipType, EliminationStep } from "../types";

export interface CharState {
  char: string;
  isEliminated: boolean;
  matchIndex?: number;
  id: string;
}

export interface FlamesMatchResult {
  name1: string;
  name2: string;
  cleanedName1: string;
  cleanedName2: string;
  chars1: CharState[];
  chars2: CharState[];
  crossOutSteps: { name1Index: number; name2Index: number }[];
  remainingCount: number;
  eliminationSteps: EliminationStep[];
  finalLetter: string;
  relationship: RelationshipType;
}

export function calculateFlames(name1: string, name2: string): FlamesMatchResult {
  const cleanedName1 = name1.toUpperCase().replace(/[^A-Z]/g, "");
  const cleanedName2 = name2.toUpperCase().replace(/[^A-Z]/g, "");

  const chars1: CharState[] = cleanedName1.split("").map((c, i) => ({
    char: c,
    isEliminated: false,
    id: `n1-${i}-${c}-${Math.random().toString(36).substr(2, 4)}`,
  }));

  const chars2: CharState[] = cleanedName2.split("").map((c, i) => ({
    char: c,
    isEliminated: false,
    id: `n2-${i}-${c}-${Math.random().toString(36).substr(2, 4)}`,
  }));

  const crossOutSteps: { name1Index: number; name2Index: number }[] = [];

  // Simulate cross out
  for (let i = 0; i < chars1.length; i++) {
    for (let j = 0; j < chars2.length; j++) {
      if (!chars1[i].isEliminated && !chars2[j].isEliminated && chars1[i].char === chars2[j].char) {
        chars1[i].isEliminated = true;
        chars2[j].isEliminated = true;
        chars1[i].matchIndex = j;
        chars2[j].matchIndex = i;
        crossOutSteps.push({ name1Index: i, name2Index: j });
        break;
      }
    }
  }

  const remainingCount1 = chars1.filter((c) => !c.isEliminated).length;
  const remainingCount2 = chars2.filter((c) => !c.isEliminated).length;
  const remainingCount = remainingCount1 + remainingCount2;

  // Elimination steps for word FLAMES
  const eliminationSteps: EliminationStep[] = [];
  const currentFlames = ["F", "L", "A", "M", "E", "S"];
  let currIndex = 0;

  // Handle case where remainingCount is 0 - default to some fun behavior or index 0
  const stepCount = remainingCount === 0 ? 1 : remainingCount;

  while (currentFlames.length > 1) {
    const elimIndex = (currIndex + stepCount - 1) % currentFlames.length;
    const elimChar = currentFlames[elimIndex];

    eliminationSteps.push({
      remainingLetters: [...currentFlames],
      eliminatedIndex: elimIndex,
      eliminatedChar: elimChar,
      startIndex: currIndex,
    });

    currentFlames.splice(elimIndex, 1);
    currIndex = elimIndex % currentFlames.length;
  }

  const finalLetter = currentFlames[0];
  let relationship = RelationshipType.FRIENDSHIP;

  switch (finalLetter) {
    case "F":
      relationship = RelationshipType.FRIENDSHIP;
      break;
    case "L":
      relationship = RelationshipType.LOVE;
      break;
    case "A":
      relationship = RelationshipType.AFFECTION;
      break;
    case "M":
      relationship = RelationshipType.MARRIAGE;
      break;
    case "E":
      relationship = RelationshipType.ENMITY;
      break;
    case "S":
      relationship = RelationshipType.SIBLING;
      break;
  }

  return {
    name1,
    name2,
    cleanedName1,
    cleanedName2,
    chars1,
    chars2,
    crossOutSteps,
    remainingCount,
    eliminationSteps,
    finalLetter,
    relationship,
  };
}
