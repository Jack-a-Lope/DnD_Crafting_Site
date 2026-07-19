//Config Settings
export interface TitleDetails { defaultTitle: string; }
export interface SubtitleDetails { defaultText: string; }
export interface TextBoxDetails { maxLength: number; multiline: boolean; }
export interface DropdownDetails { options: string[]; defaultOption: string; }
export interface ToggleDetails { states: string[]; display: string; isImage: boolean }
export interface ToggleListDetails { states: string[]; display: string[]; isImage: boolean }
export interface ImageDetails { url: string; maxWidth: number; maxHeight: number; subtitle: string; inline: boolean }
export interface VarLenDetails { defaultTitle: string; defaultDesc: string }
export interface EmptyDetails { }

export type FieldDefinition = 
    | { type: "title"; details: TitleDetails }
    | { type: "subtitle"; details: EmptyDetails }
    | { type: "text_box"; details: TextBoxDetails }
    | { type: "dropdown"; details: DropdownDetails }
    | { type: "toggle"; details: ToggleDetails }
    | { type: "toggle_list"; details: ToggleListDetails }
    | { type: "image"; details: ImageDetails }
    | { type: "var_len"; details: VarLenDetails };

//Generic definition of a field
export interface Field {
    id: number; //Unique id for the field
    title: string; //Name of the field as displayed to users
    config: FieldDefinition; 
}

//Object to contain variable number of fields
export interface Section {
    id: number; //unique id for the section
    title: string; //name for the section that will be displayed as subheading
    fields: Field[]; // The actual fields
    startRevealed: boolean; //whether or not the default state of this is to be revealed to players
}

type HexCode = `#${string}`;
export interface StyleDetails { 
    borderColor: HexCode;
    h2Font: string;
    h2Size: number;
    h4Font: string;
    h4Size: number;
    pFont: string;
    pSize: number;
    pColor: HexCode;
    backgroundImage: string;
    backgroundColor: HexCode;
 }

//The defintion of what an object type is
export interface Type {
    id: number; //Unique id for the given object type
    title: string; //Every object type gets a name
    sections: Section[]; //The list of sections that make up the object
    style: StyleDetails;
}

export interface InstanceFieldData {
    fieldId: number; //matches ObjectField.id
    value: unknown; //Current state of the field
}

export interface InstanceSectionData {
    sectionId: number; //matches ObjectSection.id
    fields: InstanceFieldData[];
}

//The actual object instance of a given type
export interface ObjectInstance {
    id: number; //unique id for the object instance
    typeId: number; //matches object type blueprint
    data: InstanceSectionData[];
}
