/** @jsx svg */
import { svg } from 'snabbdom-jsx';

import { VNode } from "snabbdom/vnode";
import { RenderingContext, RectangularNodeView, SNode, SEdge, Point, PolylineEdgeView, toDegrees, ExpandButtonView, findParentByFeature, isExpandable } from 'sprotty';
import { injectable } from 'inversify';
import { SButton } from 'sprotty';

export class EntityView extends RectangularNodeView {
    render(node: Readonly<SNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const rhombStr = "M 0,38  L " + node.bounds.width + ",38";
        return <g>
            <rect class-sprotty-node={true}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" rx="5" ry="5" width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)}></rect>
            {context.renderChildren(node)} 
            {(node.children[1] && node.children[1].children.length > 0) ?
                <path class-comp-separator={true} d={rhombStr}></path> : ""}
        </g>;
    }
}

@injectable()
export class InheritanceEdgeView extends PolylineEdgeView {
    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        
        return [
            <path class-sprotty-edge-arrow={true} d="M 6,-3 L 0,0 L 6,3 Z"
            transform={`rotate(${angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
        ];
    }
}

export function angle(x0: Point, x1: Point): number {
    return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
}

@injectable()
export class ExpandEntityView extends ExpandButtonView {
    render(button: SButton, context: RenderingContext): VNode {
        const expandable = findParentByFeature(button, isExpandable);
        const path = (expandable !== undefined && expandable.expanded)
            ? 'M18 15l-6-6-6 6'
            : 'M6 9l6 6 6-6';
        return <g class-sprotty-button="{true}" class-enabled="{button.enabled}">
                <rect x={0} y={0} width={16} height={16} opacity={0}></rect>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="#000000" strokeWidth="2.5" strokeLinecap="butt" strokeLinejoin="bevel"><path d={path}/></svg>
            </g>;
    }
}