import { injectable } from "inversify";
import { DiamondNode, EdgeLayoutable, EdgePlacement, PreRenderedElement, RectangularNode, SEdge, SGraph,  SLabel, SRoutableElement } from 'sprotty';


export class ERModel extends SGraph {
    name: string
    generateType: string
    notation: string
}

export class EntityNode extends RectangularNode {
    expanded: boolean
    weak: boolean
    
    canConnect(routable: SRoutableElement, role: string) {
        return true;
    }
}

export class RelationshipNode extends DiamondNode {
    weak: boolean
}

export class NotationEdge extends SEdge {
    isSource: boolean
    showRelationship: boolean
    notation: String
    relationshipCardinality: String
}


@injectable()
export class MultiplicityLabel extends SLabel implements EdgeLayoutable {
    edgePlacement = <EdgePlacement> {
        position: 0.5,
        side: 'top',
        rotate: false,
        offset: 5
    };
}

export class PopupButton extends PreRenderedElement {
    target: string;
	kind: string;
}
