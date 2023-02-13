import { Action, CollapseExpandAllAction, FitToScreenAction } from "sprotty-protocol";
import { ChangeLayoutDirectionAction, ChangeNotationAction, CreateElementEditAction } from "../actions";
import { UITypes } from "../utils";

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
    options: Map<string, string>;
}

export interface ToolButtonPanel {
    id: string;
    selectionId: string;
    label: string;
    icon: string;
    selections: Map<string, string>;
    action: (val: string) => Action;
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
        public readonly selectionId = UITypes.NOTATION_SELECT,
        public readonly label = "Notation",
        public readonly icon = "settings",
        public readonly selections = new Map<string, string>([
            ["default", "Default"],
            ["bachman", "Bachman"],
            ["chen", "Chen"],
            ["crowsfoot", "Crow's Foot"],
            ["uml", "UML"]
        ]),
        public readonly action = (val: string) => ChangeNotationAction.create(val)
    ) {}
}

export class LayoutButton implements ToolButtonPanel {
    constructor(
        public readonly id = "btn_panel_layout",
        public readonly selectionId = UITypes.LAYOUT_SELECT,
        public readonly label = "Layout Direction",
        public readonly icon = "settings",
        public readonly selections = new Map<string, string>([
            ["right", "Right"],
            ["left", "Left"],
            ["down", "Down"],
            ["up", "Up"]
        ]),
        public readonly action = (val: string) => ChangeLayoutDirectionAction.create(val)
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

export class RotateLayoutButton implements ToolButton {
    constructor(
        public readonly id = "btn_rotate_layout",
        public readonly label = "Rotate Layout",
        public readonly icon = "debug-step-over",
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