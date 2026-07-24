import React, { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient.tsx'
import { useAuth } from './Auth_Context';
import { DragOverlay, DndContext, pointerWithin, type DragEndEvent } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import { useDroppable, useDndContext, useDraggable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';import './Object_Type_Creator.css'
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

function generateDefaultConfig(newType: string): Object.FieldDefinition {
    switch (newType) {
        case "title":
            return { type: "title", details: { defaultTitle: "" } };
        case "subtitle":
            return { type: "subtitle", details: { defaultText: "" } };
        case "text_box":
            return { type: "text_box", details: { maxLength: 255, multiline: true } };
        case "dropdown":
            return { type: "dropdown", details: { options: [], defaultOption: "" } };
        default:
            return { type: "title", details: { defaultTitle: "" } };
    }
}

function Field_Title({sec, row, field, updateFieldConfig}: {
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
        <div className='field-wrapper'>
            <div className='field-line'>
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
            </div>
        </div>
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

function Field_Textbox({sec, row, field, updateFieldConfig}: {
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
        <div className='field-wrapper'>
            <div className='field-line'>
                <h4>{field.title}:</h4>
                <textarea 
                    className="dynamic-textarea"
                    placeholder="Example Text Box"
                    onChange={() => {
                        updateFieldConfig(sec.id, row.id, field.id, {
                            type: "text_box",
                            details: {
                                ...details,
                            }
                        });
                    }}
                />
            </div>
        </div>
    </>)
}

function Field_Dropdown({sec, row, field, updateFieldConfig}: {
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

function Menu_Field({ sec, row, field, isOverlay, isFloating, updateFieldTitle, updateFieldConfig, removeField }: { 
    sec: Object.Section,
    row: Object.Row,
    field: Object.Field, 
    isOverlay: boolean,
    isFloating: boolean,
    updateFieldTitle: (sectionId: number, rowId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
    removeField: (sectionId: number, rowId: number, fieldId: number) => void 
}) {

    const renderFieldConfig = () => {
        switch (field.config.type) {
            case "title":
                return <Field_Title sec={sec} row={row} field={field} updateFieldConfig={updateFieldConfig}/>
            case "subtitle":
                return <Field_Subtitle sec={sec} row={row} field={field} updateFieldConfig={updateFieldConfig}/>
            case "text_box":
                return <Field_Textbox sec={sec} row={row} field={field} updateFieldConfig={updateFieldConfig}/>
            case "dropdown":
                return <Field_Dropdown sec={sec} row={row} field={field} updateFieldConfig={updateFieldConfig}/>
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
        <div ref={isOverlay ? null : setNodeRef} style={style} className="section-wrapper field">
            <div {...(isOverlay ? {} : attributes)} {...(isOverlay ? {} : listeners)} style={{ cursor: 'grab', padding: '.2rem' }}>
                ⠿
            </div>
            <div className='section-primary'>
                <div className="section-row">
                    <h3>Field Name: </h3>
                    <input 
                    className="small-input"
                    value={field.title}
                    placeholder='Field Name'
                    onChange={(e) => {
                        updateFieldTitle(sec.id, row.id, field.id, e.target.value);
                    }}
                />
                </div>
                <div style={{display:'flex', flexDirection:"column", margin:"0rem .5rem", gap:".2rem"}}>
                    <div className='section-row fields'>
                        <h3>Field Type: </h3>
                        <select
                            className='menu-dropdown section'
                            value={field.config.type}
                            onChange={(e) => {
                                const freshConfig = generateDefaultConfig(e.target.value)
                                updateFieldConfig(sec.id, row.id, field.id, freshConfig)
                            
                            }}
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
                onClick={() => removeField(sec.id, row.id, field.id)} 
            />
        </div>
    </>)
}

function Menu_Row({ sec, row, updateSectionTitle, removeSection, updateFieldTitle, updateFieldConfig, removeField, addField }: { 
    sec: Object.Section,
    row: Object.Row,
    updateSectionTitle: (sectionId: number, newTitle: string) => void, 
    removeSection: (sectionId: number) => void,
    updateFieldTitle: (sectionId: number, rowId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
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
                        updateFieldTitle={updateFieldTitle}
                        updateFieldConfig={updateFieldConfig}
                        removeField={removeField}
                    />
                ))}
            </div>
        </SortableContext>
        
        
        
    </>)
}

function Menu_Section({ sec, updateSectionTitle, removeSection, updateFieldTitle, updateFieldConfig, removeField, addField }: { 
    sec: Object.Section, 
    updateSectionTitle: (sectionId: number, newTitle: string) => void, 
    removeSection: (sectionId: number) => void,
    updateFieldTitle: (sectionId: number, rowId: number, fieldId: number, newTitle: string) => void,
    updateFieldConfig: (sectionId: number, rowId: number, fieldId: number, newConfig: Object.FieldDefinition) => void, 
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

export function Blueprint_Menu() {
    const [blueprint, setBlueprint] = useState<Object.Type>(defaultBlueprint);
    const [activeField, setActiveField] = useState<Object.Field | null>(null);
    const [floatingFields, setFloatingFields] = useState<{field: Object.Field, x: number, y: number}[]>([]);
    const workAreaRef = useRef<HTMLDivElement>(null);
    const [selectedField, setSelectedField] = useState<Object.Field | null>(null);

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
        setBlueprint((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => 
            section.id === sectionId
            ? {...section, rows: section.rows.map((row) => 
                row.id === rowId
                ? {...row, fields: row.fields.map((field) => 
                    field.id === fieldId
                    ? {...field, title: newTitle}
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
        setFloatingFields(prev => prev.map(item => 
            item.field.id === fieldId ? { ...item, field: { ...item.field, title: newTitle } } : item
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

    return (<>
    <div style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 60px)', width: '100%', overflow: 'hidden' }}>
        <div className="sidebar">
            <p>Test</p>
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
                <DragOverlay>
                    {activeField ? (
                        <Menu_Field 
                            sec={defaultSection} 
                            row={defaultRow} 
                            field={activeField}
                            isOverlay={true}
                            isFloating={false}
                            updateFieldTitle={() => {}}
                            updateFieldConfig={() => {}}
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
                            isOverlay={false}
                            isFloating={true}
                            updateFieldTitle={updateFloatingTitle}
                            updateFieldConfig={updateFloatingConfig}
                            removeField={removeFloatingField}
                        />
                    </div>
                ))}
            </DndContext>
        </div>
        <div className="sidebar right">
            <p>Test</p>
        </div>
    </div>

    </>)
}

