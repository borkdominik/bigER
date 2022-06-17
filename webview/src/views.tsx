/** @jsx svg */
import { VNode } from "snabbdom";
import { RenderingContext, RectangularNodeView, SEdge, Point, PolylineEdgeView, toDegrees,
         svg, SPort, SGraphView, EdgeRouterRegistry, IViewArgs, Hoverable, Selectable, DiamondNodeView, Diamond, SNode, PreRenderedView } from 'sprotty';
import { injectable, inject } from 'inversify';
import { EntityNode, ERModel, PopupButton, RelationshipNode } from "./model";

@injectable()
export class ERModelView<IRenderingArgs> extends SGraphView<IRenderingArgs> {

    @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

    render(model: Readonly<ERModel>, context: RenderingContext, args?: IRenderingArgs): VNode {
        // set model name in toolbar
        const menuModelName = document.getElementById('toolbar-modelName');
        if (menuModelName) {
            menuModelName.innerText = model.name
        }
        // set code generator option 
        const generateSelect = document.getElementById('select-generate') as HTMLSelectElement;
        if (generateSelect) { 
            generateSelect.value = model.generateType
        }
        const edgeRouting = this.edgeRouterRegistry.routeAllChildren(model);
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`;
        return <svg class-sprotty-graph={true}>
            <g transform={transform}>
                {context.renderChildren(model, { edgeRouting })}
            </g>
        </svg>;
    }
}

@injectable()
export class EntityNodeView extends RectangularNodeView {
    render(node: Readonly<EntityNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const rhombStr = "M 0,38  L " + node.bounds.width + ",38";
        
        return <g>
            {(node.weak === true) 
                ? <rect class-border-weak={true} x="-5" y="-5" rx="5" ry="5" width={node.bounds.width + 10} height={node.bounds.height + 10}></rect> 
                : ""}
            <rect class-sprotty-node={true} class-sprotty-port={node instanceof SPort}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" rx="5" ry="5" width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)}></rect>
            {context.renderChildren(node)} 
            {(node.children[1] && node.children[1].children.length > 0) ?
                <path class-comp-separator={true} d={rhombStr}></path> : ""}
        </g>;
    }
}

@injectable()
export class RelationshipNodeView extends DiamondNodeView {
    render(node: Readonly<RelationshipNode & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const diamond = new Diamond({ height: Math.max(node.size.height, 0), width: Math.max(node.size.width, 0), x: 0, y: 0 });
        const diamondWeak = new Diamond({ height: Math.max(node.size.height+10, 0), width: Math.max(node.size.width+20, 0), x: -10, y: -5 });
        const points = `${svgStr(diamond.topPoint)} ${svgStr(diamond.rightPoint)} ${svgStr(diamond.bottomPoint)} ${svgStr(diamond.leftPoint)}`;
        const pointsWeak = `${svgStr(diamondWeak.topPoint)} ${svgStr(diamondWeak.rightPoint)} ${svgStr(diamondWeak.bottomPoint)} ${svgStr(diamondWeak.leftPoint)}`;
        return <g>
            {(node.weak === true) 
                ? <polygon class-border-weak
                points={pointsWeak} /> 
                : ""}
            <polygon class-sprotty-node={node instanceof SNode} class-sprotty-port={node instanceof SPort}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  points={points} />
            {context.renderChildren(node)}
        </g>;
    }
}

function svgStr(point: Point) {
    return `${point.x},${point.y}`;
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
export class PopupButtonView extends PreRenderedView {
    render(model: Readonly<PopupButton>, context: RenderingContext): VNode | undefined {
        const node = super.render(model, context);
        return node;
    }
}