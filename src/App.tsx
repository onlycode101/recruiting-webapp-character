import { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST, ATTRIBUTES_SUM_MAX, ATTRIBUTE_INITIAL } from './consts';
import { Attributes, AttrKey, Class, SkillKey } from './types';

interface Skill {
  points: number; // player spent
  modifier: number; 
}

interface Character {
  attributes: Attributes;
  skills: Record<SkillKey, Skill>;
  selectedClass: string; // "Barbarian,Wizard,Bard"
}

const getModifier = (attr: number): number => Math.floor((attr - 10)/2);

const computeSkills = (attributes: Attributes, existingSkills: Record<SkillKey, Skill> = {} as Record<SkillKey, Skill>): Record<SkillKey, Skill> => {
  return SKILL_LIST.reduce((acc, skillItem) => {
    const attrVal: number = attributes[skillItem.attributeModifier];
    acc[skillItem.name] = {
      points: acc[skillItem.name]?.points??0,
      modifier: getModifier(attrVal)
    }
    return acc;
  }, existingSkills)
}

const initCharacter = (): Character => {
  const initialAttributes: Attributes = ATTRIBUTE_LIST.reduce((prev: Attributes, cur: AttrKey) => {
    prev[cur] = ATTRIBUTE_INITIAL;
    return prev;
  }, {} as Attributes);

  const initialSkills: Record<SkillKey, Skill> = computeSkills(initialAttributes)

  return {
    attributes: initialAttributes,
    skills: initialSkills,
    selectedClass: "",
  }
}

const getMaxAvailablePoints = (char: Character): number => {
  const intelligenceMod: number = getModifier(char.attributes.Intelligence);
  return Math.max(intelligenceMod * 4 + 10, 0);
}

const getCurrentSpendingSum = (char: Character): number => {
  return Object.values(char.skills).reduce((prev, cur) => {
    return prev + cur.points
  }, 0)
}

const fixSpendingDeficitIfAny = (char: Character): Character => {
  let maxAvailablePoint: number = getMaxAvailablePoints(char);
  let currentSpending: number = getCurrentSpendingSum(char);
  let remainder = maxAvailablePoint - currentSpending;
  let nextSkills: Record<SkillKey, Skill> = {...char.skills};

  while (remainder < 0) {
    for (let skillItem of SKILL_LIST) {
      // reduce point evenly across all attributes until remainder is not negative
      let {name: skillKey} = skillItem;
      let {points, ...restOfThisSkill} : Skill= nextSkills[skillKey];
      if (points > 0) {
        remainder++;
        nextSkills = {
          ...nextSkills,
          [skillKey]: {
            ...restOfThisSkill,
            points: points-1
          }
        }
      }
    }
  }
  return {
    ...char,
    skills: nextSkills
  };
}

const updateSelectedClassIfNeeded = (char: Character): Character => {
  let classArr: Class[] = [];
  let attributes = char.attributes;
  for (let classKey in CLASS_LIST) {
    let requirements: Attributes = CLASS_LIST[classKey];
    const someReqNotMeet = Object.keys(requirements).some(attrKey => {
      const reqAttrVal: number = requirements[attrKey];
      const charAttrVal: number = attributes[attrKey];
      return charAttrVal < reqAttrVal;
    });
    if (!someReqNotMeet) {
      classArr.push(classKey as Class)
    }
  }
  return {...char, selectedClass: classArr.join("")}
}

