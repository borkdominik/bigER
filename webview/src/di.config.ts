import { Container, ContainerModule } from 'inversify';
import { LibavoidRouter, LibavoidDiamondAnchor, LibavoidEllipseAnchor, LibavoidRectangleAnchor, RouteType } from 'sprotty-routing-libavoid';
import 'sprotty/css/sprotty.css';
import 'sprotty/css/command-palette.css';
import '../css/diagram.css';
import '../css/popup.css';
import {
    configureModelElement, HtmlRoot, HtmlRootView, overrideViewerOptions, PreRenderedElement, PreRenderedView,
    TYPES, loadDefaultModules, ConsoleLogger, LogLevel, SCompartmentView, SCompartment, editLabelFeature,
    labelEditUiModule, SModelRoot, SLabel, ExpandButtonHandler, SButton, expandFeature, SLabelView, ExpandButtonView,
    editFeature
} from 'sprotty';
import { InheritanceEdgeView, ERModelView, EntityNodeView, RelationshipNodeView, NotationEdgeView } from './views';
import { EntityNode, ERModel, MultiplicityLabel, NotationEdge, RelationshipNode, InheritanceEdge } from './model';
import { BigerEdgeLayoutPostprocessor } from './layout-postprocessor';

/**
 * Sprotty Dependency Injection container
 */
const DiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    // Router
    bind(LibavoidRouter).toSelf().inSingletonScope();
    bind(TYPES.IEdgeRouter).toService(LibavoidRouter);
    bind(TYPES.IAnchorComputer).to(LibavoidDiamondAnchor).inSingletonScope();
    bind(TYPES.IAnchorComputer).to(LibavoidEllipseAnchor).inSingletonScope();
    bind(TYPES.IAnchorComputer).to(LibavoidRectangleAnchor).inSingletonScope();

    // custom edge layout postprocessor
    bind(BigerEdgeLayoutPostprocessor).toSelf().inSingletonScope();
    bind(TYPES.IVNodePostprocessor).toService(BigerEdgeLayoutPostprocessor);

    // change animation speed to 300ms
    rebind(TYPES.CommandStackOptions).toConstantValue({
        defaultDuration: 300,
        undoHistoryLimit: 50
    });
    // Model element bindings
    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, 'graph', ERModel, ERModelView);
    // Nodes
    configureModelElement(context, 'node:entity', EntityNode, EntityNodeView, { enable: [expandFeature] });
    configureModelElement(context, 'node:relationship', RelationshipNode, RelationshipNodeView);
    // Compartments
    configureModelElement(context, 'comp:entity-header', SCompartment, SCompartmentView);
    configureModelElement(context, 'comp:attributes', SCompartment, SCompartmentView);
    configureModelElement(context, 'comp:attribute-row', SCompartment, SCompartmentView);
    // Edges
    configureModelElement(context, 'edge', NotationEdge, NotationEdgeView, { disable: [editFeature] });
    configureModelElement(context, 'edge:inheritance', InheritanceEdge, InheritanceEdgeView);
    // Labels
    configureModelElement(context, 'label:header', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:relationship', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:top', MultiplicityLabel, SLabelView);
    configureModelElement(context, 'label:text', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:key', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:partial-key', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:derived', SLabel, SLabelView, { enable: [editLabelFeature] });
    // Additional Sprotty elements
    configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
    configureModelElement(context, 'palette', SModelRoot, HtmlRootView);
    configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
    configureModelElement(context, ExpandButtonHandler.TYPE, SButton, ExpandButtonView);
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
        popupOpenDelay: 0
    });

    // Router options
    const router = container.get(LibavoidRouter);
    router.setOptions({
        routingType: RouteType.Orthogonal,
        segmentPenalty: 50,
        // at least height of label to avoid labels overlap if
        // there two neighbour edges have labels on the position
        idealNudgingDistance: 24,
        // 25 - height of label text + label offset. Such shape buffer distance is required to
        // avoid label over shape
        shapeBufferDistance: 25,
        nudgeOrthogonalSegmentsConnectedToShapes: true,
        // allow or disallow moving edge end from center
        nudgeOrthogonalTouchingColinearSegments: false,
    });

    return container;
}
