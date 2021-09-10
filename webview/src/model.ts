import { injectable } from "inversify";
import { EdgeLayoutable, EdgePlacement, ManhattanEdgeRouter, SEdge, SLabel } from 'sprotty';

@injectable()
export class MultiplicityLabel extends SLabel implements EdgeLayoutable {
    edgePlacement = <EdgePlacement> {
        position: 0.5,
        side: 'top',
        rotate: false,
        offset: 5
    };
}

export class InheritanceEdge extends SEdge {
    public readonly targetAnchorCorrection = Math.sqrt(5);
    public readonly routerKind = ManhattanEdgeRouter.KIND;
}
