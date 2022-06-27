/** @jsx svg */
import { VNode } from "snabbdom";
import { RenderingContext, svg, RectangularNodeView, SEdge, Point, PolylineEdgeView, toDegrees, // eslint-disable-line @typescript-eslint/no-unused-vars
         SPort, SGraphView, EdgeRouterRegistry, IViewArgs, Hoverable, Selectable, DiamondNodeView, Diamond, SNode, PreRenderedView, SLabel } from 'sprotty';
import { injectable, inject } from 'inversify';
import { EntityNode, ERModel, NotationEdge, PopupButton, RelationshipNode } from "./model";


@injectable()
export class ERModelView<IRenderingArgs> extends SGraphView<IRenderingArgs> {

    @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

    render(model: Readonly<ERModel>, context: RenderingContext, args?: IRenderingArgs): VNode {
        // set model name in toolbar
        const menuModelName = document.getElementById('toolbar-modelName');
        if (menuModelName) {
            menuModelName.innerText = model.name;
        }
        // set code generator option
        const generateSelect = document.getElementById('select-generate') as HTMLSelectElement;
        if (generateSelect) {
            generateSelect.value = model.generateType;
        }
        const notationSelect = document.getElementById('select-notation') as HTMLSelectElement;
        if (notationSelect) {
            notationSelect.value = model.notation;
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

/*
function convertNotationString(model: Readonly<ERModel>):string{
    switch(model.notation){
        case 'bachman'   : return 'Bachman';
        case 'chen'      : return 'Chen';
        case 'crowsfoot' : return 'Crows Foot';
        case 'minmax'    : return 'Min Max';
        case 'uml'       : return 'UML';
        default : return '';
    }
}*/

@injectable()
export class EntityNodeView extends RectangularNodeView {
    render(node: Readonly<EntityNode>, context: RenderingContext): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const rhombStr = "M 0,38  L " + node.bounds.width + ",38";

        return <g>
            {(node.weak === true) ?
                <rect class-border-weak={true} x="-5" y="-5" rx="5" ry="5" width={node.bounds.width + 10} height={node.bounds.height + 10}></rect> :
                ""}
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

@injectable()
export class NotationEdgeView extends PolylineEdgeView {

    bachman = 'bachman';
    crowsfoot = 'crowsfoot';
    uml = "uml";

    render(edge: Readonly<SEdge>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        const route = this.edgeRouterRegistry.route(edge, args);
        if (route.length === 0) {
            return this.renderDanglingEdge("Cannot compute route", edge, context);
        }
        if (!this.isVisible(edge, route, context)) {
            if (edge.children.length === 0) {
                return undefined;
            }
            // The children of an edge are not necessarily inside the bounding box of the route,
            // so we need to render a group to ensure the children have a chance to be rendered.
            return <g>{context.renderChildren(edge, { route })}</g>;
        }
        let showLabel = true;
        let renderBothEnds = false;
        let showRelationship = false;
        let isSource = false;

        if (edge instanceof NotationEdge) {
            showLabel = edge.notation !== this.bachman && edge.notation !== this.crowsfoot;
            showRelationship = edge.showRelationship;
            renderBothEnds = edge.notation === this.crowsfoot || (edge.notation === this.uml && !showRelationship);
            isSource = edge.isSource;
        }
        if (renderBothEnds) {
            if (showLabel) {
                return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                        {this.renderLine(edge, route, context, args)}
                        {this.renderAdditionalsNew(edge, route, true, showRelationship, context)}
                        {this.renderAdditionalsNew(edge, route, false, showRelationship, context)}
                        {context.renderChildren(edge, { route })}
                    </g>;
            }
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionalsNew(edge, route, true, showRelationship, context)}
                {this.renderAdditionalsNew(edge, route, false, showRelationship, context)}
            </g>;
        }
        if (!showRelationship) {
            isSource = false;
        }
        if (showLabel) {
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionalsNew(edge, route, isSource, showRelationship, context)}
                {context.renderChildren(edge, { route })}
            </g>;
        } else {
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
            {this.renderLine(edge, route, context, args)}
            {this.renderAdditionalsNew(edge, route, isSource, showRelationship, context)}
        </g>;
        }
    }

    protected renderAdditionalsNew(edge: SEdge, segments: Point[], isLeft:boolean, showRelationship:boolean, context: RenderingContext): VNode[] {

        let notation = 'default';
        let isSource = false;
        let cardinality = '';

        if (edge instanceof NotationEdge) {
            notation = edge.notation;
            isSource = edge.isSource;
            cardinality = edge.relationshipCardinality;
        }
        if (notation !== this.crowsfoot && notation !== this.uml) {
            // Only child should be a SLabel
            edge.children.forEach((child)=>{
                if (child instanceof SLabel) {
                    cardinality = child.text;
                }
            });
        }
        const source = segments[0];
        const target = segments[segments.length - 1];
        const penultimateElem = segments[segments.length - 2];
        const secondElem = segments[1];

        switch (notation) {
            case this.bachman: {
                return this.createBachmanEdge(source, target, secondElem, penultimateElem, cardinality, isSource);
            }
            case this.crowsfoot: {
                if (!cardinality.includes(':')) {
                    return [];
                }
                const sourceCardinality = cardinality.split(':')[0];
                const targetCardinality = cardinality.split(':')[1];
                if (isLeft) {
                    return this.createCrowsFootEdge(source, secondElem, sourceCardinality);
                }
                return this.createCrowsFootEdge(target, penultimateElem, targetCardinality);
            }
            case this.uml: {
                if (!cardinality.includes(':')) {
                    return [];
                }
                const sourceCardinality = cardinality.split(':')[0];
                const targetCardinality = cardinality.split(':')[1];
                if (!showRelationship) {
                    if (isLeft) {
                        return this.checkForTypeAndCreateUmlEdge(sourceCardinality, source, secondElem, isLeft);
                    }
                } else {
                    if (isSource) {
                        return this.checkForTypeAndCreateUmlEdge(sourceCardinality, source, secondElem, isLeft);
                    }
                }
                return this.checkForTypeAndCreateUmlEdge(targetCardinality, target, penultimateElem, isLeft);
            }
            default: {
                return [];
            }
        }
    }

    private checkForTypeAndCreateUmlEdge(cardinality:string, source:Point, target:Point, isLeft:boolean): VNode[] {
        if (cardinality.includes(' ')) {
            const type = cardinality.split(' ')[0];
            const number = cardinality.split(' ')[1];
            return this.createUmlEdge(source, target, type, number, isLeft);
        }
        return this.createUmlEdge(source, target, 'no type', cardinality, isLeft);
    }

    private createUmlEdge(point:Point, next:Point, type:string, cardinality:string, isLeft:boolean):VNode[] {
        let xText = point.x;
        let yText = point.y;
        let xRectCorrected = point.x;

        if (isLeft) {
            xText += 10;
            xRectCorrected += 1;
        } else {
            xText -= 20 + cardinality.length;
            if (cardinality.length > 3) {
                xText -= cardinality.length * 3;
            } else {
                xText -= cardinality.length;
            }
            xRectCorrected -= 1;
        }
        if (point.y <= next.y) {
            yText += 25;
        } else {
            yText -= 30;
        }
        if (type === 'comp') {
            return [<svg>
                        <text class-top={true} class-sprotty-label={true} x={xText} y={yText}>{cardinality}</text>
                        <rect x={xRectCorrected} y={point.y - 12} width={12} height={12} fill="var(--vscode-editor-background)"
                              transform={`rotate(${this.angle(point, next) + 45}  ${xRectCorrected} ${point.y})`}/>
                    </svg>];
        }
        if (type === 'agg') {
            return [<svg>
                        <text class-top={true} class-sprotty-label={true} x={xText} y={yText}>{cardinality}</text>
                        <rect x={xRectCorrected} y={point.y - 12} width={12} height={12} fill="var(--vscode-editorActiveLineNumber-foreground)"
                            transform={`rotate(${this.angle(point, next) + 45}  ${xRectCorrected} ${point.y})`}/>
                    </svg>];
        }
        return [<text class-top={true} class-sprotty-label={true} x={xText} y={yText}>{cardinality}</text>];
    }


    private createCrowsFootEdge(point:Point, next:Point, cardinality:string):VNode[] {
        switch (cardinality) {
            case '1': return [<svg>
                                    <line x1={point.x + 19} y1={point.y + 11} x2={point.x + 19} y2={point.y - 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x + 10} y1={point.y + 11} x2={point.x + 10} y2={point.y - 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            case '?': return [<svg>
                                    <circle cx={point.x + 25} cy={point.y} r="7" stroke-width="1" fill="var(--vscode-editor-background)"
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x + 10} y1={point.y + 11} x2={point.x + 10} y2={point.y - 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            case '0+': return [<svg>
                                    <circle cx={point.x + 26} cy={point.y} r="7" stroke-width="1" fill="var(--vscode-editor-background)"
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y + 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y - 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            case '1+': return [<svg>
                                    <line x1={point.x + 24} y1={point.y + 11} x2={point.x + 24} y2={point.y - 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y + 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x + 17} y1={point.y} x2={point.x} y2={point.y - 11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            default: return [];
        }
    }

    private createBachmanEdge(source:Point, target:Point, secondElem:Point, penultimateElem :Point, cardinality:string, isSource:boolean):VNode[] {

        let arrowSourceX = source.x;
        let arrowTargetX = target.x;

        // Move arrow from center of the circle
        if (!isNaN(arrowSourceX)) {
            arrowSourceX = arrowSourceX + 9;
        }
        if (!isNaN(arrowTargetX)) {
            arrowTargetX = arrowTargetX + 9;
        }
        if (cardinality === '0' || cardinality === '1') {
            const color = cardinality === '0' ? "var(--vscode-editor-background)" : "var(--vscode-editorActiveLineNumber-foreground)";
            if (isSource) {
                return this.createEdgeWithCircle(color, source);
            }
            return this.createEdgeWithCircle(color, target);

        } else if (cardinality === '0+' || cardinality === '1+') {
            const color = cardinality === '0+' ? "var(--vscode-editor-background)" : "var(--vscode-editorActiveLineNumber-foreground)";
            if (isSource) {
                return this.createEdgeWithCircleAndArrow(color, source, secondElem, arrowSourceX);
            }
            return this.createEdgeWithCircleAndArrow(color, target, penultimateElem, arrowTargetX);

        } else {
            return [];
        }
    }

    private createEdgeWithCircle(color:string, point:Point):VNode[] {
        return [
            <svg>
                <circle cx={point.x} cy={point.y} r="7" stroke-width="1" fill={color}/>
            </svg>
        ];
    }

    private createEdgeWithCircleAndArrow(color:string, point:Point, next:Point, targetX:number):VNode[] {
        return [
            <svg>
                <circle cx={point.x} cy={point.y} r="7" stroke-width="1" fill={color}/>
                <path class-sprotty-edge-arrow={true} d="M 7,-4 L 0,0 L 7,4 Z"
                    transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y}) translate(${targetX} ${point.y})`}/>
            </svg>
        ];
    }

    angle(x0: Point, x1: Point): number {
        return toDegrees(Math.atan2(x1.y - x0.y, x1.x - x0.x));
    }
}