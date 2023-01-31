import { Action, CollapseExpandAllAction, FitToScreenAction } from "sprotty-protocol";
import { CreateElementEditAction } from "../actions";

export interface ToolButton {
    id: string;
    label: string;
    icon: string;
    action: Action;
}

export interface ToolButtonDropdown {
    id: string;
    label: string;
    icon: string;
    options: Map<string, string>
}

export interface ToolButtonPanel {
    id: string;
    label: string;
    icon: string;
    selections: Map<string, string>
}

export class AddEntityButton implements ToolButton {
    constructor(
        public readonly id = "btn_add_entity",
        public readonly label = "Add Entity",
        public readonly icon = "debug-stop",
        public readonly action = CreateElementEditAction.create('entity')
    ) {}
}

export class AddRelationshipButton implements ToolButton {
    constructor(
        public readonly id = "btn_add_relationship",
        public readonly label = "Add Relationship",
        public readonly icon = "primitive-square",
        public readonly action = CreateElementEditAction.create('relationship')
    ) {}
}

export class GenerateButton implements ToolButtonDropdown {
    constructor(
        public readonly id = "btn_dropdown_generate",
        public readonly label = "Generate",
        public readonly icon = "file-code",
        public readonly options = new Map<string, string>([
            ["sql", "Generic SQL"],
            ["postgres", "PostgreSQL"],
            ["oracle", "Oracle SQL"],
            ["mysql", "MySQL"],
            ["mssql", "MS SQL"],
            ["db2", "Db2"]
        ])
    ) {}
}

export class NotationButton implements ToolButtonPanel {
    constructor(
        public readonly id = "btn_panel_notation",
        public readonly label = "Notation",
        public readonly icon = "settings",
        public readonly selections = new Map<string, string>([
            ["default", "Default"],
            ["bachman", "Bachman"],
            ["chen", "Chen"],
            ["crowsfoot", "Crow's Foot"]
        ])
    ) {}
}

export class FitToScreenButton implements ToolButton {
    constructor(
        public readonly id = "btn_fit_to_screen",
        public readonly label = "Fit to Screen",
        public readonly icon = "screen-full",
        public readonly action = FitToScreenAction.create([])
    ) {}
}

export class ExpandAllButton implements ToolButton {
    constructor(
        public readonly id = "btn_expand_all",
        public readonly label = "Expand All",
        public readonly icon = "expand-all",
        public readonly action = CollapseExpandAllAction.create({ expand: true })
    ) {}
}

export class CollapseAllButton implements ToolButton {
    constructor(
        public readonly id = "btn_collapse_all",
        public readonly label = "Collapse All",
        public readonly icon = "collapse-all",
        public readonly action = CollapseExpandAllAction.create({ expand: false })
    ) {}
}