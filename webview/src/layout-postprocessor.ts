import { injectable } from "inversify";
import {
  EdgeLayoutPostprocessor,
  isEdgeLayoutable,
  SEdge,
  setAttr,
  SModelElement,
  SLabel,
} from "sprotty";
import { Bounds, toDegrees } from "sprotty-protocol";
import { VNode } from "snabbdom";

@injectable()
export class BigerEdgeLayoutPostprocessor extends EdgeLayoutPostprocessor {
  /** Method works like original EdgeLayoutPostprocessor.decorate,
   * but improves label positioning in custom code section: labels are
   * often long(word and more) and in case of placement on left side of vertical
   * edge segment the label is placed over edge and is also unreadable.
   * In this case labels are placed on the right side instead.
   */
  decorate(vnode: VNode, element: SModelElement): VNode {
    if (isEdgeLayoutable(element) && element.parent instanceof SEdge) {
      if (element.bounds !== Bounds.EMPTY) {
        const placement = this.getEdgePlacement(element);
        const edge = element.parent;
        const position = Math.min(1, Math.max(0, placement.position));
        const router = this.edgeRouterRegistry.get(edge.routerKind);
        const pointOnEdge = router.pointAt(edge, position);
        const derivativeOnEdge = router.derivativeAt(edge, position);
        let transform = "";
        if (pointOnEdge && derivativeOnEdge) {
          transform += `translate(${pointOnEdge.x}, ${pointOnEdge.y})`;
          const angle = toDegrees(Math.atan2(derivativeOnEdge.y, derivativeOnEdge.x));
          if (placement.rotate) {
            let flippedAngle = angle;
            if (Math.abs(angle) > 90) {
              if (angle < 0) flippedAngle += 180;
              else if (angle > 0) flippedAngle -= 180;
            }
            transform += ` rotate(${flippedAngle})`;
            const alignment = this.getRotatedAlignment(
              element,
              placement,
              flippedAngle !== angle
            );
            transform += ` translate(${alignment.x}, ${alignment.y})`;
          } else {
            let alignment = this.getAlignment(element, placement, angle);
            // custom code start: improve label positioning
            if (element instanceof SLabel && alignment.y === 0 && alignment.x < 0) {
              alignment = { x: -alignment.x, y: alignment.y };
            }
            // custom code end
            transform += ` translate(${alignment.x}, ${alignment.y})`;
          }
          setAttr(vnode, "transform", transform);
        }
      }
    }
    return vnode;
  }
}
