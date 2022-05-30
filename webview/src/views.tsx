/** @jsx svg */
import { VNode } from "snabbdom";
import { RenderingContext, RectangularNodeView, SNode, SEdge, Point, PolylineEdgeView, toDegrees, ExpandButtonView, findParentByFeature, isExpandable,
         svg, SButton, SPort, IView, SLabel, IViewArgs , SGraphView, EdgeRouterRegistry} from 'sprotty';
import {NotationEdge, ERModel } from './model';
import { injectable, inject } from 'inversify';

@injectable()
export class ERModelView<IRenderingArgs> extends SGraphView<IRenderingArgs> {

    @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

    render(model: Readonly<ERModel>, context: RenderingContext, args?: IRenderingArgs): VNode {
        const notationButton = document.getElementById('notationButton');
        if (notationButton) {
            notationButton.innerHTML = convertNotatoinString(model)+'<span id="button-icon" slot="start" class="fas fa-angle-left"/>'
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

function convertNotatoinString(model: Readonly<ERModel>):string{
    switch(model.notation){
        case 'bachman'   : return 'Bachman';
        case 'chen'      : return 'Chen';
        case 'crowsfoot' : return 'Crows Foot';
        case 'minmax'    : return 'Min Max';
        case 'uml'       : return 'UML';
        default : return '';
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
export class NotationEdgeView extends PolylineEdgeView {

    bachman:string = 'bachman'
    crowsfoot:string = 'crowsfoot';
    uml:string = "uml";

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
        var showLabel = true;
        var renderBothEnds = false;
        var showRelationship = false;
        var isSource = false;

        if(edge instanceof NotationEdge){
            showLabel = edge.notation !== this.bachman && edge.notation !== this.crowsfoot;
            showRelationship = edge.showRelationship
            renderBothEnds = edge.notation === this.crowsfoot || (edge.notation === this.uml && !showRelationship);
            isSource = edge.isSource
        }
        if(renderBothEnds){
            if(showLabel){
                return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                        {this.renderLine(edge, route, context, args)}
                        {this.renderAdditionalsNew(edge, route,true,showRelationship,context)}
                        {this.renderAdditionalsNew(edge, route,false,showRelationship,context)}
                        {context.renderChildren(edge, { route })}
                    </g>;
            }
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionalsNew(edge, route,true,showRelationship,context)}
                {this.renderAdditionalsNew(edge, route,false,showRelationship,context)}
            </g>;
        }else if(showRelationship){
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionalsNew(edge, route, isSource,showRelationship, context)}
            </g>;
        }else if(showLabel){
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
                {this.renderLine(edge, route, context, args)}
                {this.renderAdditionalsNew(edge, route,false,showRelationship, context)}
                {context.renderChildren(edge, { route })}
            </g>;
        }else{
            return <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback}>
            {this.renderLine(edge, route, context, args)}
            {this.renderAdditionalsNew(edge, route,false,showRelationship,context)}
        </g>;
        }
    }

    protected renderAdditionalsNew(edge: SEdge, segments: Point[], isLeft:boolean, showRelationship:boolean, context: RenderingContext): VNode[] {

        var notation:String = 'default';
        var isSource:boolean = false;
        var cardinality:String = '';

        if(edge instanceof NotationEdge){
            notation = edge.notation
            isSource = edge.isSource
            cardinality = edge.relationshipCardinality
        }
        if(notation !== this.crowsfoot && notation !== this.uml){
            // Only child should be a SLabel
            edge.children.forEach((child)=>{
                if(child instanceof SLabel){
                    cardinality = child.text
                }
            })
        }
        const source = segments[0];
        const target = segments[segments.length - 1];
        const penultimateElem = segments[segments.length - 2];
        const secondElem = segments[1];

        switch(notation){
            case this.bachman   :   return this.createBachmanEdge(source, target, secondElem, penultimateElem, cardinality, isSource);

            case this.crowsfoot :   if(!cardinality.includes(':')){
                                        return [];
                                    }
                                    var sourceCardinality = cardinality.split(':')[0];
                                    var targetCardinality = cardinality.split(':')[1];
                                   
                                    if(isLeft){
                                        return this.createCrowsFootEdge(source, secondElem, sourceCardinality)
                                    }
                                    return this.createCrowsFootEdge(target, penultimateElem, targetCardinality)

            case this.uml       :   if(!cardinality.includes(':')){
                                        return [];
                                    }
                                    var sourceCardinality = cardinality.split(':')[0];
                                    var targetCardinality = cardinality.split(':')[1];
                                    if(!showRelationship){
                                        if(isLeft){
                                            return this.checkForTypeAndCreateUmlEdge(sourceCardinality,source,secondElem, isLeft)
                                        }
                                    }else{
                                        if(isSource){
                                            return this.checkForTypeAndCreateUmlEdge(sourceCardinality,source,secondElem, isLeft)
                                        }
                                    }
                                    return this.checkForTypeAndCreateUmlEdge(targetCardinality,target,penultimateElem, isLeft)

            default             :   return [];
        }
    }

    private checkForTypeAndCreateUmlEdge(cardinality:string, source:Point, target:Point, isLeft:boolean): VNode[]{
        if(cardinality.includes(' ')){
            var type = cardinality.split(' ')[0]
            var number = cardinality.split(' ')[1]
            return this.createUmlEdge(source,target,type, number,isLeft)
        }
        return this.createUmlEdge(source,target,'no type', cardinality,isLeft)
    }

    private createUmlEdge(point:Point,next:Point,type:string, cardinality:String, isLeft:boolean):VNode[]{
        var xText = point.x
        var yText = point.y
        var xRectCorrected = point.x
        
        if(isLeft){
            xText += 10
            xRectCorrected += 1
        }else{
            xText -= 20+cardinality.length
            if(cardinality.length > 3){
                xText -= cardinality.length * 3
            }else{
                xText -= cardinality.length 
            }
            xRectCorrected -= 1
        }
        if(point.y <= next.y){
            yText += 25
        }else{
            yText -= 30
        }
        if(type === 'comp'){
            return [<svg>
                        <text class-top={true} class-sprotty-label={true} x={xText} y={yText}>{cardinality}</text>
                        <rect x={xRectCorrected} y={point.y-12} width={12} height={12} fill="var(--vscode-editor-background)"
                              transform={`rotate(${this.angle(point, next)+45}  ${xRectCorrected} ${point.y})`}/>
                    </svg>]
        }
        if(type === 'agg'){
            return [<svg>
                        <text class-top={true} class-sprotty-label={true} x={xText} y={yText}>{cardinality}</text>
                        <rect x={xRectCorrected} y={point.y-12} width={12} height={12} fill="var(--vscode-editorActiveLineNumber-foreground)"
                            transform={`rotate(${this.angle(point, next)+45}  ${xRectCorrected} ${point.y})`}/>
                    </svg>]
        }
        return [<text class-top={true} class-sprotty-label={true} x={xText} y={yText}>{cardinality}</text>]
    }


    private createCrowsFootEdge(point:Point, next:Point, cardinality:String):VNode[]{
        switch(cardinality){
            case '1' :  return  [<svg>
                                    <line x1={point.x+19} y1={point.y+11} x2={point.x+19} y2={point.y-11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x+10} y1={point.y+11} x2={point.x+10} y2={point.y-11} 
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            case '?' :  return  [<svg>
                                    <circle cx={point.x+25} cy={point.y} r="7" stroke-width="1" fill="var(--vscode-editor-background)"
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x+10} y1={point.y+11} x2={point.x+10} y2={point.y-11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            case '0+':  return  [<svg>
                                    <circle cx={point.x+26} cy={point.y} r="7" stroke-width="1" fill="var(--vscode-editor-background)"
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x+17} y1={point.y} x2={point.x} y2={point.y+11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x+17} y1={point.y} x2={point.x} y2={point.y-11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            case '1+': return [ <svg>
                                    <line x1={point.x+24} y1={point.y+11} x2={point.x+24} y2={point.y-11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x+17} y1={point.y} x2={point.x} y2={point.y+11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                    <line x1={point.x+17} y1={point.y} x2={point.x} y2={point.y-11}
                                        transform={`rotate(${this.angle(point, next)} ${point.x} ${point.y})`}/>
                                </svg>];
            default : return [];
        }
    }

    private createBachmanEdge(source:Point, target:Point, secondElem:Point, penultimateElem :Point, cardinality:String, isSource:boolean):VNode[]{

        var arrowSourceX = source.x;
        var arrowTargetX = target.x;

        // Move arrow from center of the circle
        if(!isNaN(arrowSourceX)){
            arrowSourceX = arrowSourceX + 9;
        }
        if(!isNaN(arrowTargetX)){
            arrowTargetX = arrowTargetX + 9;
        }
        if(cardinality === '0' || cardinality === '1'){
            const color = cardinality === '0' ? "var(--vscode-editor-background)" : "var(--vscode-editorActiveLineNumber-foreground)";
            if(isSource){
                return this.createEdgeWithCircle(color, source);
            }
            return this.createEdgeWithCircle(color, target);

        } else if (cardinality === '0+' || cardinality === '1+'){
            const color = cardinality === '0+' ? "var(--vscode-editor-background)" : "var(--vscode-editorActiveLineNumber-foreground)";
            if(isSource){
                return this.createEdgeWithCircleAndArrow(color, source, secondElem, arrowSourceX);
            }
            return this.createEdgeWithCircleAndArrow(color, target, penultimateElem, arrowTargetX);
            
        }else{
            return [];
        } 
    }

    private createEdgeWithCircle(color:String, point:Point):VNode[]{
        return [
            <svg>
                <circle cx={point.x} cy={point.y} r="7" stroke-width="1" fill={color}/>
            </svg>
        ];
    }

    private createEdgeWithCircleAndArrow(color:String, point:Point, next:Point,targetX:Number):VNode[]{
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

