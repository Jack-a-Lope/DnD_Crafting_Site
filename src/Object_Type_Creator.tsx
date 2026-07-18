import React, { useEffect, useState, useRef } from 'react'
import { supabase } from './supabaseClient.tsx'
import { useAuth } from './Auth_Context';
import './Item_Card.css'
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

const [blueprint, setBlueprint] = useState<Object.Type>(defaultBlueprint);

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

function updateBluePrintTitle(newTitle: string) {
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

