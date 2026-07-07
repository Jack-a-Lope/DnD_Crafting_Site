import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import './Item_Card.css'
import parchmentImg from './assets/parchment.png';

interface Item {
  id: number;
  title: string;
  description: string;
  image: string;
  stats: any;
  magicalProperties: any;
  alchemicalProperties: any;
  spiritualProperties: any;
  specialProperties?: any;
}

const DUMMY_DATA = [
  {
    title: "Soul-Sprout Barnacles",
    description: "A pile of ashy barnacles with blackened bases and bone white tops. They smell vaguely of fish and bloated corpses.",
    image: "SoulBarnacles.jpg",
    stats: { rarity: "Uncommon", form: "Solid", material: "Organic", durability: "Mediocre" },
    magicalProperties: {
      description: "The Kresh behaves violently when exposed to fire, rapidly expanding with heat and force. Interestingly, when controled, its flames act as blades, cutting as they burn.",
      spellAffinities: ["Necromancy", "Conjuration", "Divination"],
      damageAffinities: ["Necrotic", "Poison"],
      spellDisaffinities: ["Evocation", "Enchantment"],
      damageDisaffinities: ["Fire", "Radiant", "Lightning"]
    },
    alchemicalProperties: { 
      description: "The barnacles act as a very minor, yet long-lasting, spiritual-poison which burrow into a victim's soul. Interestingly, it reacts strongly to blood irregardless if the original provider is alive or dead.",
      dissolvesIn: ["Alcohol", "Vinegar"], 
      reactsWith: ["Blood", "Acid"],
      reactions: ["When exposed to blood, Soul-Sprout Barnacles extend small grasping tendrils which apply this material's 'Poison' effect to all creatures who come into physical contact with it", "When exposed to acidic magic, the barnacles are reduced to a tarlike sludge. Any surface covered by this sludge becomes difficult terain for all living creatures."], 
      uses: ["Poison"], 
      effects: ["A creature subjected to this poison must succeed a DC 12 Constitution saving throw or take 2 (1d4) necrotic damage and becomes poisoned; while poisoned, the creature must repeat the save at the start of each of its turns. This effect lasts for 1 minute and ends after a successful save. Furthermore, the creature receives the 'Soul-Sprout' Curse meaning any hit points lost to this effect are deducted from the creature's maximum hit points and cannot be restored until an antidote, Remove Curse spell or similar effect are used."], 
    },
    spiritualProperties: { 
      description: "The barnacles appear to have some connection to demons, behaving similarly in how they feed off of physical, mental and spiritual energies of the living.",
      origin: ["Demonic"], 
      sacrificialValue: "minor"
    },
    specialProperties:  { 
      description: "The barnacles seem to be infecting and consuming energy from the soul itself. If only there was a way to release this stored potential...",
      specialTrigger: ["When alchemically combined with Dream-hook Krill"], 
      specialReactionDescription: "When combined with the shell of a Dream-Hook Krill, Soul-Sprout Barnacles release the life-energy they accrued in a sparkling, regenerative paste.",
      specialReactionEffect: "This combination results in a restorative medicine. The creature which consumes this medicine will regain 15 (3d8) hit points and benefit from the effects of a 4th level casting of the Remove Curse spell."
    }
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
                        {item.magicalProperties.description}
                        {item.magicalProperties.spellAffinities && (
                          <div className="affinities-container">
                            Spell Affinities:  
                            {item.magicalProperties.spellAffinities.map((affinity, index) => (
                              <div key={index} className="tooltip-container">
                                <img key={index} src={spellAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                                <span className="tooltip-text">{affinity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.magicalProperties.damageAffinities && (
                          <div className="affinities-container">
                            Damage Affinities: 
                            {item.magicalProperties.damageAffinities.map((affinity, index) => (
                              <div key={index} className="tooltip-container">
                                <img key={index} src={damageAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                                <span className="tooltip-text">{affinity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.magicalProperties.spellDisaffinities && (
                          <div className="affinities-container">
                            Spell Disaffinities:  
                            {item.magicalProperties.spellDisaffinities.map((affinity, index) => (
                              <div key={index} className="tooltip-container">
                                <img key={index} src={spellAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                                <span className="tooltip-text">{affinity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.magicalProperties.damageDisaffinities && (
                          <div className="affinities-container">
                            Damage Disaffinities: 
                            {item.magicalProperties.damageDisaffinities.map((affinity, index) => (
                              <div key={index} className="tooltip-container">
                                <img key={index} src={damageAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                                <span className="tooltip-text">{affinity}</span>
                              </div>
                            ))}
                          </div>
                        )}                        
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
                        {item.alchemicalProperties.description}
                        {item.alchemicalProperties.dissolvesIn && item.alchemicalProperties.dissolvesIn.length > 0 && (
                        <div>
                          Dissolves in: {item.alchemicalProperties.dissolvesIn.map((solvent, index) => (
                              <span key={index} style={{fontStyle: 'italic'}}>
                              {solvent}
                              {index < item.alchemicalProperties.dissolvesIn.length - 1 ? ', ' : ''}
                              </span>
                          ))}
                        </div>)}
                        {item.alchemicalProperties.reactsWith && item.alchemicalProperties.reactsWith.length > 0 && (
                        <div>
                          Reacts with: {item.alchemicalProperties.reactsWith.map((reactant, index) => {
                            const correspondingReaction = item.alchemicalProperties.reactions[index];
                      
                          return (
                              <span key={index}>
                                <div style={{paddingLeft: '1rem'}}>
                                  {reactant}: { }
                                  <span style={{fontStyle: 'italic'}}> 
                                    {correspondingReaction}
                                    {index < item.alchemicalProperties.dissolvesIn.length - 1 ? ', ' : ''}
                                  </span>
                                </div>
                              </span>
                          )})}
                        </div>)}
                        {item.alchemicalProperties.uses && item.alchemicalProperties.uses.length > 0 && (
                        <div>
                          Uses: {item.alchemicalProperties.uses.map((use, index) => {
                            const correspondingEffect = item.alchemicalProperties.effects[index];
                      
                          return (
                              <span key={index}>
                                <div style={{paddingLeft: '1rem'}}>
                                  {use}: { }
                                  <span style={{fontStyle: 'italic'}}> 
                                    {correspondingEffect}
                                    {index < item.alchemicalProperties.uses.length - 1 ? ', ' : ''}
                                  </span>
                                </div>
                              </span>
                          )})}
                        </div>
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
                        {item.spiritualProperties.description}
                        {item.spiritualProperties.origin && item.spiritualProperties.origin.length > 0 && (
                        <div>
                          Origin: {item.spiritualProperties.origin.map((origin, index) => {                      
                          return (
                              <span key={index}>
                                  <span style={{fontStyle: 'italic'}}> 
                                    {origin}
                                    {index < item.spiritualProperties.origin.length - 1 ? ', ' : ''}
                                  </span>
                              </span>
                          )})}
                        </div>
                        )}
                        {item.spiritualProperties.origin && item.spiritualProperties.origin.length > 0 && (
                        <div>
                          Sacrificial Value: { }
                          <span style={{fontStyle: 'italic'}}>
                            {item.spiritualProperties.sacrificialValue}
                          </span>
                        </div>
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
                          {item.specialProperties.specialTrigger && (
                            <div>
                              <div>
                                Special Trigger: { }
                                <span style={{fontStyle: 'italic'}}>
                                  {item.specialProperties.specialReactionDescription}
                                </span>
                              </div>
                              <div>
                                Effect: { }
                                <span style={{fontStyle: 'italic'}}>
                                  {item.specialProperties.specialReactionEffect}
                                </span>
                              </div>

                            </div>
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

function Item_List() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from('items').select('*');
      
      if (error) {
        console.error("Error fetching items: ", error);
      } else {
        setItems(data);
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>
      Loading Items ...
    </p>;
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#4b5563' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111827' }}>No items found!</h2>
        <p>The app successfully connected to Supabase, but the database returned an empty list.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Check your browser's console (F12) to see the raw data, and verify your Row Level Security (RLS) policies in the Supabase Dashboard!</p>
      </div>
    );
  }

  return (
    <>
      <div className="card-container">
        {items.map(item => (
          <Card key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}

function Item_Creator() {
  const[isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateItem() {
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('items')
      .insert([DUMMY_DATA[0]])
      .select();

      if (error) {
        console.error("Failed to insert:", error);
      } else {
        console.log("Successfully created!", data);
      }

      setIsSubmitting(false);
  }

  return (
    <button onClick={handleCreateItem} disabled={isSubmitting}>
      {isSubmitting ? "Forging item..." : "Create Cursed Compass"}
    </button>
  )
}

function Item_Creator_Menu() {
  const[draftItem, setDraftItem] = useState({
    title: "",
    description: "",
    iamge: "",
    stats: {
      rarity: "",
      form: "",
      material: "",
      durability: ""
    },
    magicalProperties: {
      descritpion: "",
      spellAffinities: [],
      damageAffinities: [],
      spellDisaffinities: [],
      damageDisaffinities: []
    },
    alchemicalProperties: {
      description: "",
      dissolvesIn: [], 
      reactsWith: [],
      reactions: [], 
      uses: [], 
      effects: [], 
    },
    spiritualProperties: { 
      description: "",
      origin: [], 
      sacrificialValue: ""
    },
    specialProperties:  { 
      description: "",
      specialTrigger: [], 
      specialReactionDescription: "",
      specialReactionEffect: ""
    }
  })

  function handleToggleAffinity(clickedAffinity) {
    const isSpell = Object.hasOwn(spellAffinityIcons, clickedAffinity);
    const affKey = isSpell ? "spellAffinities" : "damageAffinities";
    const disKey = isSpell ? "spellDisaffinities" : "damageDisaffinities";

    const currentAffinities = draftItem.magicalProperties[affKey] || [];
    const currentDisaffinities = draftItem.magicalProperties[disKey] || [];
    
    let newAffinities;
    let newDisaffinities;


    if (currentAffinities.includes(clickedAffinity)) {
      newAffinities = currentAffinities.filter(
        (affinity) => affinity !== clickedAffinity
      );
      newDisaffinities = [...currentDisaffinities, clickedAffinity];
    }
    else if (currentDisaffinities.includes(clickedAffinity)) {
      newAffinities = currentAffinities;
      newDisaffinities = currentDisaffinities.filter(
        (affinity) => affinity !== clickedAffinity
      );
    } else {
      newAffinities = [...currentAffinities, clickedAffinity];
      newDisaffinities = currentDisaffinities;
    }

    setDraftItem({
      ...draftItem,
      magicalProperties: {
        ...draftItem.magicalProperties,
        [affKey]: newAffinities,
        [disKey]: newDisaffinities
      },
    });
  }

  return (
    <div className="menu-container">
      <h2>Forge a New Item</h2>

      {/* A standard text field */}
      <div className="field-group">
        <label>Item Title:</label>
        <input 
          type="text" 
          value={draftItem.title} 
          onChange={(e) => setDraftItem({ 
            ...draftItem, // Keep the description, image, and stats exactly as they are...
            title: e.target.value // ...but overwrite the title with what I just typed!
          })} 
        />
      </div>

      {/* A dropdown menu for nested objects */}
      <div className="field-group">
        <label>Rarity:</label>
        <select 
          value={draftItem.stats.rarity} 
          onChange={(e) => setDraftItem({
            ...draftItem, // Keep the top-level stuff (title, description)...
            stats: {
              ...draftItem.stats, // Keep the other stats (form, material)...
              rarity: e.target.value // ...but update the rarity!
            }
          })}
        >
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Iconic">Iconic</option>

        </select>
      </div>

      {/* To see your object updating in real-time while you type! */}
      <pre>{JSON.stringify(draftItem, null, 2)}</pre>
    </div>
  );
}

export { Item_List, Item_Creator, Item_Creator_Menu }
