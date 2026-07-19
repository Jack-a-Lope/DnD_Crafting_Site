import React, { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient.tsx'
import { useAuth } from './Auth_Context';
import './Object_Type_Creator.css'
import * as Object from './Object_Definitions.tsx'

const defaultStyle: Object.StyleDetails = {
    borderColor: '#922610',
    h2Font: 'modesto-text',
    h2Size: 24,
    h4Font: 'modesto-text',
    h4Size: 18,
    pFont: 'bookmania',
    pSize: 16,
    pColor: '#4b5563',
    backgroundImage: '',
    backgroundColor: '#ffffff',
};

const defaultBlueprint: Object.Type = {
    id: -1,
    title: 'Title',
    sections: [],
    style: defaultStyle,
};

const defaultField: Object.Field = {
    id: -1,
    title: "Field Name",
    config: {
        type: "text_box",
        details: {
            maxLength: 255,
            multiline: true
        }
    }
}

const defaultSection: Object.Section = {
    id: -1,
    title: "Section Name",
    fields: [],
    startRevealed: true
}

function Field_Title({sec, field, updateFieldConfig}: {
    sec: Object.Section,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
}) {
    if (field.config.type !== "title") {
        return null;
    }
    const details = field.config.details as Object.TitleDetails;
    return (<>
        <div className='field-wrapper'>
            <div className='field-line'>
                <input 
                    className="small-input"
                    value={details.defaultTitle}
                    placeholder='Default Title'
                    onChange={(e) => {
                        updateFieldConfig(sec.id, field.id, {
                            type: "title",
                            details: {
                                ...details,
                                defaultTitle: e.target.value,
                            }
                        });
                    }}
                />
            </div>
        </div>
    </>)
}

function Field_Subtitle({sec, field, updateFieldConfig}: {
    sec: Object.Section,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
}) {
    if (field.config.type !== "subtitle") {
        return null;
    }
    const details = field.config.details as Object.SubtitleDetails;
    return (<>
        <div className='field-wrapper'>
            <div className='field-line'>
                <input 
                    className="small-input"
                    value={details.defaultText}
                    placeholder='Default Subtitle'
                    onChange={(e) => {
                        updateFieldConfig(sec.id, field.id, {
                            type: "subtitle",
                            details: {
                                ...details,
                                defaultText: e.target.value,
                            }
                        });
                    }}
                />
            </div>
        </div>
    </>)
}

function Field_Textbox({sec, field, updateFieldConfig}: {
    sec: Object.Section,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
}) {
    if (field.config.type !== "text_box") {
        return null;
    }
    const details = field.config.details as Object.TextBoxDetails;
    return (<>
        <div className='field-wrapper'>
            <div className='field-line'>
                <h4>{field.title}:</h4>
                <textarea 
                    className="dynamic-textarea"
                    placeholder="Example Text Box"
                    onChange={(e) => {
                        updateFieldConfig(sec.id, field.id, {
                            type: "subtitle",
                            details: {
                                ...details,
                                defaultText: e.target.value,
                            }
                        });
                    }}
                />
            </div>
        </div>
    </>)
}

function Field_Dropdown({sec, field, updateFieldConfig}: {
    sec: Object.Section,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
}) {
    if (field.config.type !== "dropdown") {
        return null;
    }
    const details = field.config.details as Object.DropdownDetails;
    return (<>
        <div className='field-wrapper'>
            <div className='field-line'>
                <h4>Dropdown Options: </h4>
                {/* 
                    What was I doing? - Adding in all of the field types.
                        - Then work on how to allow customization of the
                            arrangement of sections (something like making the
                            add button 4-way directional and allow dragging
                            and dropping to swap locations / delete and recreate
                            in a new place)
                    Add in dropdown options. 
                    Probably map through them with a button to add them.
                    A set of small inputs with the Options numbered on the lh side
                */}
            </div>
        </div>
    </>)
}

function Menu_Field({ sec, field, updateFieldTitle, updateFieldConfig, removeField }: { 
    sec: Object.Section,
    field: Object.Field, 
    updateFieldTitle: (sectionId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
    removeField: (sectionId: number, fieldId: number) => void 
}) {
    const renderFieldConfig = () => {
        switch (field.config.type) {
            case "title":
                return <Field_Title sec={sec} field={field} updateFieldConfig={updateFieldConfig}/>
            case "subtitle":
                return <Field_Subtitle sec={sec} field={field} updateFieldConfig={updateFieldConfig}/>
            case "text_box":
                return <Field_Textbox sec={sec} field={field} updateFieldConfig={updateFieldConfig}/>
            case "dropdown":
                return <Field_Dropdown sec={sec} field={field} updateFieldConfig={updateFieldConfig}/>
        }
    }

    return (<>
        <div className="section-wrapper field">
            <div className='section-primary'>
                <div className="section-row">
                    <h3>Field Name: </h3>
                    <input 
                    className="small-input"
                    value={field.title}
                    placeholder='Field Name'
                    onChange={(e) => {
                        updateFieldTitle(sec.id, field.id, e.target.value);
                    }}
                />
                </div>
                <div style={{display:'flex', flexDirection:"column", margin:"0rem .5rem", gap:".2rem"}}>
                    <div className='section-row fields'>
                        <h3>Field Type: </h3>
                        <select
                            className='menu-dropdown section'
                            value={field.config.type}
                            onChange={(e) => updateFieldConfig(sec.id, field.id, {...field.config, type: e.target.value as any})}
                        >
                            {[
                                { value: 'title', label: "Title" }, 
                                { value: 'subtitle', label: "Subtitle" }, 
                                { value: 'text_box', label: "Text Box" }, 
                                { value: 'dropdown', label: "Dropdown" },
                                { value: 'toggle', label: "Toggle" },
                                { value: 'toggle_list', label: "Toggle List"}, 
                                { value: 'image', label: "Image" }, 
                                { value: 'var_len', label: "Custom" },
                            ].map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    {renderFieldConfig()}
                </div>
                
            </div>
            <img 
                className="menu-btn-icon object" 
                src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/trashIcon.png"
                onClick={() => removeField(sec.id, field.id)} 
            />
        </div>
    </>)
}

function Menu_Section({ sec, updateSectionTitle, removeSection, updateFieldTitle, updateFieldConfig, removeField, addField }: { 
    sec: Object.Section, 
    updateSectionTitle: (sectionId: number, newTitle: string) => void, 
    removeSection: (sectionId: number) => void,
    updateFieldTitle: (sectionId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
    removeField: (sectionId: number, fieldId: number) => void,
    addField: (sectionId: number, newField: Object.Field) => void }) {

    return (<>
        <div className="section-wrapper">
            <div className="section-primary">
                <div className='section-row'>
                    <input 
                        className='small-input'
                        value = {sec.title}
                        onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                    />
                    <div>
                        <img 
                            className="menu-btn-icon object positive" 
                            src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/plusIcon.png"
                            onClick={() => addField(sec.id, defaultField)}
                        />
                        <img 
                            className="menu-btn-icon object" 
                            src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/trashIcon.png"
                            onClick={() => removeSection(sec.id)}
                        />
                    </div>
                </div>
                
                {sec.fields.map((field) => (
                    <Menu_Field 
                        key={field.id}
                        sec={sec}
                        field={field}
                        updateFieldTitle={updateFieldTitle}
                        updateFieldConfig={updateFieldConfig}
                        removeField={removeField}
                    />
                ))}
            </div>
        </div>
        
    </>)
}

export function Blueprint_Menu() {
    const [blueprint, setBlueprint] = useState<Object.Type>(defaultBlueprint);

    {/* Helper Functions */}
    function addSection() {
        setBlueprint((prev) => {
            const uniqueId = Date.now();
            const newSection: Object.Section = {
                ...defaultSection,
                id: uniqueId
            }
            return {
                ...prev,
                sections: [...prev.sections, newSection]
            }
        })
    }

    function removeSection(sectionId: number) {
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.filter((section) => (section.id !== sectionId))
        }))
    }

    function addField(sectionId: number, newField: Object.Field = defaultField) {
        console.log("Add Field id: ", sectionId);
        setBlueprint((prev) => {
            const uniqueFieldId = Date.now();
            
            const fieldWithId = {
                ...newField,
                id: uniqueFieldId
            };
            return {
                ...prev,
                sections: prev.sections.map((section) =>
                    section.id === sectionId
                    ? { ...section, fields: [...section.fields, fieldWithId] }
                    : section
                )
            }
        })
    }

    function removeField(sectionId: number, fieldId: number) {
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                ? { ...section, fields: section.fields.filter((field) => (field.id !== fieldId)) }
                : section
            )
        }))
    }

    function updateFieldConfig(sectionId: number, fieldId: number, newConfig: Object.FieldDefinition) {
        setBlueprint((prev) => {
            return {
                ...prev,
                sections: prev.sections.map((section) =>
                    section.id === sectionId
                    ? { ...section, fields: section.fields.map((field) => 
                        field.id === fieldId
                        ? {...field, config: newConfig}
                        : field
                    ) }
                    : section
                )
            }
        })
    }

    function updateBlueprintTitle(newTitle: string) {
        setBlueprint((prev) => ({
            ...prev,
            title: newTitle
        }));
    }

    function updateSectionTitle(sectionId: number, newTitle: string) {
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => 
                section.id === sectionId
                ? {...section, title: newTitle}
                : section
            )
        }))
    }

    function updateFieldTitle(sectionId: number, fieldId: number, newTitle: string) {
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => 
            section.id === sectionId
            ? {...section, fields: section.fields.map((field) => 
                field.id === fieldId
                ? {...field, title: newTitle}
                : field
            )}
            : section
            )
        }))
    }

    return (<>

        <div className="blueprint-wrapper">
            <div className='blueprint-container'>
                <p>Text</p>
                <input 
                    value = {blueprint.title}
                    onChange={(e) => updateBlueprintTitle(e.target.value)}
                />
                <button onClick={addSection}>
                    Add Section
                </button>
                {blueprint.sections.map((sec) => (
                    <Menu_Section 
                        key={sec.id}
                        sec={sec}
                        updateSectionTitle={updateSectionTitle}
                        removeSection={removeSection}
                        updateFieldTitle={updateFieldTitle}
                        updateFieldConfig={updateFieldConfig}
                        removeField={removeField}
                        addField={addField}
                     />
                ))}
            </div>
        </div>
    </>)
}

