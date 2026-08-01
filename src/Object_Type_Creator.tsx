import React, { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient.tsx'
import { useAuth } from './Auth_Context';
import { DragOverlay, DndContext, pointerWithin, type DragEndEvent } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';import './Object_Type_Creator.css';
import { evaluate } from 'mathjs';
import * as Object from './Object_Definitions.tsx'
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

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
    title: "",
    variableName: "",
    customVariableName: false,
    config: {
        type: "text_box",
        details: {
            maxLength: 255,
            multiline: true,
            placeholder: "placeholder text",
        }
    },
    dimensions: {
        width: 100,
        height: 100
    }
}

const defaultRow: Object.Row = {
    id: -1,
    fields: [],
}

const defaultSection: Object.Section = {
    id: -1,
    title: "Section Name",
    rows: [defaultRow],
    startRevealed: true
}

const fieldTypes = [
    { value: 'title', label: "Title" }, 
    { value: 'subtitle', label: "Subtitle" }, 
    { value: 'text_box', label: "Text Box" }, 
    { value: 'dropdown', label: "Dropdown" },
    { value: 'toggle', label: "Toggle" },
    { value: 'toggle_list', label: "Toggle List"}, 
    { value: 'image', label: "Image" }, 
    { value: 'numeric', label: "Numeric" },
    { value: 'var_len', label: "Custom" },
] as const;

function generateDefaultConfig(newType: string): Object.FieldDefinition {
    switch (newType) {
        case "title":
            return { type: "title", details: { defaultTitle: "" } };
        case "subtitle":
            return { type: "subtitle", details: { defaultText: "" } };
        case "text_box":
            return { type: "text_box", details: { maxLength: 255, multiline: true, placeholder: "placeholder text" } };
        case "dropdown":
            return { type: "dropdown", details: { options: [], defaultOption: "" } };
        case "numeric":
            return { type: "numeric", details: { defaultValue: 0, allowNegative: false, isPercentage: false, isFormula: false, directlyModifiable: true, formulaString: "" } };
        default:
            return { type: "title", details: { defaultTitle: "" } };
    }
}

function Field_Display_Title({field}: {field: Object.Field}) {
    if (field.config.type !== "title") {
        return null;
    }
    return (<>
        <div className='field-wrapper'>
            <div className='field-line'>
                <h2>{field.config.details.defaultTitle || "Default Title"}</h2>
            </div>
        </div>
    </>)
}

function Field_Config_Title({sec, row, field, updateFieldConfig}: {
    sec: Object.Section,
    row: Object.Row,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
}) {
    if (field.config.type !== "title") {
        return null;
    }
    const details = field.config.details as Object.TitleDetails;
    return (<>
        <p>Default Title: </p>
        <input 
            className="small-input"
            value={details.defaultTitle}
            placeholder='Default Title'
            onChange={(e) => {
                updateFieldConfig(sec.id, row.id, field.id, {
                    type: "title",
                    details: {
                        ...details,
                        defaultTitle: e.target.value,
                    }
                });
            }}
        /> 
        
    </>)
}

