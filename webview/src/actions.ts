import { Action } from "sprotty-protocol";

/**
 * Adds a model element graphically through LSP. elementType property controls the type of element to create.
 * Supported values are: 'entity' and 'relationship'.
 */
export interface CreateElementEditAction extends Action {
    kind: typeof CreateElementEditAction.KIND
    elementType: string
}

export namespace CreateElementEditAction {
    export const KIND = 'createElementEdit';

    export function create(elementType: string): CreateElementEditAction {
        return {
            kind: KIND,
            elementType
        };
    }
}

/**
 * Changes the code generator value
 */
export interface CodeGenerateAction {
    kind: typeof CodeGenerateAction.KIND
    generateType: string
}

export namespace CodeGenerateAction {
    export const KIND = 'codeGenerate';

    export function create(generateType: string): CodeGenerateAction {
        return {
            kind: KIND,
            generateType
        };
    }
}


/**
 * Changes the notation value
 */
export interface ChangeNotationAction {
    kind: typeof ChangeNotationAction.KIND
    notation: string
}

export namespace ChangeNotationAction {
    export const KIND = 'changeNotation';

    export function create(notation: string): ChangeNotationAction {
        return {
            kind: KIND,
            notation
        };
    }
}