/** @jsx svg */
import { VNode } from "snabbdom";
import { RenderingContext, RectangularNodeView, SNode, SEdge, Point, PolylineEdgeView, toDegrees, ExpandButtonView, findParentByFeature, isExpandable,
         svg, SButton, SPort, IView, SGraphView, EdgeRouterRegistry } from 'sprotty';
import { injectable, inject } from 'inversify';
import { ERModel } from "./model";

@injectable()
export class ERModelView<IRenderingArgs> extends SGraphView<IRenderingArgs> {

    @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

    render(model: Readonly<ERModel>, context: RenderingContext, args?: IRenderingArgs): VNode {
        const menuModelName = document.getElementById('menubar-modelName');
        if (menuModelName) {
            menuModelName.innerText = model.name
        }

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

export class EntityView extends RectangularNodeView {
    render(node: Readonly<SNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const rhombStr = "M 0,38  L " + node.bounds.width + ",38";
        return <g>
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

@injectable()
export class PolylineArrowEdgeView extends PolylineEdgeView {

    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-sprotty-edge-arrow={true} d="M 6,-3 L 0,0 L 6,3 Z"
                  transform={`rotate(${this.angle(p2, p1)} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}/>
        ];
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}

@injectable()
export class TriangleButtonView implements IView {
    render(model: SPort, context: RenderingContext): VNode {
        return <g class-sprotty-button="{true}">
                <rect x={-15} y={-15} width={50} height={50} opacity={0}></rect>
                <svg width="35" height="35" viewBox="0 -20 32 32" xmlns="http://www.w3.org/2000/svg" fill="#89d185"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.306 2.146l-4.02 4.02v.708l4.02 4.02.708-.707L3.807 6.98H5.69c2.813 0 4.605.605 5.705 1.729 1.102 1.125 1.615 2.877 1.615 5.421v.35h1v-.35c0-2.646-.527-4.72-1.9-6.121C10.735 6.605 8.617 5.98 5.69 5.98H3.887l3.127-3.126-.708-.708z"/></svg>
            </g>
        //return <div class-codicon={true} class-codicon-reply={true}></div>
    //return <path class-sprotty-button={true} className={codiconCSSClasses('reply', false, false)} d="M 0,0 L 8,4 L 0,8 Z"/>
    }
    
}

