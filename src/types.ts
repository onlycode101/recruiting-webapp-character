export type Attributes = {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
};

export type Class = "Barbarian" | "Wizard" | "Bard";
export type AttrKey = keyof Attributes;

export type SkillKey = 'Acrobatics' |
    'Animal Handling' |
    'Arcana' |
    'Athletics' |
    'Deception' |
    'History' |
    'Insight' |
    'Intimidation' |
    'Investigation' |
    'Medicine' |
    'Nature' |
    'Perception' |
    'Performance' |
    'Persuasion' |
    'Religion' |
    'Sleight of Hand' |
    'Stealth' |
    'Survival';