import React, { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient.tsx'
import { useAuth } from './Auth_Context';
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
  sub_sec_visibility?: any;
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

const GMid = 'e2e95ba0-6c80-4fb5-b2ec-a0106ed059df';

const RARITY_BACKGROUNDS = {
  "Common": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(243,244,246,0.85) 100%)", 
  "Uncommon": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(220, 255, 232, 0.85) 100%)", 
  "Rare": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(209, 229, 255, 0.85) 100%)", 
  "Unique-Minor": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(248, 197, 255, 0.85) 100%)",
  "Unique-Major": "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255, 196, 128, 0.85) 100%)",
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

function Card({ item, setItems, toggleEditMenu }: { item: Item; setItems: React.Dispatch<React.SetStateAction<Item[]>>; toggleEditMenu: (item: Item) => void }) {

  async function handleDeleteItem() {
    const { data, error } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id)
      .select()

    if (error) {
      console.error("Error deleting item from database:", error);
    } else {
      console.log("Successfully destroyed item!", data);
      console.log(item.id);
      setItems((prevItems) => prevItems.filter((existingItem) => existingItem.id !== item.id));
    }
  }

  async function handleDuplicateItem() {

    const { id, ...duplicate } = item;
    duplicate.title = duplicate.title

    const { data, error } = await supabase
      .from('items')
      .insert(duplicate)
      .select();

      if (error) {
        console.error("Failed to insert:", error);
      } else {
        console.log("Successfully created!", data);
        setItems((prevItems) => 
          [...prevItems, data[0]]
        );
      }
  }

    const[draftItem, setDraftItem] = useState<{
    sub_sec_visibility: {
      magRev: boolean;
      alcRev: boolean;
      spirRev: boolean;
      specRev: boolean;
    };
  }>({
    sub_sec_visibility:  { 
      magRev: item.sub_sec_visibility.magRev,
      alcRev: item.sub_sec_visibility.alcRev,
      spirRev: item.sub_sec_visibility.spirRev,
      specRev: item.sub_sec_visibility.specRev
    }
  })
