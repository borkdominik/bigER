import { Container, ContainerModule } from 'inversify';
import 'sprotty/css/sprotty.css';
import 'sprotty/css/command-palette.css';
import '../css/diagram.css';
import {
    configureModelElement, HtmlRoot, HtmlRootView, overrideViewerOptions, PreRenderedElement, PreRenderedView, SEdge, 
    SRoutingHandle, SRoutingHandleView, TYPES, loadDefaultModules, ConsoleLogger, LogLevel,  SCompartmentView,
    SCompartment, editLabelFeature, labelEditUiModule, SModelRoot, SLabel, ExpandButtonHandler,
    SButton, expandFeature, DiamondNodeView, DiamondNode, SLabelView, ManhattanEdgeRouter, PolylineEdgeView,
} from 'sprotty';
import { EntityView, ExpandEntityView, InheritanceEdgeView, ERModelView } from './views';
import { EntityNode, ERModel, MultiplicityLabel, RelationEdge } from './model';
import { CustomRouter } from './custom-router';

/**
 * Sprotty Dependency Injection container 
 */
const DiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {

    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    rebind(ManhattanEdgeRouter).to(CustomRouter).inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, 'graph', ERModel, ERModelView);
    configureModelElement(context, 'node', EntityNode, EntityView, { enable: [expandFeature] });
    configureModelElement(context, 'node:weak', EntityNode, EntityView, { enable: [expandFeature] });
    configureModelElement(context, 'node:relationship', DiamondNode, DiamondNodeView);
    configureModelElement(context, 'node:weak-relationship', DiamondNode, DiamondNodeView);
    configureModelElement(context, 'comp:header', SCompartment, SCompartmentView);
    configureModelElement(context, 'comp:comp', SCompartment, SCompartmentView);
    configureModelElement(context, 'comp:attributes', SCompartment, SCompartmentView);
    configureModelElement(context, 'edge', RelationEdge, PolylineEdgeView);
    configureModelElement(context, 'edge:inheritance', SEdge, InheritanceEdgeView);
    configureModelElement(context, 'label:header', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:relationship', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:top', MultiplicityLabel, SLabelView);
    configureModelElement(context, 'label:text', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:text-key', SLabel, SLabelView);
    configureModelElement(context, 'label:text-fk', SLabel, SLabelView);
    configureModelElement(context, 'label:text-pk', SLabel, SLabelView);
    configureModelElement(context, 'label:text-null', SLabel, SLabelView);
    configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
    configureModelElement(context, 'palette', SModelRoot, HtmlRootView);
    configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
    configureModelElement(context, 'routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, 'volatile-routing-point', SRoutingHandle, SRoutingHandleView);
    /*configureModelElement(context, 'port', CreateRelationPort, TriangleButtonView, {
        enable: [popupFeature, creatingOnDragFeature, hoverFeedbackFeature]
    });*/
    configureModelElement(context, ExpandButtonHandler.TYPE, SButton, ExpandEntityView);
});

/**
 * Creates the container, loads the default Sprotty modules and adds ViewerOptions
 */
export function createDiagramContainer(widgetId: string): Container {
    
    const container = new Container();

    // use labelEditUi from VS Code
    loadDefaultModules(container, { exclude: [labelEditUiModule] });
    container.load(DiagramModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden',
        popupOpenDelay: 200
    });
    return container;
}


