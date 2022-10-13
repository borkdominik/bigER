import { DiamondNode, EdgePlacement, PreRenderedElement, RectangularNode, SGraph, SLabel } from 'sprotty';
import { LibavoidEdge } from 'sprotty-routing-libavoid';

export class ERModel extends SGraph {
    name: string;
    generateType: string;
    notation: string;
}

export class EntityNode extends RectangularNode {
    expanded: boolean;
    weak: boolean;
}

export class RelationshipNode extends DiamondNode {
    weak: boolean;
}

export class NotationEdge extends LibavoidEdge {
    isSource: boolean;
    notation: string;
    connectivity: string;
}

export class CardinalityLabel extends SLabel {
    edgePlacement = <EdgePlacement> {
        position: 0.5,
        side: 'top',
        rotate: false,
        offset: 10
    };
}

// TODO: Fix Role label
export class RoleLabel extends SLabel {
    edgePlacement = <EdgePlacement> {
        position: 0.5,
        side: 'top',
        rotate: true,
        offset: 10
    };
}

export class InheritanceEdge extends LibavoidEdge {

}

export class PopupButton extends PreRenderedElement {
    target: string;
	kind: string;
}
