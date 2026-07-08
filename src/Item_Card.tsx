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
    image: "",
    stats: {
      rarity: "common",
      form: "solid",
      material: "wood",
      durability: "poor"
    },
    magicalProperties: {
      description: "",
      spellAffinities: [],
      damageAffinities: [],
      spellDisaffinities: [],
      damageDisaffinities: []
    },
    alchemicalProperties: {
      description: "",
      dissolvesIn: ["alcohol"], 
      reactsWith: [],
      reactions: [], 
      uses: [], 
      effects: [], 
    },
    spiritualProperties: { 
      description: "",
      origin: ["natural"], 
      sacrificialValue: "none"
    },
    specialProperties:  { 
      description: "",
      specialTrigger: [], 
      specialReactionDescription: "",
      specialReactionEffect: ""
    }
  })

  const [imageFile, setImageFile] = useState(null);

  function handleAddSection(sectionType) {
    if (sectionType === "Reaction") {
      const currentReactants = draftItem.alchemicalProperties?.reactsWith || [];
      const currentReactions = draftItem.alchemicalProperties?.reactions || [];

      setDraftItem({
        ...draftItem,
        alchemicalProperties: {
          ...draftItem.alchemicalProperties, 
          reactsWith: [...currentReactants, ""],
          reactions: [...currentReactions, ""]
        }
      });
    }
    else if (sectionType === "Uses") {
      const currentUses = draftItem.alchemicalProperties?.uses || [];
      const currentEffects = draftItem.alchemicalProperties?.effects || [];

      setDraftItem({
        ...draftItem,
        alchemicalProperties: {
          ...draftItem.alchemicalProperties, 
          uses: [...currentUses, ""],
          effects: [...currentEffects, ""]
        }
      });
    }
    
  }

  function handleRemoveSection(index, sectionType) {
    if (sectionType === "Reaction") {
      const currentReactants = draftItem.alchemicalProperties?.reactsWith || [];
      const currentReactions = draftItem.alchemicalProperties?.reactions || [];

      let newReactants = currentReactants.filter(
        (reactant, i) => i !== index
      );

      let newReactions = currentReactions.filter(
        (reaction, i) => i !== index
      );

      setDraftItem({
        ...draftItem,
        alchemicalProperties: {
          ...draftItem.alchemicalProperties, 
          reactsWith: newReactants,
          reactions: newReactions
        }
      });
    } 
    else if (sectionType === "Uses") {
      const currentUses = draftItem.alchemicalProperties?.uses || [];
      const currentEffects = draftItem.alchemicalProperties?.effects || [];

      let newUses = currentUses.filter(
        (use, i) => i !== index
      );

      let newEffects = currentEffects.filter(
        (effect, i) => i !== index
      );

      setDraftItem({
        ...draftItem,
        alchemicalProperties: {
          ...draftItem.alchemicalProperties, 
          uses: newUses,
          effects: newEffects
        }
      });
    }  
  }

  function handleUpdateRow(index, fieldType, newValue, sectionType) {
    if (sectionType === "Reaction") {
      const targetArrayName = fieldType === 'reactant' ? 'reactsWith' : 'reactions';
      const currentArray = draftItem.alchemicalProperties[targetArrayName] || [];
      const copyOfArray = [...currentArray];

      copyOfArray[index] = (newValue);

      setDraftItem({
        ...draftItem,
        alchemicalProperties: {
          ...draftItem.alchemicalProperties,
          [targetArrayName]: copyOfArray
        }
      })
    }
    else if (sectionType === "Uses") {
      const targetArrayName = fieldType === 'use' ? 'uses' : 'effects';
      const currentArray = draftItem.alchemicalProperties[targetArrayName] || [];
      const copyOfArray = [...currentArray];

      copyOfArray[index] = (newValue);

      setDraftItem({
        ...draftItem,
        alchemicalProperties: {
          ...draftItem.alchemicalProperties,
          [targetArrayName]: copyOfArray
        }
      })
    }
    
  }

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

  async function handleSubmitItem() {
    let finalItemData = {...draftItem};

    if (imageFile) {
      const uniqueFileName = `${Date.now()}-${imageFile.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(uniqueFileName, imageFile);

      if (uploadError) {
        console.error("Failed to upload image: ", uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('item-images')
        .getPublicUrl(uniqueFileName);

      finalItemData.image = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('items')
      .insert([finalItemData])
      .select()

    if (error) {
      console.error("Error saving item to database:", error);
    } else {
      console.log("Successfully forged new item!", data);

    setImageFile(null);
    }
  }

  return (
    <div className="menu-container">
      <h2>Forge a New Item</h2>

      <div className="field-group">
        <label>Item Title:</label>
        <input 
          type="text" 
          value={draftItem.title} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            title: e.target.value
          })} 
        />
      </div>

      <div className="field-group">
        <label>Item Description:</label>
        <input 
          type="text" 
          value={draftItem.description} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            description: e.target.value
          })} 
        />
      </div>

      <div className="field-group">
        <label>Image:</label>
        <input
          type="file"
          accept="image/png, image/jpg, image/webp"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImageFile(e.target.files[0]);
            }
          }}
        />
        {imageFile && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Image Preview:</p>
            <img 
              src={URL.createObjectURL(imageFile)} 
              alt="Preview" 
              style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '2px solid #4b5563' }} 
            />
          </div>
        )}
      </div>

      <div className="field-group">
        <label>Rarity:</label>
        <select 
          value={draftItem.stats.rarity} 
          onChange={(e) => setDraftItem({
            ...draftItem, 
            stats: {
              ...draftItem.stats, 
              rarity: e.target.value 
            }
          })}
        >
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Unique-Minor">Unique</option>
          <option value="Unique-Major">Iconic</option>

        </select>
      </div>

      <div className="field-group">
        <label>Form:</label>
        <select 
          value={draftItem.stats.form} 
          onChange={(e) => setDraftItem({
            ...draftItem, 
            stats: {
              ...draftItem.stats, 
              form: e.target.value 
            }
          })}
        >
          <option value="Solid">Solid</option>
          <option value="Liquid">Liquid</option>
          <option value="Gas">Gas</option>
          <option value="Textile">Textile</option>
          <option value="Small-Pieces">Small-Pieces</option>
          <option value="Powder">Powder</option>          

        </select>
      </div>

      <div className="field-group">
        <label>Material:</label>
        <select 
          value={draftItem.stats.material} 
          onChange={(e) => setDraftItem({
            ...draftItem, 
            stats: {
              ...draftItem.stats, 
              material: e.target.value 
            }
          })}
        >
          <option value="Wood">Wood</option>
          <option value="Metal">Metal</option>
          <option value="Stone">Stone</option>
          <option value="Organic">Organic</option>
          <option value="Fluid">Fluid</option>
          <option value="Ceramic">Ceramic</option>
          <option value="Abberant">Abberant</option>
          <option value="Other">Other</option>

        </select>
      </div>

      <div className="field-group">
        <label>Durability:</label>
        <select 
          value={draftItem.stats.durability} 
          onChange={(e) => setDraftItem({
            ...draftItem, 
            stats: {
              ...draftItem.stats, 
              durability: e.target.value 
            }
          })}
        >
          <option value="poor">Poor</option>
          <option value="mediocre">Mediocre</option>
          <option value="good">Good</option>
          <option value="great">Great</option>
          <option value="excellent">Excellent</option>
          <option value="indestructable">Indestructable</option>

        </select>
      </div>

      <h4>Magical Properties</h4>
      <div className="field-group">
        <label>Magical Description:</label>
        <input 
          type="text" 
          value={draftItem.magicalProperties.description} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            magicalProperties: {
              ...draftItem.magicalProperties,
              description: e.target.value
            }
          })} 
        />
      </div>

      <div className="field-group">
        <label>Affinities:</label>
        
        <div className="icon-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {Object.keys(damageAffinityIcons).map((affinityName) => {
            
            const isSelected = draftItem.magicalProperties.damageAffinities?.includes(affinityName);

            return (
              <img 
                key={affinityName}
                src={damageAffinityIcons[affinityName]} 
                alt={affinityName}
                onClick={() => handleToggleAffinity(affinityName)}
                
                style={{ 
                  width: '40px', 
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.4,
                  border: isSelected ? '2px solid #922610' : '2px solid transparent',
                  borderRadius: '8px'
                }}
              />
            );
          })}
          {Object.keys(spellAffinityIcons).map((affinityName) => {
            
            const isSelected = draftItem.magicalProperties.damageAffinities?.includes(affinityName);

            return (
              <img 
                key={affinityName}
                src={spellAffinityIcons[affinityName]} 
                alt={affinityName}
                onClick={() => handleToggleAffinity(affinityName)}
                
                style={{ 
                  width: '40px', 
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.4,
                  border: isSelected ? '2px solid #922610' : '2px solid transparent',
                  borderRadius: '8px'
                }}
              />
            );
          })}
        </div>
      </div>

      <h4>Alchemical Properties</h4>
      <div className="field-group">
        <label>Alchemical Description:</label>
        <input 
          type="text" 
          value={draftItem.alchemicalProperties.description} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            alchemicalProperties: {
              ...draftItem.alchemicalProperties,
              description: e.target.value
            }
          })} 
        />
      </div>

      <div className="field-group">
        <label>Dissolves In:</label>
        <select 
          value={draftItem.alchemicalProperties.dissolvesIn} 
          onChange={(e) => setDraftItem({
            ...draftItem, 
            alchemicalProperties: {
              ...draftItem.alchemicalProperties, 
              dissolvesIn: [ e.target.value ]
            }
          })}
        >
          <option value="water">Water</option>
          <option value="alcohol">Alcohol</option>
          <option value="vinegar">Vinegar</option>
          <option value="oil">Oil</option>
          <option value="blood">Blood</option>

        </select>
      </div>

      <div className="field-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>Alchemical Reactions:</label>
          <button type="button" onClick={() => handleAddSection("Reaction")}>
            + Add Reaction
          </button>
        </div>

        {draftItem.alchemicalProperties?.reactsWith?.map((reactantString, index) => {
          
          const matchingReactionString = draftItem.alchemicalProperties.reactions[index];

          return (
            <div key={index} style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              
              <input 
                type="text" 
                placeholder="Reaction caused by..."
                value={reactantString} 
                onChange={(e) => handleUpdateRow(index, 'reactant', e.target.value, "Reaction")}
              />

              <input 
                type="text" 
                placeholder="Reaction effect..."
                value={matchingReactionString}
                onChange={(e) => handleUpdateRow(index, 'reaction', e.target.value, "Reaction")}
              />

              <button type="button" onClick={() => handleRemoveSection(index, "Reaction")}>
                - Remove
              </button>
              
            </div>
          );
        })}
      </div>

      <div className="field-group">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label>Alchemical Uses:</label>
          <button type="button" onClick={() => handleAddSection("Uses")}>
            + Add Use
          </button>
        </div>

        {draftItem.alchemicalProperties?.uses?.map((useString, index) => {
          
          const matchingUseString = draftItem.alchemicalProperties.effects[index];

          return (
            <div key={index} style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              
              <input 
                type="text" 
                placeholder="Kind of Use"
                value={useString} 
                onChange={(e) => handleUpdateRow(index, 'use', e.target.value, "Uses")}
              />

              <input 
                type="text" 
                placeholder="Use effect..."
                value={matchingUseString}
                onChange={(e) => handleUpdateRow(index, 'effect', e.target.value, "Uses")}
              />

              <button type="button" onClick={() => handleRemoveSection(index, "Uses")}>
                - Remove
              </button>
              
            </div>
          );
        })}
      </div>

      <h4>Spiritual Properties</h4>
      <div className="field-group">
        <label>Spiritual Description:</label>
        <input 
          type="text" 
          value={draftItem.spiritualProperties.description} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            spiritualProperties: {
              ...draftItem.spiritualProperties,
              description: e.target.value
            }
          })} 
        />
      </div>

      <div className="field-group">
        <label>Origin:</label>
        <select 
          value={draftItem.spiritualProperties.origin} 
          onChange={(e) => setDraftItem({
            ...draftItem, 
            spiritualProperties: {
              ...draftItem.spiritualProperties, 
              origin: [ e.target.value ]
            }
          })}
        >
          <option value="natural">Natural</option>
          <option value="artificial">Artificial</option>
          <option value="demonic">Demonic</option>
          <option value="spiritual">Spiritual</option>

        </select>
      </div>

      <div className="field-group">
        <label>Sacrificial Value:</label>
        <select 
          value={draftItem.spiritualProperties.sacrificialValue} 
          onChange={(e) => setDraftItem({
            ...draftItem, 
            spiritualProperties: {
              ...draftItem.spiritualProperties, 
              sacrificialValue: e.target.value
            }
          })}
        >
          <option value="none">None</option>
          <option value="minor">Minor</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="extreme">Extreme</option>

        </select>
      </div>

      <h4>Special Properties</h4>
      <div className="field-group">
        <label>Special Description:</label>
        <input 
          type="text" 
          value={draftItem.specialProperties.description} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            specialProperties: {
              ...draftItem.specialProperties,
              description: e.target.value
            }
          })} 
        />
      </div>

      <div className="field-group">
        <label>Special Reaction Description:</label>
        <input 
          type="text" 
          value={draftItem.specialProperties.specialReactionDescription} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            specialProperties: {
              ...draftItem.specialProperties,
              specialReactionDescription: e.target.value
            }
          })} 
        />
      </div>

      <div className="field-group">
        <label>Special Reaction Effect:</label>
        <input 
          type="text" 
          value={draftItem.specialProperties.specialReactionEffect} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            specialProperties: {
              ...draftItem.specialProperties,
              specialReactionEffect: e.target.value
            }
          })} 
        />
      </div>

      <button onClick={handleSubmitItem}>
        Submit
      </button>

      <pre>{JSON.stringify(draftItem, null, 2)}</pre>
    </div>
  );
}

export { Item_List, Item_Creator, Item_Creator_Menu }