async function handleSetVisibility( section: 'mag' | 'alc' | 'spir' | 'spec') {
  let keyToUpdate: keyof typeof draftItem.sub_sec_visibility = "magRev";
  if (section === "mag") keyToUpdate = "magRev";
  else if (section === "alc") keyToUpdate = "alcRev";
  else if (section === "spir") keyToUpdate = "spirRev";
  else if (section === "spec") keyToUpdate = "specRev";

  const newVisibility = {
    ...draftItem.sub_sec_visibility,
    [keyToUpdate]: !draftItem.sub_sec_visibility[keyToUpdate]
  };

  setDraftItem({ 
    ...draftItem, 
    sub_sec_visibility: newVisibility 
  });

  if (section === "mag") setMagRev(newVisibility.magRev);
  else if (section === "alc") setAlcRev(newVisibility.alcRev);
  else if (section === "spir") setSpirRev(newVisibility.spirRev);
  else if (section === "spec") setSpecRev(newVisibility.specRev);

  console.log("Sending this EXACT data to Supabase:", newVisibility);

  const { data, error } = await supabase
    .from('items')
    .update({ sub_sec_visibility: newVisibility })
    .eq('id', item.id)
    .select();

  if (error) {
    console.error("Error saving item to database:", error);
  } else {
    console.log("Successfully updated item!", data);
  }
}

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  const[isExpanded, setIsExpanded] = useState(false);
  const[magicalPropertiesExpanded, setMagicalPropertiesExpanded] = useState(false);
  const[alchemicalPropertiesExpanded, setAlchemicalPropertiesExpanded] = useState(false);
  const[spiritualPropertiesExpanded, setSpiritualPropertiesExpanded] = useState(false);
  const[specialPropertiesExpanded, setSpecialPropertiesExpanded] = useState(false);
  const {user} = useAuth();
  const[magRev, setMagRev] = useState(item.sub_sec_visibility.magRev);
  const[alcRev, setAlcRev] = useState(item.sub_sec_visibility.alcRev);
  const[spirRev, setSpirRev] = useState(item.sub_sec_visibility.spirRev);
  const[specRev, setSpecRev] = useState(item.sub_sec_visibility.specRev);


  const overlayGradient = RARITY_BACKGROUNDS[item.stats.rarity as keyof typeof RARITY_BACKGROUNDS] || 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)';
  const textureImage= `url('${parchmentImg}')`;
  return (
    <article
      className={`card ${isExpanded ? 'expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}

      style={{ backgroundImage: `${overlayGradient}, ${textureImage}` }} 
    >
      <div className="card-first-row">
        {item.image != null ? (
          <img src={item.image} 
          className="card-img" 
          alt={item.title}

          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Unavailable'; }}
        />
        ) : 
        <img src={'https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/defaultItemIcon.jpg'} 
          className="card-img" 
          alt={item.title}

          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Unavailable'; }}
        />
        }
        
        <div className="card-content">
          <h2 className="card-title" style={{ fontFamily: 'modesto-text, serif', fontWeight: 'bold', fontSize: '1.5rem', color: '#922610' }}>
            {item.title}
          </h2>
          <h2 className="card-title" style={{ fontFamily: 'mrs-eaves, serif', fontStyle: 'italic', fontWeight: 'bold', fontSize: '0.9rem', color: '#4b5563' }}>
            {item.stats.rarity} | Structure: {item.stats.form} - {item.stats.material} | Durability: {item.stats.durability}
          </h2>
          <p className="card-description" style={{ fontFamily: 'bookmania, serif', }}>{item.description}</p>
        </div>
          {user?.id === GMid && (
            <>
              <img onClick={(e) => {handleDuplicateItem(); handleButtonClick(e)}} src="\icons\duplicateIcon.png" className='menu-btn-icon'/>
              <img onClick={(e) => {toggleEditMenu(item); handleButtonClick(e)}} src="\icons\editIcon.png" className='menu-btn-icon'/>
              <img onClick={(e) => {handleDeleteItem(); handleButtonClick(e)}} src="\icons\trashIcon.png" className='menu-btn-icon'/>
            </>
          )}
      </div>
      <div className="card-subcontent">
          <div className="card-subsections-wrapper">
            <div className="card-subsections-inner">
              <div className="card-subsections-content">
                {/*Magical Properties*/}
                {(user?.id === GMid || magRev ? (
                  <section 
                    className={`subsection ${ magicalPropertiesExpanded ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMagicalPropertiesExpanded(!magicalPropertiesExpanded);
                  }}>
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                      <h4>Magical Properties:</h4>
                      {user?.id === GMid && (
                        <>
                          {(magRev) ? (
                            <img onClick={(e) => {handleSetVisibility("mag"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/visibleIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                          ) : (
                            <img onClick={(e) => {handleSetVisibility("mag"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/hiddenIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                          )}
                        </>
                      )}
                      
                    </div>
                    <div className="subsection-hidden-wrapper">
                      <div className="subsection-hidden-inner">
                        <div className="subsection-hidden-content">
                          {item.magicalProperties.description}
                            {item.magicalProperties.spellAffinities && (
                            <div className="affinities-container">
                              Spell Affinities:  
                              {item.magicalProperties.spellAffinities.map((affinity: keyof typeof spellAffinityIcons, index: number) => (
                                <div key={index} className="tooltip-container">
                                  <img src={spellAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                                  <span className="tooltip-text">{affinity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.magicalProperties.damageAffinities && (
                            <div className="affinities-container">
                              Damage Affinities: 
                              {item.magicalProperties.damageAffinities.map((affinity: keyof typeof damageAffinityIcons, index: number) => (
                                <div key={index} className="tooltip-container">
                                  <img src={damageAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                                  <span className="tooltip-text">{affinity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.magicalProperties.spellDisaffinities && (
                            <div className="affinities-container">
                              Spell Disaffinities:  
                              {item.magicalProperties.spellDisaffinities.map((affinity: keyof typeof spellAffinityIcons, index: number) => (
                                <div key={index} className="tooltip-container">
                                  <img src={spellAffinityIcons[affinity]} alt={affinity} className="subsection-hidden-img" />
                                  <span className="tooltip-text">{affinity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {item.magicalProperties.damageDisaffinities && (
                            <div className="affinities-container">
                              Damage Disaffinities: 
                              {item.magicalProperties.damageDisaffinities.map((affinity: keyof typeof damageAffinityIcons, index: number) => (
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
                ) : (
                  <section>
                    <h4 className="hidden-sub-h4">Magical Properties:</h4>
                  </section>
                ))}
                {/*Alchemical Properties*/}
                {(user?.id === GMid  || alcRev) ? (
                  <section 
                    className={`subsection ${ alchemicalPropertiesExpanded ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAlchemicalPropertiesExpanded(!alchemicalPropertiesExpanded);
                  }}>
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                      <h4>Alchemical Properties:</h4>
                      {user?.id === GMid && (
                        <>
                          {alcRev ? (
                          <img onClick={(e) => {handleSetVisibility("alc"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/visibleIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                            ) : (
                              <img onClick={(e) => {handleSetVisibility("alc"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/hiddenIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                          )}
                        </>
                      )}
                    </div>
                    <div className="subsection-hidden-wrapper">
                      <div className="subsection-hidden-inner">
                        <div className="subsection-hidden-content">
                          {item.alchemicalProperties.description}
                          {item.alchemicalProperties.dissolvesIn && item.alchemicalProperties.dissolvesIn.length > 0 && (
                          <div>
                            Dissolves in: {item.alchemicalProperties.dissolvesIn.map((solvent: string, index: number) => (
                                <span key={index} style={{fontStyle: 'italic'}}>
                                {solvent}
                                {index < item.alchemicalProperties.dissolvesIn.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                          </div>)}
                          {item.alchemicalProperties.reactsWith && item.alchemicalProperties.reactsWith.length > 0 && (
                          <div>
                            Reacts with: {item.alchemicalProperties.reactsWith.map((reactant: string, index: number) => {
                              const correspondingReaction = item.alchemicalProperties.reactions[index];
                        
                            return (
                                <span key={index}>
                                  <div style={{paddingLeft: '1rem', 'marginBottom':'1rem'}}>
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
                            Uses: {item.alchemicalProperties.uses.map((use: string, index: number) => {
                              const correspondingEffect = item.alchemicalProperties.effects[index];
                        
                            return (
                                <span key={index}>
                                  <div style={{paddingLeft: '1rem', marginBottom: '1rem'}}>
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
                ) : (
                  <section>
                    <h4 className="hidden-sub-h4">Alchemical Properties:</h4>
                  </section>
                )}
                {/*Spiritual Properties*/}
                {(user?.id === GMid || spirRev) ? (
                  <section 
                    className={`subsection ${ spiritualPropertiesExpanded ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpiritualPropertiesExpanded(!spiritualPropertiesExpanded);
                  }}>
                    <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                      <h4>Spiritual Properties:</h4>
                      {user?.id === GMid && (
                        <>
                          {spirRev ? (
                          <img onClick={(e) => {handleSetVisibility("spir"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/visibleIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                            ) : (
                              <img onClick={(e) => {handleSetVisibility("spir"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/hiddenIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                          )}
                        </>
                      )}
                    </div>
                    <div className="subsection-hidden-wrapper">
                      <div className="subsection-hidden-inner">
                        <div className="subsection-hidden-content">
                          {item.spiritualProperties.description}
                          {item.spiritualProperties.origin && item.spiritualProperties.origin.length > 0 && (
                          <div>
                            Origin: {item.spiritualProperties.origin.map((origin: string, index: number) => {                      
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
                ) : (
                  <section>
                    <h4 className="hidden-sub-h4">Spiritual Properties:</h4>
                  </section>
                )}
                {/*Special Properties*/}
                {(user?.id === GMid  || specRev) ? (
                  <>
                    {item.specialProperties.description && (
                    <section 
                      className={`subsection ${ specialPropertiesExpanded ? 'expanded' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpecialPropertiesExpanded(!specialPropertiesExpanded);
                    }}>
                      <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                        <h4>Special Properties:</h4>
                        {user?.id === GMid && (
                        <>
                          {specRev ? (
                            <img onClick={(e) => {handleSetVisibility("spec"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/visibleIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                          ) : (
                            <img onClick={(e) => {handleSetVisibility("spec"); handleButtonClick(e)}} src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/hiddenIcon.png" className='menu-btn-icon' style={{alignSelf:"top"}}/>
                          )}
                        </>
                        )}
                      </div>
                      <div className="subsection-hidden-wrapper">
                        <div className="subsection-hidden-inner">
                          <div className="subsection-hidden-content">
                            {item.specialProperties.description}
                            {item.specialProperties.specialReactionDescription && (
                              <div>
                                <div style={{'marginBottom':'1rem'}}>
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
                  </>
                ) : (
                  <section>
                    {item.specialProperties.description && (
                      <h4 className="hidden-sub-h4">Special Properties:</h4>
                      )
                    }
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
  const [loadingItems, setLoadingItems] = useState(true);
  const [createMenu, setCreateMenu] = useState(false);
  const [editMenu, setEditMenu] = useState(false);
  const [editItem, setEditItem] = useState<Item>();
  const {user} = useAuth();
  const [titleSearch, setTitleSearch] = useState<string>("");
  const [curItems, setCurItems] = useState<Item[]>();

  const toggleCreateMenu = () => {
    setCreateMenu((cur) => !cur);
  }

  const toggleEditMenu = (item?: Item) => {
    setEditMenu((cur) => !cur);
    if (item) {
      setEditItem(item);
    }
    console.log("toggle edit menu");
  }

  async function fetchItems() {
    setLoadingItems(true); 

    const { data, error } = await supabase.from('items').select('*');
    
    if (error) {
      console.error("Error fetching items: ", error);
    } else {
      console.log("Fetching Data Success");
      setItems(data);
      setCurItems(data);
      setCurItems((cur) => cur ? [...cur].sort((a, b) => a.title.localeCompare(b.title)) : cur);
    }

    setLoadingItems(false); 
  }

  useEffect(() => {
    if (!items) {
      return;
    }
    let processedItems = items.filter((_cur) => 
      _cur.title.toLowerCase().includes(titleSearch.toLowerCase())
    );
    processedItems = processedItems.sort((a, b) => 
      a.title.localeCompare(b.title)
    );
    console.log("Set Process Items, ", {processedItems});
    setCurItems(processedItems);
  }, [items, titleSearch]);


  useEffect(() => {
    fetchItems();
  }, []);

  if (loadingItems) {
    return (
      <>
        <div className="background">
          <div className="card-container">
            <button className="card-add-btn">
              Loading...
            </button>
          </div>
        </div>
      
      </>
    );
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
      <div className="background-menu">
        <div className="card-container">
          <div className="card-search">
            <div></div>
            <input 
              type="text"
              className="card-search-bar"
              placeholder="Search"
              value = {titleSearch}
              onChange={(e) => {
                setTitleSearch(e.target.value);
                setCurItems(items.filter(
                  (_cur, _i) => (_cur.title.toLowerCase().includes(e.target.value))
                ));
                setCurItems((cur) => cur ? [...cur].sort((a, b) => a.title.localeCompare(b.title)) : cur);
              }}
            />
          </div>
          {user?.id === GMid && (
            <button className='card-add-btn' onClick={toggleCreateMenu}>
              Create Item
            </button>
          )}
          {curItems?.map(curItems => (
            <Card key={curItems.id} item={curItems} setItems={setItems} toggleEditMenu={toggleEditMenu} />
          ))}
        </div>
        {createMenu && (
          <Item_Creator_Menu mode="create" title="Create a New Item" setItems={setItems} toggleCreateMenu={toggleCreateMenu} toggleEditMenu={toggleEditMenu}/>
        )}
        {editMenu && (
          <Item_Creator_Menu editItem={editItem} mode="edit" title="Edit Item" setItems={setItems} toggleCreateMenu={toggleCreateMenu} toggleEditMenu={toggleEditMenu}/>
        )}
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

function Item_Creator_Menu({ mode, title, editItem, setItems, toggleCreateMenu, toggleEditMenu }: { mode:string; title: string; editItem?: Item; setItems: React.Dispatch<React.SetStateAction<Item[]>>; toggleCreateMenu?: () => void; toggleEditMenu?: () => void  }) {
  const[draftItem, setDraftItem] = useState<{
    title: string;
    description: string;
    image: string | null;
    stats: {
      rarity: string;
      form: string;
      material: string;
      durability: string;
    };
    magicalProperties: {
      description: string;
      spellAffinities: string[];
      damageAffinities: string[];
      spellDisaffinities: string[];
      damageDisaffinities: string[];
    };
    alchemicalProperties: {
      description: string;
      dissolvesIn: string[];
      reactsWith: string[];
      reactions: string[];
      uses: string[];
      effects: string[];
    };
    spiritualProperties: {
      description: string;
      origin: string[];
      sacrificialValue: string;
    };
    specialProperties: {
      description: string;
      specialTrigger: string[];
      specialReactionDescription: string;
      specialReactionEffect: string;
    };
  }>({
    title: "",
    description: "",
    image: null,
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
      reactsWith: [""],
      reactions: [""], 
      uses: [""], 
      effects: [""], 
    },
    spiritualProperties: { 
      description: "",
      origin: ["natural"], 
      sacrificialValue: "none"
    },
    specialProperties:  { 
      description: "",
      specialTrigger: [""], 
      specialReactionDescription: "",
      specialReactionEffect: ""
    }
  })

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleAddSection(sectionType: string) {
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

  function handleRemoveSection(index: number, sectionType: string) {
    if (sectionType === "Reaction") {
      const currentReactants = draftItem.alchemicalProperties?.reactsWith || [];
      const currentReactions = draftItem.alchemicalProperties?.reactions || [];

      let newReactants = currentReactants.filter(
        (_reactant, i) => i !== index
      );

      let newReactions = currentReactions.filter(
        (_reaction, i) => i !== index
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
        (_use, i) => i !== index
      );

      let newEffects = currentEffects.filter(
        (_effect, i) => i !== index
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

  function handleUpdateRow(index: number, fieldType: string, newValue: string, sectionType: string) {
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

  function handleToggleAffinity(clickedAffinity: string) {
    const isSpell = Object.hasOwn(spellAffinityIcons, clickedAffinity);
    const affKey = isSpell ? "spellAffinities" : "damageAffinities";
    const disKey = isSpell ? "spellDisaffinities" : "damageDisaffinities";

    const currentAffinities: string[] = draftItem.magicalProperties[affKey] || [];
    const currentDisaffinities: string[] = draftItem.magicalProperties[disKey] || [];
    
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

      const { error: uploadError } = await supabase.storage
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
      setItems((prevItems) => 
        [...prevItems, data[0]]
      );
    }
  }

  async function handleUpdateItem() {
    console.log("Handle log item 2");
    let finalItemData = {...draftItem};

    if (imageFile) {
      const uniqueFileName = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
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

    if (editItem) {
      console.log("TARGET ID:", editItem.id, "| TYPE:", typeof editItem.id);
      const { data, error } = await supabase
        .from('items')
        .update(finalItemData)
        .eq('id', editItem.id)
        .select()

      if (error) {
        console.error("Error saving item to database:", error);
      } else {
        console.log("Successfully updated item!", data);
        setImageFile(null);
        setItems((prevItems) => 
          prevItems.map((existingItem) => 
            existingItem.id === editItem.id ? data[0] : existingItem
          )
        );

      }
    }
    else {
      console.error("Error saving item to database:", "no edit item");
      return;
    }
  }

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleBoxClick = () => {
    fileInputRef.current?.click();
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    if (editItem) {
      console.log(editItem.title);
      const tempItem = {
      title: editItem.title || "",
      description: editItem.description || "",
      image: editItem.image || null,
      stats: {
        rarity: editItem.stats?.rarity || "common",
        form: editItem.stats?.form || "solid",
        material: editItem.stats?.material || "wood",
        durability: editItem.stats?.durability || "poor"
      },
      magicalProperties: {
        description: editItem.magicalProperties?.description || "",
        spellAffinities: editItem.magicalProperties?.spellAffinities || [],
        damageAffinities: editItem.magicalProperties?.damageAffinities || [],
        spellDisaffinities: editItem.magicalProperties?.spellDisaffinities || [],
        damageDisaffinities: editItem.magicalProperties?.damageDisaffinities || []
      },
      alchemicalProperties: {
        description: editItem.alchemicalProperties?.description || "",
        dissolvesIn: editItem.alchemicalProperties?.dissolvesIn || ["alcohol"], 
        reactsWith: editItem.alchemicalProperties?.reactsWith || [""],
        reactions: editItem.alchemicalProperties?.reactions || [""], 
        uses: editItem.alchemicalProperties?.uses || [""], 
        effects: editItem.alchemicalProperties?.effects || [""], 
      },
      spiritualProperties: { 
        description: editItem.spiritualProperties?.description || "",
        origin: editItem.spiritualProperties?.origin || ["natural"], 
        sacrificialValue: editItem.spiritualProperties?.sacrificialValue || "none"
      },
      specialProperties:  { 
        description: editItem.specialProperties?.description || "",
        specialTrigger: editItem.specialProperties?.specialTrigger || [""], 
        specialReactionDescription: editItem.specialProperties?.specialReactionDescription || "",
        specialReactionEffect: editItem.specialProperties?.specialReactionEffect || ""
      }
      

    }
    setDraftItem(tempItem);
  }
  }, [])
  
  return (
    <div style={{'padding':'3rem'}}>
      <div className="menu-background"></div>
    <div className="menu-container">      
    <div className="menu-section" style={{'flexDirection':'row', 'justifyContent':'space-between'}}>
      <h2>{title}</h2>
      {mode === "create" && (
        <button className="menu-btn" onClick={(toggleCreateMenu)}>
          X
        </button>
      )}
      {mode != "create" && (
        <button className="menu-btn" onClick={(toggleEditMenu)}>
          X
        </button>
      )}
      
    </div>

    {/*Basic Properties*/}
    <div className="menu-section">
      <div className="menu-row-inline">
        <label>Item Title:</label>
        <input 
          className="small-input"
          type="text"
          placeholder='Title'
          value={draftItem.title} 
          onChange={(e) => setDraftItem({ 
            ...draftItem,
            title: e.target.value
          })} 
        />
      </div>

      <div className="menu-row-offline">
        <label>Item Description:</label>
        <div className="menu-row-inline">
          <textarea 
            className="dynamic-textarea"
            placeholder='Item Description'
            value={draftItem.description} 
            onChange={(e) =>{ 
              handleAutoResize(e);

              setDraftItem({ 
                ...draftItem,
                description: e.target.value
              })} 
            }
          />
        </div>
        
      </div>

      <div className="menu-row-offline">
        <label>Image:</label>
        <div style={{display:'flex', justifyContent: 'right', alignItems: 'right'}}>
            <input
              type="file"
              accept="image/png, image/jpg, image/webp"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            <div 
              onClick={handleBoxClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                width: '100px',
                aspectRatio: 1 / 1,
                border: isDragging ? '3px dashed #22c55e' : '3px dashed #922610',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                overflow: 'hidden'
              }}
            >
              {imageFile ? (
              <img 
                src={URL.createObjectURL(imageFile)} 
                alt="Preview" 
                className="menu-img-input" 
              />
            ) : (
              <div style={{ color: '#922610', fontFamily: 'bookmania' }}>
                <div style={{ fontSize: '5rem', margin:'0', lineHeight: '0.5', paddingTop: '1rem' }}>+</div>
              </div>
            )
            }
            </div>

        </div>
        
        
      </div>

      <div className="menu-row-inline">
        <label>Rarity:</label>
        <select 
          className="menu-dropdown"
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

      <div className="menu-row-inline">
        <label>Form:</label>
        <select 
          value={draftItem.stats.form} 
          className="menu-dropdown"
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

      <div className="menu-row-inline">
        <label>Material:</label>
        <select 
          value={draftItem.stats.material}
          className='menu-dropdown' 
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

      <div className="menu-row-inline">
        <label>Durability:</label>
        <select 
          value={draftItem.stats.durability} 
          className='menu-dropdown'
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
    </div>

    {/*Magical Properties*/}
    <div className="menu-section">
      <h4>Magical Properties</h4>
      <div className="menu-row-offline">
        <label>Magical Description:</label>
        <textarea 
          className="dynamic-textarea"
          placeholder="Magical Description"
          value={draftItem.magicalProperties.description} 
          onChange={(e) => {
            handleAutoResize(e);
            setDraftItem({ 
            ...draftItem,
            magicalProperties: {
              ...draftItem.magicalProperties,
              description: e.target.value
            }
          })}} 
        />
      </div>

      <div className="menu-row-offline">
        <label>Affinities:</label>
        
        <div className="icon-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {(Object.keys(damageAffinityIcons) as (keyof typeof damageAffinityIcons)[]).map((affinityName) => {
            
            const isSelected = (draftItem.magicalProperties.damageAffinities as string[] | undefined)?.includes(affinityName);
            const isDeselected = (draftItem.magicalProperties.damageDisaffinities as string[] | undefined)?.includes(affinityName);

            return (
              <div className="tooltip-container">
                <img 
                  key={affinityName}
                  src={damageAffinityIcons[affinityName]} 
                  alt={affinityName}
                  onClick={() => handleToggleAffinity(affinityName)}
                  
                  style={{ 
                    width: '40px', 
                    cursor: 'pointer',
                    padding: '.2rem',
                    backgroundColor: isSelected ? 'rgb(16, 146, 25, 0.3' : isDeselected ? 'rgb(146, 38, 16, 0.3': 'transparent',
                    opacity: (isSelected || isDeselected) ? 1 : 0.4,
                    border: isSelected ? '2px solid #109219' : isDeselected ? '2px solid #922610': '2px solid transparent',
                    borderRadius: '8px'
                  }}
                />
                <span className="tooltip-text">{affinityName}</span>
              </div>
              
            );
          })}
          {(Object.keys(spellAffinityIcons) as (keyof typeof spellAffinityIcons)[]).map((affinityName) => {
            
            const isSelected = (draftItem.magicalProperties.spellAffinities as string[] | undefined)?.includes(affinityName);
            const isDeselected = (draftItem.magicalProperties.spellDisaffinities as string[] | undefined)?.includes(affinityName);

            return (
              <div className="tooltip-container">
                <img 
                  key={affinityName}
                  src={spellAffinityIcons[affinityName]} 
                  alt={affinityName}
                  onClick={() => handleToggleAffinity(affinityName)}
                  
                  style={{ 
                    width: '40px', 
                    cursor: 'pointer',
                    padding: '.2rem',
                    backgroundColor: isSelected ? 'rgb(16, 146, 25, 0.3' : isDeselected ? 'rgb(146, 38, 16, 0.3': 'transparent',
                    opacity: (isSelected || isDeselected) ? 1 : 0.4,
                    border: isSelected ? '2px solid #109219' : isDeselected ? '2px solid #922610': '2px solid transparent',
                    borderRadius: '8px'
                  }}
                />
                <span className="tooltip-text">{affinityName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/*Alchemical Properties*/}
    <div className='menu-section'>
      <h4>Alchemical Properties</h4>
      <div className="menu-row-offline">
        <label>Alchemical Description:</label>
        <textarea 
          className='dynamic-textarea'
          placeholder='Alchemical Description'
          value={draftItem.alchemicalProperties.description} 
          onChange={(e) => {
            handleAutoResize(e);
            setDraftItem({ 
              ...draftItem,
              alchemicalProperties: {
                ...draftItem.alchemicalProperties,
                description: e.target.value
              }
          })}} 
        />
      </div>

      <div className="menu-row-inline">
        <label>Dissolves In:</label>
        <select
          className="menu-dropdown"
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

      <div className="menu-row-offline">
        <div className="menu-row-inline">
          <label>Alchemical Reactions:</label>
          <button type="button" className="menu-btn" onClick={() => handleAddSection("Reaction")}>
            +
          </button>
        </div>

        {draftItem.alchemicalProperties?.reactsWith?.map((reactantString, index) => {
          
          const matchingReactionString = draftItem.alchemicalProperties.reactions[index];

          return (
            <div key={index} style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              
              <input 
                type="text" 
                className="small-input"
                placeholder="Reaction caused by..."
                value={reactantString} 
                onChange={(e) => handleUpdateRow(index, 'reactant', e.target.value, "Reaction")}
              />

              <textarea 
                className="dynamic-textarea"
                placeholder="Reaction effect..."
                value={matchingReactionString}
                onChange={(e) => {handleAutoResize(e); handleUpdateRow(index, 'reaction', e.target.value, "Reaction")}}
              />

              <button type="button" className="menu-btn" onClick={() => handleRemoveSection(index, "Reaction")}>
                -
              </button>
              
            </div>
          );
        })}
      </div>

      <div className="field-group">
        <div className="menu-row-inline">
          <label>Alchemical Uses:</label>
          <button type="button" className="menu-btn" onClick={() => handleAddSection("Uses")}>
            +
          </button>
        </div>

        {draftItem.alchemicalProperties?.uses?.map((useString, index) => {
          
          const matchingUseString = draftItem.alchemicalProperties.effects[index];

          return (
            <div key={index} style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              
              <input 
                type="text" 
                className="small-input"
                placeholder="Used as..."
                value={useString} 
                onChange={(e) => handleUpdateRow(index, 'use', e.target.value, "Uses")}
              />

              <textarea 
                className="dynamic-textarea"
                placeholder="Use effect..."
                value={matchingUseString}
                onChange={(e) => {handleAutoResize(e); handleUpdateRow(index, 'effect', e.target.value, "Uses")}}
              />

              <button type="button" className="menu-btn" onClick={() => handleRemoveSection(index, "Uses")}>
                -
              </button>
              
            </div>
          );
        })}
      </div>
    </div>

    {/*Spiritual Properties*/}
    <div className="menu-section">
      <h4>Spiritual Properties</h4>
      <div className="menu-row-offline">
        <label>Spiritual Description:</label>
        <textarea 
          className='dynamic-textarea'
          value={draftItem.spiritualProperties.description}
          placeholder='Spiritual Description' 
          onChange={(e) =>{ 
            handleAutoResize(e);
            setDraftItem({ 
              ...draftItem,
              spiritualProperties: {
                ...draftItem.spiritualProperties,
                description: e.target.value
              }
          })}} 
        />
      </div>

      <div className="menu-row-inline">
        <label>Origin:</label>
        <select 
          value={draftItem.spiritualProperties.origin} 
          className='menu-dropdown'
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

      <div className="menu-row-inline">
        <label>Sacrificial Value:</label>
        <select 
          value={draftItem.spiritualProperties.sacrificialValue} 
          className="menu-dropdown"
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
    </div>

    {/*Special Properties*/}
    <div className="menu-section">
      <h4>Special Properties</h4>
    <div className="menu-row-offline">
      <label>Special Description:</label>
      <textarea 
        className="dynamic-textarea"
        value={draftItem.specialProperties.description}
        placeholder='Special Description' 
        onChange={(e) => {
          handleAutoResize(e);
          setDraftItem({ 
            ...draftItem,
            specialProperties: {
              ...draftItem.specialProperties,
              description: e.target.value
            }
        })}} 
      />
    </div>

    <div className="menu-row-offline">
      <label>Special Reaction Description:</label>
      <textarea 
        className="dynamic-textarea" 
        value={draftItem.specialProperties.specialReactionDescription} 
        placeholder='Special Reaction Description'
        onChange={(e) => {
          handleAutoResize(e);
          setDraftItem({ 
            ...draftItem,
            specialProperties: {
              ...draftItem.specialProperties,
              specialReactionDescription: e.target.value
            }
        })}} 
      />
    </div>

    <div className="menu-row-offline">
      <label>Special Reaction Effect:</label>
        <textarea 
        className="dynamic-textarea" 
          value={draftItem.specialProperties.specialReactionEffect} 
          placeholder='Special Reaction Effect'
          onChange={(e) => {
            handleAutoResize(e);
            setDraftItem({ 
              ...draftItem,
              specialProperties: {
                ...draftItem.specialProperties,
                specialReactionEffect: e.target.value
              }
          })}} 
        />
      </div>
    </div>
    
    <button className="menu-btn-submit" onClick={() => {
      if (mode === "create") {
        handleSubmitItem();
        toggleCreateMenu?.();
      }
      else {
        handleUpdateItem();
        toggleEditMenu?.();
      }
      }}>
      Submit
    </button>
    </div>
    </div>
    
    
  );
}

export { Item_List, Item_Creator, Item_Creator_Menu }
