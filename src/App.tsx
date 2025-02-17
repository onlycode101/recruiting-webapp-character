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

const computeSkills = (attributes: Attributes): Record<SkillKey, Skill> => {
  return SKILL_LIST.reduce((acc, skillItem) => {
    const attrVal: number = attributes[skillItem.attributeModifier]
    acc[skillItem.name] = {
      points: acc[skillItem.name]?.points??0,
      modifier: getModifier(attrVal)
    }
    return acc;
  }, {
  } as Record<SkillKey, Skill>)
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
  return char;
}

function App() {
  const [num, setNum] = useState<number>(0);
  const [chars, setChars] = useState<Character[]>([initCharacter()]);

  
  const onChangeAttribute = (charIndex: number, attrKey: AttrKey, delta: number) => {
    // alert when exceeds 70 points
    // update selected calss
    // update mod
    //    if it's intelligence, the total available points is changed, 
    //        if it decreases, reset some points to make sure TAP is not exceeds
    console.log("attr change", charIndex, attrKey, delta)
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
      skills: computeSkills(nextAttributes)
    }
    
    let nextChars = [...chars.slice(0, charIndex), nextTargetChar, ...chars.slice(charIndex+1)];
    setChars(nextChars);
  }

  const onChangeSkill = (charIndex: number, skillKey: SkillKey, delta: number) => {
    console.log("skill change", charIndex, skillKey, delta)
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
    return (
      <ul style={{border: "1px solid gray"}}>
      {Object.keys(CLASS_LIST).map(classKey => {
        return <li key={classKey} style={{listStyle: "none"}}>
          {classKey}
        </li>
      })}
      </ul>
    )
  }

  const renderSkills = (charIndex: number, char: Character) => {
    const {attributes, skills}= char;

    return (
      <div style={{border: "1px solid gray"}}>
      <h3>Skills</h3>
      <h4>Total skill points available: {getMaxAvailablePoints(char)}</h4>
      <ul>
        {SKILL_LIST.map(({name, attributeModifier}, index) => {
          let {points, modifier}: Skill = skills[name];
          const total = points + modifier;
          return <li key={name} style={{listStyle: "none"}}>
            <span>{name}: {points} (Modifier: {modifier})</span>
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
