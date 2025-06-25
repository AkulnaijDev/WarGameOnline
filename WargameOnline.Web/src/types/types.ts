export type SavedArmy = {
  id: string;
  name: string;
  game: string;
  faction: string;
  units: UnitWithCount[];
};

export type Game = {
  id: number;
  name: string;
  factions: Faction[];
};


export type Rule = {
  name: string;
  rule: string;
};


export type ThresholdConstraints = {
  min?: number;
  max?: number;
  minFixed?: number;
  maxFixed?: number;
};

export type Attack = {
  [key: string]: number; // es: { melee: 3 }, { ranged: 1 }, { breath: 2 }
};



export type UnitWithCount = Unit & { count: number; points?: number, factionId: number;};

export type AddableUnit = Unit & { factionId: number };

export type ArmyInputWithId = ArmyInput & { id?: number };

export type Mode = "start" | "create" | "edit";

export type ArmyInput = {
  name: string;
  gameId: number;
  factionId: number;
  units: Array<{
    unitId: number;
    gameId: number;
    factionId: number;
    count: number;
  }>;
};

export type ArmySummary = {
  id: number;
  name: string;
  gameId: number;
  factionId: number;
};

export type Army = ArmySummary & {
  units: ArmyInput["units"];
};


export type RuleParam = {
  variable: string;
  value?: any;
  amount?: number;
};

export type UnitRule = {
  id: string;
  name: string;
  gameRules: {
    gameRuleId: string | number;
    params: RuleParam[];
  }[];
};

export type GenericGameRule = {
  id: string | number;
  name: string;
  effect?: string;
  type?: string;
  value?: any;
  target?: string;
  conditions?: string[];
  [key: string]: any;
};

export type Unit = {
  id: number;
  name: string;
  type: string;
  attacks: any[];
  hits: number;
  armour: number;
  command: number;
  unitSize: number;
  pointsPerUnit: number;
  thresholdConstraints: Record<string, number>;
  rules: string[];
  description: string;
  imagine: string;
};

export type ArmySpell = {
  name: string;
  effect: string;
  rangeInCm: number;
  difficultyToCast: number;
  flavourText?: string;
  gameRules?: any[];
};

export type ArmyRule = {
  name: string;
  ruleDescription: string;
  rules: string[];
};

export type Faction = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  image: string;
  constraintsByThreshold?: { step: number };
   constraints?: { minUnits?: number; maxPoints?: number };
  armyRules: ArmyRule[];
  armySpells: ArmySpell[];
  units: Unit[];
  unitRules: UnitRule[];
};

export type GameSystem = {
  id: number;
  name: string;
  factions: Faction[];
};
