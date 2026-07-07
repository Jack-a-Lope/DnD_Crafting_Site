import React, { useState } from 'react'
import './Item_Card.css'
import parchmentImg from './assets/parchment.png';
import modified_parchmentImg from './assets/modified_parchment.png';

const DUMMY_DATA = [
  {
    id: 1,
    title: "Soul-Sprout Barnacles",
    description: "A pile of ashy barnacles with blackened bases and bone white tops. They smell vaguely of fish and bloated corpses.",
    image: "SoulBarnacles.jpg",
    stats: { rarity: "Uncommon", form: "Solid", material: "Organic", durability: "Mediocre" },
    magicalDescription: "The barnacles seem to feed off of and infect the life force of nearby beings. It appears useful as part of a weapon or as a tool for extracting magical properties from other components.",
    spellAffinities: ["Necromancy", "Conjuration", "Divination"],
    spellDisaffinities: ["Evocation", "Enchantment"],
    damageAffinities: ["Necrotic", "Poison"],
    damageDisaffinities: ["Fire", "Radiant", "Lightning"],
    alchemicalDescription: "The barnacles act as a very minor, yet long-lasting, spiritual-poison which burrow into a victim's soul. Interestingly, it reacts strongly to blood irregardless if the original provider is alive or dead.",
    alchemicalProperties: { dissolvesIn: ["Alcohol", "Vinegar"], 
       reactsWith: ["Blood", "Acid"],
       reactions: ["When exposed to blood, Soul-Sprout Barnacles extend small grasping tendrils which apply this material's 'Poison' effect to all creatures who come into physical contact with it", "When exposed to acidic magic, the barnacles are reduced to a tarlike sludge. Any surface covered by this sludge becomes difficult terain for all living creatures."], 
       uses: ["Poison"], effects: ["A creature subjected to this poison must succeed a DC 12 Constitution saving throw or take 2 (1d4) necrotic damage and becomes poisoned; while poisoned, the creature must repeat the save at the start of each of its turns. This effect lasts for 1 minute and ends after a successful save. Furthermore, the creature receives the 'Soul-Sprout' Curse meaning any hit points lost to this effect are deducted from the creature's maximum hit points and cannot be restored until an antidote, Remove Curse spell or similar effect are used."], 
    },
    spiritualDescription: "The barnacles appear to have some connection to demons, behaving similarly in how they feed off of physical, mental and spiritual energies of the living.",
    spiritualProperties: { origin: ["Demonic"], sacrificialValue: "minor"},
    specialProperties:  { description: "The barnacles seem to be infecting and consuming energy from the soul itself. If only there was a way to release this stored potential..."},   
    specialTrigger: ["When alchemically combined with Dream-hook Krill"], 
    specialReactionDescription: "When combined with the shell of a Dream-Hook Krill, Soul-Sprout Barnacles release the life-energy they accrued in a sparkling, regenerative paste.",
    specialReactionEffect: "This combination results in a restorative medicine. The creature which consumes this medicine will regain 15 (3d8) hit points and benefit from the effects of a 4th level casting of the Remove Curse spell."
  },

];

const RARITY_BACKGROUNDS = {
  "Common": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(243,244,246,0.85) 100%)", 
  "Uncommon": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(220,252,231,0.85) 100%)", 
  "Rare": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(219,234,254,0.85) 100%)", 
  "Unique-Minor": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(248,199,254,0.85) 100%)",
  "Unique-Major": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(254,243,199,0.85) 100%)",
};

const spellAffinityIcons = {
  "Evocation": "icons/evocation.png",
  "Conjuration": "icons/conjuration.png",
  "Necromancy": "icons/necromancy.png",
  "Enchantment": "icons/enchantment.png",
  "Abjuration": "icons/abjuration.png",
  "Illusion": "icons/illusion.png",
  "Divination": "icons/divination.png",
  "Transmutation": "icons/transmutation.png",
};

