import { injectable } from "inversify";
import { CreateElementAction, CreatingOnDrag, EdgeLayoutable, EdgePlacement, RectangularNode, RectangularPort, SLabel, SRoutableElement } from 'sprotty';
import { Action, SEdge } from 'sprotty-protocol'
import { LibavoidRouter, LibavoidEdge, RouteType } from 'sprotty-routing-libavoid';

export class RelationEdge extends LibavoidEdge {
    routerKind = LibavoidRouter.KIND;
    targetAnchorCorrection = Math.sqrt(5);
}

export class EntityNode extends RectangularNode {
    expanded: boolean
    
    canConnect(routable: SRoutableElement, role: string) {
        return true;
    }
}

/*
export class RelationshipNode extends DiamondNode {
    canConnect(routable: SRoutableElement, role: string) {
        return true;
    }
}
*/

export class CreateRelationPort extends RectangularPort implements CreatingOnDrag {
    createAction(id: string): Action {
        const edge: SEdge = {
            id,
            type: 'edge',
            sourceId: this.parent.id,
            targetId: this.id,
            routerKind: LibavoidRouter.KIND,
        };
        return CreateElementAction.create(edge, { containerId: this.root.id });
    }
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

@injectable()
export class InheritanceEdge extends LibavoidEdge {
    public readonly targetAnchorCorrection = Math.sqrt(5);
    public readonly routerKind = LibavoidRouter.KIND;
    public readonly routeType = RouteType.Orthogonal;
}