function App() {
  const [chars, setChars] = useState<Character[]>([initCharacter()]);

  
  const onChangeAttribute = (charIndex: number, attrKey: AttrKey, delta: number) => {
    // alert when exceeds 70 points
    // update selected calss
    // update mod
    //    if it's intelligence, the total available points is changed, 
    //        if it decreases, reset some points to make sure TAP is not exceeds
    const char: Character = chars[charIndex];
    const {skills, attributes} = char;

    const currentAttrSum: number = Object.values(attributes).reduce((prev, cur) => {
      return prev + cur
    }, 0);

    if(currentAttrSum + delta > ATTRIBUTES_SUM_MAX) {
      alert("You've reached max attributes. You'll have to lower other attributes first.");
      return;
    }
    
    // update both attributes and skills
    let nextAttrVal = attributes[attrKey] + delta;
    if (nextAttrVal < 0) {
      return;
    }

    let nextAttributes = {
      ...char.attributes,
      [attrKey]: nextAttrVal
    };

    let nextTargetChar: Character = {
      ...char,
      attributes: nextAttributes,
      skills: computeSkills(nextAttributes, skills)
    }
    
    nextTargetChar = fixSpendingDeficitIfAny(nextTargetChar);
    nextTargetChar = updateSelectedClassIfNeeded(nextTargetChar);

    let nextChars = [...chars.slice(0, charIndex), nextTargetChar, ...chars.slice(charIndex+1)];
    setChars(nextChars);
  }

  const onChangeSkill = (charIndex: number, skillKey: SkillKey, delta: number) => {
    const char: Character = chars[charIndex];
    const maxAvailablePoint: number = getMaxAvailablePoints(char);
    const currentSpending: number = getCurrentSpendingSum(char);
    const nextSpending: number = currentSpending + delta;
    if (nextSpending > maxAvailablePoint) {
      alert("You've used all available points: " + maxAvailablePoint);
      return;
    }

    let targetSkill: Skill = char.skills[skillKey];
    let nextTargetSkillPoint: number = Math.max(targetSkill.points + delta, 0);
    let nextTargetSkill: Skill = {
      ...targetSkill,
      points: nextTargetSkillPoint
    }
    let nextTargetChar: Character = {
      ...char,
      skills: {
        ...char.skills,
        [skillKey]: nextTargetSkill
      }
    }
    let nextChars = [...chars.slice(0, charIndex), nextTargetChar, ...chars.slice(charIndex+1)];
    setChars(nextChars);
  }

  const renderAttributes = (charIndex: number, char: Character) => {
    const {attributes, skills} = char;
    return (
      <div style={{border: "1px solid gray"}}>
        <h3>Attributes</h3>
        <ul>
          {Object.keys(attributes).map((attrKey: AttrKey) => {
            let attrValue = attributes[attrKey];
            return <li key={attrKey} style={{listStyle: "none"}}>
              <span>{attrKey}: {attrValue} (Modifier: {getModifier(attrValue)})</span>
              <button onClick={() => onChangeAttribute(charIndex, attrKey, 1)}>+</button>
              <button onClick={() => onChangeAttribute(charIndex, attrKey, -1)}>-</button>
            </li>
          })}
        </ul>
      </div>
    );
  } 
  
  const renderClasses = (charIndex: number, char: Character) => {
    const {selectedClass} = char;
    return (
      <ul style={{border: "1px solid gray"}}>
      {Object.keys(CLASS_LIST).map(classKey => {
        const isSelected = selectedClass.includes(classKey);
        return <li key={classKey} style={{listStyle: "none", color: isSelected ? "red" : "unset"}}>
          {classKey}
        </li>
      })}
      </ul>
    )
  }

  const renderSkills = (charIndex: number, char: Character) => {
    const {skills}= char;

    return (
      <div style={{border: "1px solid gray"}}>
      <h3>Skills</h3>
      <h4>Total skill points available: {getMaxAvailablePoints(char)}</h4>
      <ul>
        {SKILL_LIST.map(({name, attributeModifier}, index) => {
          let {points, modifier}: Skill = skills[name];
          const total = points + modifier;
          return <li key={name} style={{listStyle: "none"}}>
            <span>{name}: {points} (Modifier: {attributeModifier}): {modifier}</span>
            <button onClick={() => onChangeSkill(charIndex, name, 1)}>+</button>
            <button onClick={() => onChangeSkill(charIndex, name, -1)}>-</button>
            <span>total: {total}</span>
          </li>
        })}
      </ul>
    </div>
    )
  }

  const renderCharcter = (char: Character, index: number): JSX.Element => {
    return (
      <div key={`character-${index}`}>
        <h1>Charecter: {index+1}</h1>
        <div>
          <h2>Skill Check</h2>
        </div>
        <div>
          {renderAttributes(index, char)}
          {renderClasses(index, char)}
          {renderSkills(index, char)}
        </div>
      </div>
    );
  }

  console.log("char0", chars[0])

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        {chars.map(renderCharcter)}
      </section>
    </div>
  );
}

export default App;