const damageAffinityIcons = {
  "Fire": "icons/fire.svg",
  "Lightning": "icons/lightning.svg",
  "Cold": "icons/cold.svg",
  "Acid": "icons/acid.svg",
  "Poison": "icons/poison.svg",
  "Psychic": "icons/psychic.svg",
  "Radiant": "icons/radiant.svg",
  "Necrotic": "icons/necrotic.svg",
  "Force": "icons/force.svg",
  "Thunder": "icons/thunder.svg",
  "Bludgeoning": "icons/bludgeoning.svg",
  "Piercing": "icons/piercing.svg",
  "Slashing": "icons/slashing.svg",
};

function Card( {item} ) {

  const[isExpanded, setIsExpanded] = useState(false);
  const[magicalPropertiesExpanded, setMagicalPropertiesExpanded] = useState(false);
  const[alchemicalPropertiesExpanded, setAlchemicalPropertiesExpanded] = useState(false);
  const[spiritualPropertiesExpanded, setSpiritualPropertiesExpanded] = useState(false);
  const[specialPropertiesExpanded, setSpecialPropertiesExpanded] = useState(false);


  const overlayGradient = RARITY_BACKGROUNDS[item.stats.rarity] || 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)';
  const textureImage= `url('${parchmentImg}')`;
  return (
    <article
      className={`card ${isExpanded ? 'expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}

      style={{ backgroundImage: `${overlayGradient}, ${textureImage}` }} 
    >
      <div className="card-first-row"> 
        <img src={item.image} 
          className="card-img" 
          alt={item.title}

          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Unavailable'; }}
        />
        <div className="card-content">
          <h2 className="card-title" style={{ fontFamily: 'modesto-text, serif', fontWeight: 'bold', fontSize: '1.5rem', color: '#922610' }}>
            {item.title}
          </h2>
          <h2 className="card-title" style={{ fontFamily: 'mrs-eaves, serif', fontStyle: 'italic', fontWeight: 'bold', fontSize: '0.9rem', color: '#4b5563' }}>
            {item.stats.rarity} | Structure: {item.stats.form} - {item.stats.material} | Durability: {item.stats.durability}
          </h2>
          <p className="card-description" style={{ fontFamily: 'bookmania, serif', }}>{item.description}</p>
        </div>
      </div>
      <div className="card-subcontent">
          <div className="card-subsections-wrapper">
            <div className="card-subsections-inner">
              <div className="card-subsections-content">
                <section 
                  className={`subsection ${ magicalPropertiesExpanded ? 'expanded' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMagicalPropertiesExpanded(!magicalPropertiesExpanded);
                }}>
                  <h4>Magical Properties:</h4>
                  <div className="subsection-hidden-wrapper">
                    <div className="subsection-hidden-inner">
                      <div className="subsection-hidden-content">
                        {item.magicalDescription}
                        <div className="affinities-container">
                          Spell Affinities:  
                          {item.spellAffinities.map((affinity, index) => (
                            <div key={index} className="tooltip-container">
                              <img key={index} src={spellAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                              <span className="tooltip-text">{affinity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="affinities-container">
                          Damage Affinities: 
                          {item.damageAffinities.map((affinity, index) => (
                            <div key={index} className="tooltip-container">
                              <img key={index} src={damageAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                              <span className="tooltip-text">{affinity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="affinities-container">
                          Spell Disaffinities:  
                          {item.spellDisaffinities.map((affinity, index) => (
                            <div key={index} className="tooltip-container">
                              <img key={index} src={spellAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                              <span className="tooltip-text">{affinity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="affinities-container">
                          Damage Disaffinities: 
                          {item.damageDisaffinities.map((affinity, index) => (
                            <div key={index} className="tooltip-container">
                              <img key={index} src={damageAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                              <span className="tooltip-text">{affinity}</span>
                            </div>
                          ))}
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </section>
                <section 
                  className={`subsection ${ alchemicalPropertiesExpanded ? 'expanded' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAlchemicalPropertiesExpanded(!alchemicalPropertiesExpanded);
                }}>
                  <h4>Alchemical Properties:</h4>
                  <div className="subsection-hidden-wrapper">
                    <div className="subsection-hidden-inner">
                      <div className="subsection-hidden-content">
                        {item.alchemicalDescription}
                        {item.alchemicalProperties.dissolvesIn && item.alchemicalProperties.dissolvesIn.length > 0 && (
                        <p>
                          Dissolves in: {item.alchemicalProperties.dissolvesIn.map((solvent, index) => (
                              <span key={index} style={{fontStyle: 'italic'}}>
                              {solvent}
                              {index < item.alchemicalProperties.dissolvesIn.length - 1 ? ', ' : ''}
                              </span>
                          ))}
                        </p>)}
                        {item.alchemicalProperties.reactsWith && item.alchemicalProperties.reactsWith.length > 0 && (
                        <p>
                          Reacts with: {item.alchemicalProperties.reactsWith.map((reactant, index) => {
                            const correspondingReaction = item.alchemicalProperties.reactions[index];
                      
                          return (
                              <span key={index}>
                                <p style={{paddingLeft: '1rem'}}>
                                  {reactant}: { }
                                  <span style={{fontStyle: 'italic'}}> 
                                    {correspondingReaction}
                                    {index < item.alchemicalProperties.dissolvesIn.length - 1 ? ', ' : ''}
                                  </span>
                                </p>
                              </span>
                          )})}
                        </p>)}
                        {item.alchemicalProperties.uses && item.alchemicalProperties.uses.length > 0 && (
                          <p>
                          Uses: {item.alchemicalProperties.uses.map((use, index) => {
                            const correspondingEffect = item.alchemicalProperties.effects[index];
                      
                          return (
                              <span key={index}>
                                <p style={{paddingLeft: '1rem'}}>
                                  {use}: { }
                                  <span style={{fontStyle: 'italic'}}> 
                                    {correspondingEffect}
                                    {index < item.alchemicalProperties.uses.length - 1 ? ', ' : ''}
                                  </span>
                                </p>
                              </span>
                          )})}
                        </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
                <section 
                  className={`subsection ${ spiritualPropertiesExpanded ? 'expanded' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSpiritualPropertiesExpanded(!spiritualPropertiesExpanded);
                }}>
                  <h4>Spiritual Properties:</h4>
                  <div className="subsection-hidden-wrapper">
                    <div className="subsection-hidden-inner">
                      <div className="subsection-hidden-content">
                        {item.spiritualDescription}
                        {item.spiritualProperties.origin && item.spiritualProperties.origin.length > 0 && (
                          <p>
                          Origin: {item.spiritualProperties.origin.map((origin, index) => {                      
                          return (
                              <span key={index}>
                                  <span style={{fontStyle: 'italic'}}> 
                                    {origin}
                                    {index < item.spiritualProperties.origin.length - 1 ? ', ' : ''}
                                  </span>
                              </span>
                          )})}
                        </p>
                        )}
                        {item.spiritualProperties.origin && item.spiritualProperties.origin.length > 0 && (
                          <p>
                          Sacrificial Value: { }
                          <span style={{fontStyle: 'italic'}}>
                            {item.spiritualProperties.sacrificialValue}
                          </span>
                        </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {item.specialProperties.description && (
                  <section 
                    className={`subsection ${ specialPropertiesExpanded ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpecialPropertiesExpanded(!specialPropertiesExpanded);
                  }}>
                    <h4>Special Properties:</h4>
                    <div className="subsection-hidden-wrapper">
                      <div className="subsection-hidden-inner">
                        <div className="subsection-hidden-content">
                          {item.specialProperties.description}
                          {item.specialTrigger && (
                            <p>
                              <p>
                                Special Trigger: { }
                                <span style={{fontStyle: 'italic'}}>
                                  {item.specialReactionDescription}
                                </span>
                              </p>
                              <p>
                                Effect: { }
                                <span style={{fontStyle: 'italic'}}>
                                  {item.specialReactionEffect}
                                </span>
                              </p>

                            </p>
                          )}                         
                        </div>
                      </div>
                    </div>
                  </section>
                )}
                
              </div>
            </div>
          </div>
      </div>  
      
      
    </article>
  )
}

function Item_Card() {
  return (
    <>
      <div className="card-container">
        {DUMMY_DATA.map(item => (
          <Card key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}

export default Item_Card
