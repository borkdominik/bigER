/** @jsx svg */
import { VNode } from "snabbdom";
import { RenderingContext, svg, RectangularNodeView, SEdge, PolylineEdgeView, // eslint-disable-line @typescript-eslint/no-unused-vars
         SPort, SGraphView, IViewArgs, Hoverable, Selectable, DiamondNodeView, Diamond, SNode, PreRenderedView } from 'sprotty';
import { injectable} from 'inversify';
import { toDegrees, Point } from 'sprotty-protocol';
import { EntityNode, ERModel, NotationEdge, PopupButton, RelationshipNode } from "./model";
import { DiagramTypes, RelationshipTypes } from "./utils";


@injectable()
export class ERModelView<IRenderingArgs> extends SGraphView<IRenderingArgs> {

    // @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

    override render(model: Readonly<ERModel>, context: RenderingContext, args?: IRenderingArgs): VNode {
        // set model name in toolbar
        const menuModelName = document.getElementById('toolbar-modelName');
        if (menuModelName) {
            menuModelName.innerText = model.name;
        }
        // set notation option panel
        const notationSelect = document.getElementById('select-notation') as HTMLSelectElement;
        if (notationSelect) {
            notationSelect.value = model.notation;
        }
        const edgeRouting = this.edgeRouterRegistry.routeAllChildren(model);
        const transform = `scale(${model.zoom}) translate(${-model.scroll.x},${-model.scroll.y})`;
        return <svg class-sprotty-graph={true}>
            <g transform={transform}>
                {context.renderChildren(model, edgeRouting)}
            </g>
        </svg>;
    }
}

@injectable()
export class EntityNodeView extends RectangularNodeView {
    override render(node: Readonly<EntityNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const hight = node.isUml ? 58 : 38;
        const rhombStr = "M 0," + hight + "  L " + node.bounds.width + "," + hight;

        return <g>
            {(node.weak === true) ? <rect class-border-weak={true} x="-5" y="-5" rx="5" ry="5" width={node.bounds.width + 10} height={node.bounds.height + 10}></rect> : "" }
            <rect class-sprotty-node={true} class-mouseover={node.hoverFeedback} class-selected={node.selected}
                x="0" y="0" rx="5" ry="5" width={Math.max(node.bounds.width, 0)} height={Math.max(node.bounds.height, 0)}>
            </rect>
            {context.renderChildren(node)}
            {(node.children[1] && node.children[1].children.length > 0) ?
                <path class-comp-separator={true} d={rhombStr}></path> : ""}
        </g>;
    }
}

@injectable()
export class RelationshipNodeView extends DiamondNodeView {
    override render(node: Readonly<RelationshipNode & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const diamond = new Diamond({ height: Math.max(node.size.height, 0), width: Math.max(node.size.width, 0), x: 0, y: 0 });
        const diamondWeak = new Diamond({ height: Math.max(node.size.height + 10, 0), width: Math.max(node.size.width + 20, 0), x: -10, y: -5 });
        const points = `${svgStr(diamond.topPoint)} ${svgStr(diamond.rightPoint)} ${svgStr(diamond.bottomPoint)} ${svgStr(diamond.leftPoint)}`;
        const pointsWeak = `${svgStr(diamondWeak.topPoint)} ${svgStr(diamondWeak.rightPoint)} ${svgStr(diamondWeak.bottomPoint)} ${svgStr(diamondWeak.leftPoint)}`;
        return <g>
            {(node.weak === true) ?
                <polygon class-border-weak points={pointsWeak} /> :
                ""}
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
    override renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
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
    override render(model: Readonly<PopupButton>, context: RenderingContext): VNode | undefined {
        const node = super.render(model, context);
        return node;
    }
}

@injectable()
export class NotationEdgeView extends PolylineEdgeView {
    override render(edge: Readonly<NotationEdge>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        const route = this.edgeRouterRegistry.route(edge, { args });
        if (route.length === 0) {
            if (edge.children.length === 0) {
                return undefined;
            }
            return <g>{context.renderChildren(edge, { route })}</g>;
        }
        if (!this.isVisible(edge, route, context)) {
            if (edge.children.length === 0) {
                return undefined;
            }
            return <g>{context.renderChildren(edge, { route })}</g>;
        }

        return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionals(edge, route, context)}
                {context.renderChildren(edge, { route })}
        </g>;
    }

    override renderAdditionals(edge: NotationEdge, segments: Point[], context: RenderingContext): VNode[] {
        const source = segments[0];
        const target = segments[segments.length - 1];
        const penultimateElem = segments[segments.length - 2];
        const secondElem = segments[1];
        switch (edge.notation) {
            case DiagramTypes.BACHMAN_NOTATION: {
                return this.createBachmanEdge(source, target, secondElem, penultimateElem, edge.connectivity, edge.isSource);
            }
            case DiagramTypes.CROWSFOOT_NOTATION: {
                return this.createCrowsFootEdge(source, target, secondElem, penultimateElem, edge.connectivity, edge.isSource);
            }
            case DiagramTypes.UML: {
                if (edge.relationshipType !== null && edge.relationshipType !== RelationshipTypes.DEFAULT) {
                    return this.createUmlEdge(source, target, edge.relationshipType, secondElem, penultimateElem, edge.isSource);
                }
                return [];
            }
            default: {
                // no additional renderings for other notations
                return [];
            }
        }
    }

