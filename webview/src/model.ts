import { DiamondNode, EdgePlacement, PreRenderedElement, RectangularNode, SGraph, SLabel } from 'sprotty';
import { LibavoidEdge } from 'sprotty-routing-libavoid';

export class ERModel extends SGraph {
    name: string;
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
    relationshipType: number;
}

export class CardinalityLabel extends SLabel {
    override edgePlacement = <EdgePlacement> {
        position: 0.5,
        side: 'top',
        rotate: false,
        offset: 10
    };
}

export class LeftCardinalityLabel extends SLabel {
    override edgePlacement = <EdgePlacement> {
        position: 0.2,
        side: 'top',
        rotate: false,
        offset: 10
    };
}

export class RightCardinalityLabel extends SLabel {
    override edgePlacement = <EdgePlacement> {
        position: 0.8,
        side: 'top',
        rotate: false,
        offset: 10
    };
}

export class RoleLabel extends SLabel {
    override edgePlacement = <EdgePlacement> {
        position: 0.5,
        side: 'bottom',
        rotate: false,
        offset: 10
    };
}

export class LeftRoleLabel extends SLabel {
    override edgePlacement = <EdgePlacement> {
        position: 0.2,
        side: 'bottom',
        rotate: false,
        offset: 10
    };
}

export class RightRoleLabel extends SLabel {
    override edgePlacement = <EdgePlacement> {
        position: 0.8,
        side: 'bottom',
        rotate: false,
        offset: 10
    };
}

export class InheritanceEdge extends LibavoidEdge {

}

export class PopupButton extends PreRenderedElement {
    target: string;
	kind: string;
}