function Field_Subtitle({sec, row, field, updateFieldConfig}: {
    sec: Object.Section,
    row: Object.Row,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
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
                        updateFieldConfig(sec.id, row.id, field.id, {
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

function Field_Display_Textbox({field}: {field: Object.Field}) {
    if (field.config.type !== "text_box") {
        return null;
    }
    return (<>
        <div className='field-wrapper'>
            <div className='field-val'>
                <h4>{field.title}:</h4>
                <p>{field.config.details.placeholder}</p>
            </div>
        </div>
    </>)
}

function Field_Config_Textbox({sec, row, field, updateFieldConfig}: {
    sec: Object.Section,
    row: Object.Row,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
}) {
    if (field.config.type !== "text_box") {
        return null;
    }
    const details = field.config.details as Object.TextBoxDetails;
    return (<>
        <p>Textbox Placeholder:</p>
        <textarea 
            className="dynamic-textarea"
            placeholder={field.title.toLocaleLowerCase()}
            value={field.config.details.placeholder}
            onChange={(e) => {
                updateFieldConfig(sec.id, row.id, field.id, {
                    type: "text_box",
                    details: {
                        ...details,
                        placeholder: e.target.value
                    }
                });
            }}
        />
    </>)
}

function Field_Display_Dropdown({ field }: { field: Object.Field }) {
    if (field.config.type !== "dropdown") {
        return null;
    }
    const details = field.config.details as Object.DropdownDetails;
    const [displayOpt, setDisplayOpt] = useState<string>(details.defaultOption)
    return (<>
        <div className='field-wrapper'>
            <div className='field-line'>
                <h4>Dropdown Options: </h4>
                <select
                    value={displayOpt}
                    className='menu-dropdown'
                    onChange={(e) => {
                        setDisplayOpt(e.target.value)
                    }}
                >
                    {details.options.length > 0 ? details.options.map(opt => 
                        <option value={opt}>{opt}</option>
                    ) :
                        <option/>
                    }
                </select>
            </div>
        </div>
    </>)
}

function Field_Config_Dropdown({sec, row, field, updateFieldConfig}: {
    sec: Object.Section,
    row: Object.Row,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
}) {
    if (field.config.type !== "dropdown") {
        return null;
    }
    const details = field.config.details as Object.DropdownDetails;
    return (<>
        <div className='field-wrapper'>
            <div className='field-line'>
                <h4>Dropdown Options: </h4>
                <div
                    onClick={() => 
                        updateFieldConfig( sec.id, row.id, field.id, {
                            type: 'dropdown',
                            details: {
                                ...details,
                                options: [
                                    ...details.options,
                                    `Option ${details.options.length}`
                                ]
                            }
                        })
                    }
                >
                    <h2>+</h2>
                </div>
            </div>
            {details.options.map((opt, index) => 
                <div className='field-line'>
                    <div 
                        onClick={() => {
                            const filteredOptions = details.options.filter((_, i) => i !== index);
                            
                            updateFieldConfig(sec.id, row.id, field.id, {
                                type: 'dropdown',
                                details: {
                                    ...details,
                                    options: filteredOptions
                                }
                            });
                        }}
                    >
                        <h2>X</h2>
                    </div>
                    <input
                        className='small-input'
                        value={opt}
                        onChange={(e) => {
                            const newOptions = [...details.options];
                            newOptions[index] = e.target.value;

                            updateFieldConfig(sec.id, row.id, field.id, {
                                type: 'dropdown',
                                details: {
                                    ...details,
                                    defaultOption: newOptions.length > 0 ? newOptions[0] : '',
                                    options: newOptions
                                }
                            })
                        }}
                    >
                    </input>
                </div>
            )}
        </div>
    </>)
}

{/*
    Then I was going to go in and add a few more fields before setting up the cosmetic
    and layout options.
        Toggles / list of toggles
        images
        variable size boxes that can be dragged to resize
        divider bars
        toggle for text alignment and row/column format
        customize colors, background, border style, fonts and more
            Probably create a tab for object themes with customizable
                h1 - h4, p, color swatches, border styles, bg images etc
                
    Add in the ability to switch which view (Form or Display is being shown)
        Display should have options for fully extended, condensed and collapsed
    Then I need to set up the database side of this and the ability to save the
    workspace.
    Then I need to set up the use of the formula and the custom fields
    Then I need to add in quality of life features like ctrl + c/x/v/z and maybe zooming
        Also when I add in the hiding buttons
    Then maybe add in the ability to save element snippits and create a default library
    to make my life easier
    
*/}
function Field_Display_Numeric({field, formulas}: {field: Object.Field, formulas: Record<string, number>}) {
    if (field.config.type !== "numeric") {
        return null;
    }
    const details = field.config.details as Object.NumericDetails;
    return (<>
        <div className='field-wrapper'>
            <div className='field-val'>
                <div className='field-line'>
                    <h4>{field.title}:</h4>
                    <img 
                        src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/duplicateIcon.png"
                        alt="Copy"
                        className="menu-btn-icon object"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(field.variableName.toString());
                        }}
                    />
                </div>
                {details.isFormula ? 
                    <div>
                        <p>
                            {(() => {
                                try {
                                    const rawResult = evaluate(details.formulaString, formulas);
                                    const safeNum = Number(rawResult);
                                    if (!isNaN(safeNum)) {
                                        return safeNum;
                                    } else {
                                        return 0;
                                    }
                                }
                                catch (error) {
                                    console.error("Error evaluating formula:", error);
                                    console.log("Formulas:", formulas);
                                    return 0;
                                }
                            })()}
                        </p>
                    </div> 
                    : 
                    <div>
                        <p>{details.defaultValue}</p>
                    </div>
                }
            </div>
        </div>
    </>)
}

function Field_Config_Numeric({sec, row, field, updateFieldConfig, updateNumericVal, updateFieldVariableName, variableNameExists}: {
    sec: Object.Section,
    row: Object.Row,
    field: Object.Field,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void,
    updateNumericVal: (fieldVarName: string, fieldVal: number) => void,
    updateFieldVariableName: (sectionId: number, rowId: number, fieldId: number, newVariableName: string) => void,
    variableNameExists: (variableName: string) => boolean
}) {
    if (field.config.type !== "numeric") {
        return null;
    }
    const details = field.config.details as Object.NumericDetails;
    const [fieldVarName, setFieldVarName] = useState<string>(field.variableName);
    const [errorMessage, setErrorMessage] = useState<boolean>(false);

    useEffect(() => {
        setFieldVarName(field.variableName);
        setErrorMessage(false);
    }, [field.id]);
    return (<>
        <div className='field-line'>
            <p>Variable Name:</p>
            <div className='field-line' style={{flexDirection: 'column', alignItems: 'flex-end', padding: '0rem', gap: '0rem'}}>
                <input 
                    className='small-input'
                    type='text'
                    value={fieldVarName}
                    style={{ width: '100%'}}
                    onChange={(e) => {
                        const typedValue = e.target.value;
                        setFieldVarName(typedValue);
                        
                        if (typedValue !== field.variableName && variableNameExists(typedValue)) {
                            setErrorMessage(true);

                        } else {
                            setErrorMessage(false);
                            updateFieldVariableName(sec.id, row.id, field.id, typedValue);
                        }
                    }}
                />
                {errorMessage && (
                    <p className="error-message">
                        *Variable name already exists. Please choose a different name.
                    </p>
                )}
            </div>
            
        </div>
        <div className="field-line">
            <p>Allow Negative:</p>
            <div 
                className={`custom-toggle ${details.allowNegative ? 'active' : ''}`}
                onClick={() => {
                    updateFieldConfig(sec.id, row.id, field.id, {
                        type: "numeric",
                        details: {
                            ...details,
                            allowNegative: !details.allowNegative
                        }
                    });
                }}
            >
                <div className="toggle-knob"></div>
            </div>
        </div>
        <div className="field-line">
            <p>As Percentage:</p>
            <div 
                className={`custom-toggle ${details.isPercentage ? 'active' : ''}`}
                onClick={() => {
                    updateFieldConfig(sec.id, row.id, field.id, {
                        type: "numeric",
                        details: {
                            ...details,
                            isPercentage: !details.isPercentage
                        }
                    });
                }}
            >
                <div className="toggle-knob"></div>
            </div>
        </div>
        <div className="field-line">
            <p>Formula:</p>
            <div 
                className={`custom-toggle ${details.isFormula ? 'active' : ''}`}
                onClick={() => {
                    updateFieldConfig(sec.id, row.id, field.id, {
                        type: "numeric",
                        details: {
                            ...details,
                            isFormula: !details.isFormula
                        }
                    });
                }}
            >
                <div className="toggle-knob"></div>
            </div>
        </div>
        <div className="field-line">
            <p>Directly Modifiable:</p>
            <div 
                className={`custom-toggle ${details.directlyModifiable ? 'active' : ''}`}
                onClick={() => {
                    updateFieldConfig(sec.id, row.id, field.id, {
                        type: "numeric",
                        details: {
                            ...details,
                            directlyModifiable: !details.directlyModifiable
                        }
                    });
                }}
            >
                <div className="toggle-knob"></div>
            </div>
        </div>
        {details.isFormula ? 
            <div>
                <p>Formula: </p>
                <textarea 
                    className="dynamic-textarea"
                    placeholder='Formula'
                    value={field.config.details.formulaString}
                    style={{ marginTop: '.5rem', alignSelf: 'right'}}
                    onChange={(e) => {
                        updateFieldConfig(sec.id, row.id, field.id, {
                            type: "numeric",
                            details: {
                                ...details,
                                formulaString: e.target.value
                            }
                        });
                        updateNumericVal(field.variableName, Number(e.target.value));
                    }}
                />
            </div> 
            : 
            <div className='field-line'>
                <p>Default Value:</p>
                <input 
                    className='small-input'
                    type='number'
                    value={details.defaultValue}
                    style={{ marginTop: '.5rem'}}
                    onChange={(e) => {
                        updateFieldConfig(sec.id, row.id, field.id, {
                            type: "numeric",
                            details: {
                                ...details,
                                defaultValue: Number(e.target.value)
                            }
                        });
                        updateNumericVal(field.variableName, Number(e.target.value));
                    }}
                />
            </div>
        }
    </>)
}

function Menu_Field({ sec, row, field, isOverlay, isFloating, formulas, updateFieldTitle, updateFieldConfig, removeField, setCurField }: { 
    sec: Object.Section,
    row: Object.Row,
    field: Object.Field, 
    isOverlay: boolean,
    isFloating: boolean,
    formulas: Record<string, number>,
    updateFieldTitle: (sectionId: number, rowId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
    removeField: (sectionId: number, rowId: number, fieldId: number) => void,
    setCurField: (sectionId: number, rowId: number, fieldId: number) => void
}) {

    const renderFieldConfig = () => {
        switch (field.config.type) {
            case "title":
                return <Field_Display_Title field={field}/>
            case "subtitle":
                return <Field_Subtitle sec={sec} row={row} field={field} updateFieldConfig={updateFieldConfig}/>
            case "text_box":
                return <Field_Display_Textbox field={field} />
            case "dropdown":
                return <Field_Display_Dropdown field={field} />
            case "numeric":
                return <Field_Display_Numeric field={field} formulas={formulas} />
        }
    }

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: field.id,
        transition: {
            duration: 350,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }
    });

    const style = isOverlay ? {
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0px 15px 30px rgba(0,0,0,0.2)',
        backgroundColor: "#ffffffAA",
        cursor: 'grabbing'
    } : {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 1,
        position: isDragging ? "relative" : ("static" as any), 
        opacity: isDragging ? 0 : 1,
        backgroundColor: isDragging? "#ffffff" : "#ffffff00",
        borderRadius: isDragging? "8px" : "0px",

        ...(isFloating && {
            width: '320px',
            height: 'max-content',
            backgroundColor: '#fff1e0',
            borderRadius: '8px',
            boxShadow: '0px 10px 20px rgba(0,0,0,0.15)', // Slightly softer shadow than the dragged item
        })
    }

    return (<>
        <div 
            ref={isOverlay ? null : setNodeRef}
            style={style} 
            className="section-wrapper field"
            onClick={() => {
                setCurField(sec.id, row.id, field.id);
            }}
        >
            <div {...(isOverlay ? {} : attributes)} {...(isOverlay ? {} : listeners)} style={{ cursor: 'grab', padding: '.2rem' }}>
                ⠿
            </div>
            <div className='section-primary'>
                <div style={{display:'flex', flexDirection:"column", margin:"0rem .5rem", gap:".2rem"}}>
                    {renderFieldConfig()}
                </div>
                
            </div>
            <img 
                className="menu-btn-icon object" 
                src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/trashIcon.png"
                onClick={(e) => {
                    e.stopPropagation();
                    removeField(sec.id, row.id, field.id);
                }}
            />
        </div>
    </>)
}

function Menu_Row({ sec, row, formulas, updateSectionTitle, removeSection, updateFieldTitle, updateFieldConfig, setCurField, removeField, addField }: { 
    sec: Object.Section,
    row: Object.Row,
    formulas: Record<string, number>,
    updateSectionTitle: (sectionId: number, newTitle: string) => void, 
    removeSection: (sectionId: number) => void,
    updateFieldTitle: (sectionId: number, rowId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void,
    setCurField: (sectionId: number, rowId: number, fieldId: number) => void,
    removeField: (sectionId: number, rowId: number, fieldId: number) => void,
    addField: (sectionId: number, rowId: number, newField: Object.Field) => void }) {

    const { setNodeRef, isOver } = useDroppable({
        id: row.id,
    });

    const {over} = useDndContext();
    const isHovered = over?.id === row.id || row.fields.some(f => f.id === over?.id);

    return (<>
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
                    onClick={() => addField(sec.id, row.id, defaultField)}
                />
                <img 
                    className="menu-btn-icon object" 
                    src="https://xjcrdrkyydhthtulirlv.supabase.co/storage/v1/object/public/item-images/trashIcon.png"
                    onClick={() => removeSection(sec.id)}
                />
            </div>
        </div>

        <SortableContext
            items={row.fields.map(field => field.id)}
            strategy={rectSortingStrategy}
        >
            <div 
                ref={setNodeRef} 
                className={`row-field-list ${isHovered ? 'is-drag-over' : ''}`}
            >
                {row.fields.map((field) => (
                    <Menu_Field 
                        key={field.id}
                        sec={sec}
                        row={row}
                        field={field}
                        isOverlay={false}
                        isFloating={false}
                        formulas={formulas}
                        updateFieldTitle={updateFieldTitle}
                        updateFieldConfig={updateFieldConfig}
                        setCurField={setCurField}
                        removeField={removeField}
                    />
                ))}
            </div>
        </SortableContext>
        
        
        
    </>)
}

function Menu_Section({ sec, formulas, updateSectionTitle, removeSection, updateFieldTitle, updateFieldConfig, setCurField, removeField, addField }: { 
    sec: Object.Section, 
    formulas: Record<string, number>,
    updateSectionTitle: (sectionId: number, newTitle: string) => void, 
    removeSection: (sectionId: number) => void,
    updateFieldTitle: (sectionId: number, rowId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void,
    setCurField: (sectionId: number, rowId: number, fieldId: number) => void,
    removeField: (sectionId: number, rowId: number, fieldId: number) => void,
    addField: (sectionId: number, rowId: number, newField: Object.Field) => void }) {

    return (<>
        <div className="section-wrapper">
            <div className="section-primary">
                {sec.rows.map((row) => (
                    <Menu_Row
                        key={row.id}
                        sec={sec}
                        row={row}
                        formulas={formulas}
                        updateSectionTitle={updateSectionTitle}
                        removeSection={removeSection}
                        updateFieldTitle={updateFieldTitle}
                        updateFieldConfig={updateFieldConfig}
                        setCurField={setCurField}
                        removeField={removeField}
                        addField={addField}
                    />
                ))}
            </div>
        </div>
        
    </>)
}

export function Blueprint_Menu() {
    const [blueprint, setBlueprint] = useState<Object.Type>(defaultBlueprint);
    const [activeField, setActiveField] = useState<Object.Field | null>(null);
    const [floatingFields, setFloatingFields] = useState<{field: Object.Field, x: number, y: number}[]>([]);
    const workAreaRef = useRef<HTMLDivElement>(null);
    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
    const [isDisplayMode, setIsDisplayMode] = useState<boolean>(false);
    const [curSheetValues, setCurSheetValues] = useState<{ [key: string]: number }>({});
    
    {/* Helper Functions */}
    function addSection() {
        setBlueprint((prev) => {
            const uniqueId = Date.now();
            const uniqueRowId = Date.now();
            const newSection: Object.Section = {
                ...defaultSection,
                id: uniqueId,
                rows: [{ ...defaultRow, id: uniqueRowId }]
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

    function addRow(sectionId: number) {
        setBlueprint((prev) => {
            const uniqueRowId = Date.now();
            const rowWithId = {
                ...defaultRow,
                id: uniqueRowId
            }

            return {
                ...prev,
                sections: prev.sections.map((section) =>
                    section.id === sectionId
                        ? { ...section, rows: [...section.rows, rowWithId] }
                        : section
                )
            }
        })
    }

    function removeRow(sectionId: number, rowId: number) {
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? { ...section, rows: section.rows.filter((row) => row.id !== rowId) }
                    : section
            )
        }))
    }

    function addField(sectionId: number, rowId: number, newField: Object.Field = defaultField) {
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
                    ? { ...section, rows: section.rows.map((row) =>
                        row.id === rowId
                        ? { ...row, fields: [...row.fields, fieldWithId]}
                        : row
                    ) }
                    : section
                )
            }
        })
    }

    function removeField(sectionId: number, rowId: number, fieldId: number) {
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                ? {
                    ...section,
                    rows: section.rows.map((row) =>
                        row.id === rowId
                        ? { ...row, fields: row.fields.filter((field) => field.id !== fieldId) }
                        : row
                    )
                }
                : section
            )
        }))
    }

    function updateFieldConfig(sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) {
        setBlueprint((prev) => {
            return {
                ...prev,
                sections: prev.sections.map((section) =>
                    section.id === sectionId
                    ? { ...section, rows: section.rows.map((row) => 
                        row.id === rowId
                        ? { ...row, fields: row.fields.map((field) => 
                            field.id === fieldId
                            ? {...field, config: newConfig}
                            : field
                        ) }
                        : row
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

    function updateFieldTitle(sectionId: number, rowId: number, fieldId: number, newTitle: string) {
        const targetSection = blueprint.sections.find(s => s.id === sectionId);
        const targetRow = targetSection?.rows.find(r => r.id === rowId);
        const targetField = targetRow?.fields.find(f => f.id === fieldId);
        console.log(targetField?.customVariableName);
        
        const oldVariableName = targetField?.variableName;
        const newVariableName = newTitle.toLowerCase().replace(/\s+/g, '_');
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => 
            section.id === sectionId
            ? {...section, rows: section.rows.map((row) => 
                row.id === rowId
                ? {...row, fields: row.fields.map((field) => 
                    field.id === fieldId && !targetField?.customVariableName
                    ? {...field, title: newTitle, variableName: newVariableName}
                    :  field.id === fieldId && targetField?.customVariableName
                    ? {...field, title: newTitle}
                    : field
                )}
                : row
            )}
            : section
            )
        }))
        if (oldVariableName && oldVariableName !== newVariableName && !targetField?.customVariableName) {
            setCurSheetValues((prevVals) => {
                const newVals = { ...prevVals };
                const existingValue = newVals[oldVariableName] || 0; 
                
                delete newVals[oldVariableName]; 
                newVals[newVariableName] = existingValue; 
                
                return newVals;
            });
        }
    }

    function updateFieldVariableName(sectionId: number, rowId: number, fieldId: number, newVariableName: string) {
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => 
                section.id === sectionId
                ? {...section, rows: section.rows.map((row) => 
                    row.id === rowId
                    ? {...row, fields: row.fields.map((field) => 
                        field.id === fieldId
                        ? {...field, variableName: newVariableName, customVariableName: true}
                        : field
                    )}
                    : row
                )}
                : section
            )
        }))
    }

    function findLocation(searchId: number) {
        const id = Number(searchId);

        const floatingIndex = floatingFields.findIndex(f => f.field.id === id);
        if (floatingIndex !== -1) {
            return { isFloating: true, index: floatingIndex, field: floatingFields[floatingIndex].field }
        }

        for (const section of blueprint.sections) {
            for (const row of section.rows) {
                if (row.id === id) {
                    return { sectionId: section.id, rowId: row.id, index: row.fields.length, isRow: true}
                }

                const fieldIndex = row.fields.findIndex(f => f.id === id);
                if (fieldIndex !== -1) {
                    return { sectionId: section.id, rowId: row.id, index: fieldIndex, field: row.fields[fieldIndex], isRow: false}
                }
            }
        }
        return null;
    }

    function handleDragStart(event: any) {
        const { active } = event;
        const location = findLocation(active.id);
        if (location && location.field) {
            setActiveField(location.field as Object.Field);
        }
    }

    function handleDragOver(event: any) {
        const {active, over} = event;

        if (!over || active.id === over.id) {
            return; {/* When the user drops it outside the area */}
        }

        const source = findLocation(active.id as number);
        const destination = findLocation(over.id as number);

        if (!source || !destination || !source.field) return;

        if (source.isFloating && !destination.isFloating) {
            setFloatingFields(prev => prev.filter(f => f.field.id !== active.id))
            setBlueprint(prev => ({
                ...prev,
                sections: prev.sections.map(sec => 
                    sec.id === destination.sectionId
                    ? {
                        ...sec,
                        rows: sec.rows.map(row => { 
                            if (row.id === destination.rowId) {
                                const newFields = [...row.fields];
                                const insertIndex = destination.isRow ? 0 : destination.index;
                                newFields.splice(insertIndex, 0, source.field as Object.Field);
                                return { ...row, fields: newFields };
                            }
                            return row;
                        })
                    } : sec
                )
            }));
            return;
        }

        if (source.rowId !== destination.rowId) {
            setBlueprint((prev) => {
                return {
                    ...prev,
                    sections: prev.sections.map((sec) => {
                        if (sec.id !== source.sectionId && sec.id !== destination.sectionId) {
                            return sec;
                        }
                        else {
                            return {
                                ...sec,
                                rows: sec.rows.map((row) => {
                                    let newFields = [...row.fields];
                                    if (row.id === source.rowId) {
                                        newFields = newFields.filter(field => field.id !== active.id)
                                    }
                                    if (row.id === destination.rowId) {
                                        newFields.splice(destination.index, 0, source.field as Object.Field)
                                    }

                                    return { 
                                        ...row,
                                        fields: newFields
                                    };
                                })
                            }
                        }
                    })
                }
            })
        }
        
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveField(null);
        const {active, over, delta} = event;
        const source = findLocation(active.id as number);

        if (!over) {
            const initialRect = active.rect.current.initial;
            if (!initialRect) return;

            const finalLeft = initialRect.left + delta.x;
            const finalTop = initialRect.top + delta.y;

            const finalWidth = initialRect.width ?? 320; 
            const finalHeight = initialRect.height ?? 150;

            const container = workAreaRef.current?.getBoundingClientRect();
            if (!container) return;

            const relativeX = finalLeft - container.left;
            const relativeY = finalTop - container.top;

            const padding = 20;

            const maxX = container.width - finalWidth;
            const maxY = container.height - finalHeight;

            const safeX = Math.max(padding, Math.min(relativeX, maxX - padding));
            const safeY = Math.max(padding, Math.min(relativeY, maxY - padding));

            if (source && source.field) {
                if (!source.isFloating) {
                    setFloatingFields((prev) => [
                        ...prev,
                        { field: source.field as Object.Field, x: safeX, y: safeY}
                    ]);
                    removeField(source.sectionId as number, source.rowId as number, active.id as number);
                } else {
                    setFloatingFields((prev) => 
                        prev.map(item =>
                            item.field.id === active.id
                            ? { ...item, x: safeX, y: safeY } 
                            : item
                        )
                    );
                }
            }
            return;
        }
        if (active.id === over.id) {
            return; {/* When the user drops it in same area */}
        }

        const destination = findLocation(over.id as number);

        if (!source || !destination || !source.field) return;

        if (source.rowId === destination.rowId) {
            setBlueprint((prev) => {
                return {
                    ...prev,
                    sections: prev.sections.map((sec) =>
                        sec.id === source.sectionId
                        ? {
                            ...sec,
                            rows: sec.rows.map((row) => 
                                row.id === source.rowId
                                ? { ...row, fields: arrayMove(row.fields, source.index, destination.index) }
                                : row
                            )
                        }
                        : sec
                    )
                }
            })
        }
        
    }

    function updateFloatingTitle(sectionId: number, rowId: number, fieldId: number, newTitle: string) {
        const variableName = newTitle.toLowerCase().replace(/\s+/g, '_');
        setFloatingFields(prev => prev.map(item => 
            item.field.id === fieldId ? { ...item, field: { ...item.field, title: newTitle, variableName: variableName } } : item
        ));
    }

    function updateFloatingConfig(sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) {
        setFloatingFields(prev => prev.map(item => 
            item.field.id === fieldId ? { ...item, field: { ...item.field, config: newConfig } } : item
        ));
    }

    function removeFloatingField(sectionId: number, rowId: number, fieldId: number) {
        setFloatingFields(prev => prev.filter(item => item.field.id !== fieldId));
    }

    function updateCurField(sectionId: number, rowId: number, fieldId: number) {
        setSelectedFieldId(fieldId);
    }

    function updateCurSheetVals(fieldVarName: string, fieldVal: number) {
        setCurSheetValues((cur) => ({ ...cur, [fieldVarName]: fieldVal }))
    }

    function variableNameExists(variableName: string): boolean {
        return variableName in curSheetValues;
    }

    function removeCurSheetVals(fieldVarName: string) {
        setCurSheetValues((prev) => {
            const nextValues = { ...prev };
            delete nextValues[fieldVarName];
            return nextValues;
        });
    }

    const activeLocation = selectedFieldId ? findLocation(selectedFieldId) : null;
    const curField = activeLocation?.field as Object.Field | undefined;

    const activeSec = blueprint.sections.find(s => s.id === activeLocation?.sectionId) || defaultSection;
    const activeRow = activeSec.rows.find(r => r.id === activeLocation?.rowId) || defaultRow;

    const renderSidebarFieldConfig = () => {
        if (!curField || !activeLocation) return;

        const universalUpdate = (secId: number, rId: number, fieldId: number, newConfig: Object.FieldDefinition) => {
            if (activeLocation.isFloating) {
                updateFloatingConfig(secId, rId, fieldId, newConfig);
            } else {
                updateFieldConfig(secId, rId, fieldId, newConfig);
            }
        };

        switch (curField.config.type) {
            case "title":
                return <Field_Config_Title sec={activeSec} row={activeRow} field={curField} updateFieldConfig={updateFieldConfig}/>
            case "subtitle":
                return <Field_Subtitle sec={activeSec} row={activeRow} field={curField} updateFieldConfig={updateFieldConfig}/>
            case "text_box":
                return <Field_Config_Textbox sec={activeSec} row={activeRow} field={curField} updateFieldConfig={updateFieldConfig}/>
            case "dropdown":
                return <Field_Config_Dropdown sec={activeSec} row={activeRow} field={curField} updateFieldConfig={updateFieldConfig}/>
            case "numeric":
                return <Field_Config_Numeric sec={activeSec} row={activeRow} field={curField} updateFieldConfig={updateFieldConfig} updateNumericVal={updateCurSheetVals} updateFieldVariableName={updateFieldVariableName} variableNameExists={variableNameExists} />
            default:
                return;
        }
    }

    return (<>
    <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 60px)', width: '100%', overflow: 'hidden' }}>
        <div className="sidebar">            
        </div>
        <div className='workspace'>
            <DndContext
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="blueprint-wrapper" ref={workAreaRef}>
                    <div className='blueprint-container'>
                        <p>{blueprint.title}</p>
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
                                formulas={curSheetValues}
                                updateSectionTitle={updateSectionTitle}
                                removeSection={removeSection}
                                updateFieldTitle={updateFieldTitle}
                                updateFieldConfig={updateFieldConfig}
                                setCurField={updateCurField}
                                removeField={removeField}
                                addField={addField}
                            />
                        ))}
                    </div>
                </div>
                <DragOverlay>
                    {activeField ? (
                        <Menu_Field 
                            sec={defaultSection} 
                            row={defaultRow} 
                            field={activeField}
                            isOverlay={true}
                            isFloating={false}
                            formulas={curSheetValues}
                            updateFieldTitle={() => {}}
                            updateFieldConfig={() => {}}
                            setCurField={updateCurField}
                            removeField={() => {}}
                            
                        />
                    ) : null}
                </DragOverlay>
                {floatingFields.map(item => (
                    <div 
                        key={item.field.id} 
                        style={{ 
                            position: 'absolute', 
                            left: item.x, 
                            top: item.y, 
                            zIndex: 10,
                            width: 'max-content'
                        }}
                    >
                        <Menu_Field 
                            sec={defaultSection} 
                            row={defaultRow} 
                            field={item.field} 
                            formulas={curSheetValues}
                            isOverlay={false}
                            isFloating={true}
                            updateFieldTitle={updateFloatingTitle}
                            updateFieldConfig={updateFloatingConfig}
                            setCurField={updateCurField}
                            removeField={removeFloatingField}
                        />
                    </div>
                ))}
            </DndContext>
        </div>
        <div className="sidebar right">
            {(curField && activeLocation) ? <div className="sidebar-column">
                <div className='sidebar-row'>
                    <p>Field Name: </p>
                    <input
                        className="small-input"
                        value={curField.title}
                        placeholder='Field Name'
                        onChange={(e) => {
                            if (activeLocation.isFloating) {
                                updateFloatingTitle(-1, -1, curField.id, e.target.value);
                            } else {
                                updateFieldTitle(activeLocation.sectionId!, activeLocation.rowId!, curField.id, e.target.value);
                            }
                        }}
                    />
                </div>
                <div className='sidebar-row'>
                    <p>Field Type: </p>
                    <select
                        className='menu-dropdown section'
                        value={curField.config.type}
                        onChange={(e) => {
                            const freshConfig = generateDefaultConfig(e.target.value)
                            updateFieldConfig(activeLocation.sectionId!, activeLocation.rowId!, curField.id, freshConfig)
                        
                        }}
                    >
                        {fieldTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <h4>{fieldTypes.find(t => t.value === curField.config.type)?.label} Details: </h4>
                {renderSidebarFieldConfig()}
            </div>
            : <p>-</p>}
        </div>
    </div>

    </>)
}