    private createUmlEdge(point:Point, next:Point, relationshipType:number, secondElem: Point, penultimateElem: Point, isSource: boolean):VNode[] {
        const color = (relationshipType === RelationshipTypes.AGGREGATION_LEFT || relationshipType === RelationshipTypes.AGGREGATION_RIGHT) ? "var(--vscode-editor-background)" : "var(--vscode-editorActiveLineNumber-foreground)";
        // source and target are required for the rotation
        let source = point;
        let target = secondElem;
        if (relationshipType === RelationshipTypes.AGGREGATION_RIGHT || relationshipType === RelationshipTypes.COMPOSITION_RIGHT) {
            source = next;
            target = penultimateElem;
        }
        const polygonPoints = (source.x + 2) + " " + source.y + "," + (source.x + 17) + " " + (source.y - 8) + "," + (source.x + 32) + " " + source.y + "," + (source.x + 17) + " " + (source.y + 8);
        return [<g>
            <polygon points={polygonPoints} fill={color} transform={`rotate(${this.angle(source, target)} ${source.x} ${source.y})`}/>
        </g>];
    }

    private createCrowsFootEdge(source: Point, target: Point, secondElem: Point, penultimateElem: Point, cardinality: string, isSource: boolean): VNode[] {
        let arrowSourceX = source.x;
        let arrowTargetX = target.x;
        // Move arrow from center of the circle
        if (!isNaN(arrowSourceX)) {
            arrowSourceX = arrowSourceX + 9;
        }
        if (!isNaN(arrowTargetX)) {
            arrowTargetX = arrowTargetX + 9;
        }
        if (cardinality === '0..1') {
            if (isSource) {
                return this.createCrowsFootZeroOrOne(source, secondElem, arrowSourceX);
            }
            return this.createCrowsFootZeroOrOne(target, penultimateElem, arrowTargetX);
        } else if (cardinality === '1' || cardinality === '1..1') {
            if (isSource) {
                return this.createCrowsFootOne(source, secondElem, arrowSourceX);
            }
            return this.createCrowsFootOne(target, penultimateElem, arrowTargetX);
        } else if (cardinality === '0..N') {
            if (isSource) {
                return this.createCrowsFootZeroOrMany(source, secondElem, arrowSourceX);
            }
            return this.createCrowsFootZeroOrMany(target, penultimateElem, arrowTargetX);
        } else if (cardinality === 'N' || cardinality === '1..N') {
            if (isSource) {
                return this.createCrowsFootMany(source, secondElem, arrowSourceX);
            }
            return this.createCrowsFootMany(target, penultimateElem, arrowTargetX);
        } else {
            return [];
        }
    }

    private createBachmanEdge(source: Point, target: Point, secondElem: Point, penultimateElem: Point, cardinality: string, isSource:boolean): VNode[] {
        let arrowSourceX = source.x;
        let arrowTargetX = target.x;
        // Move arrow from center of the circle
        if (!isNaN(arrowSourceX)) {
            arrowSourceX = arrowSourceX + 9;
        }
        if (!isNaN(arrowTargetX)) {
            arrowTargetX = arrowTargetX + 9;
        }
        if (cardinality === '0..1' || cardinality === '1') {
            const color = cardinality === '0..1' ? "var(--vscode-editor-background)" : "var(--vscode-editorActiveLineNumber-foreground)";
            if (isSource) {
                return this.createEdgeWithCircle(color, source);
            }
            return this.createEdgeWithCircle(color, target);
        } else if (cardinality === '0..N' || cardinality === 'N') {
            const color = cardinality === '0..N' ? "var(--vscode-editor-background)" : "var(--vscode-editorActiveLineNumber-foreground)";
            if (isSource) {
                return this.createEdgeWithCircleAndArrow(color, source, secondElem, arrowSourceX);
            }
            return this.createEdgeWithCircleAndArrow(color, target, penultimateElem, arrowTargetX);
        } else {
            return [];
        }
    }

    private createEdgeWithCircle(color: string, point: Point): VNode[] {
        return [<g>
                <circle cx={point.x} cy={point.y} r="7" stroke-width="1" fill={color}/>
            </g>
        ];
    }

    private createEdgeWithCircleAndArrow(color: string, point: Point, next: Point, targetX: number): VNode[] {
        return [
            <g>
                <circle cx={point.x} cy={point.y} r="7" stroke-width="1" fill={color}/>
                <path class-sprotty-edge-arrow={true} d="M 7,-4 L 0,0 L 7,4 Z"
                    transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y}) translate(${targetX} ${point.y})`}/>
            </g>
        ];
    }

    private createCrowsFootZeroOrOne(point: Point, next: Point, targetX: number): VNode[] {
        return [<g>
            <circle cx={point.x + 25} cy={point.y} r="7" stroke-width="1" fill="var(--vscode-editor-background)"
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
            <line x1={point.x + 10} y1={point.y + 11} x2={point.x + 10} y2={point.y - 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
        </g>];
    }

    private createCrowsFootZeroOrMany(point: Point, next: Point, targetX: number): VNode[] {
        return [<g>
            <circle cx={point.x + 26} cy={point.y} r="7" stroke-width="1" fill="var(--vscode-editor-background)"
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
            <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y + 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
            <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y - 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
        </g>];
    }

    private createCrowsFootOne(point: Point, next: Point, targetX: number): VNode[] {
        return [<g>
            <line x1={point.x + 19} y1={point.y + 11} x2={point.x + 19} y2={point.y - 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
            <line x1={point.x + 10} y1={point.y + 11} x2={point.x + 10} y2={point.y - 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
        </g>];
    }

    private createCrowsFootMany(point: Point, next: Point, targetX: number): VNode[] {
        return [<g>
            <line x1={point.x + 24} y1={point.y + 11} x2={point.x + 24} y2={point.y - 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
            <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y + 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
            <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y - 11}
                transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
        </g>];
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}