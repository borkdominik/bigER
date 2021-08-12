import 'sprotty/css/sprotty.css';
import 'sprotty/css/command-palette.css';
import '../css/diagram.css';

import { Container, ContainerModule } from 'inversify';

import {
    configureModelElement, HtmlRoot, HtmlRootView, overrideViewerOptions, PreRenderedElement,
    PreRenderedView, SEdge, SGraphView, SRoutingHandle, SRoutingHandleView, TYPES, loadDefaultModules,
    SGraph, ConsoleLogger, LogLevel, PolylineEdgeView,  SCompartmentView,  SCompartment,
    RectangularNode, editLabelFeature, labelEditUiModule, SModelRoot, SLabel, CenterGridSnapper, ExpandButtonHandler, SButton, expandFeature
} from 'sprotty';

import { EntityView, ExpandEntityView, InheritanceEdgeView } from './views';
import { MultiplicityLabel} from './model';
import { DiamondNodeView, DiamondNode, SLabelView } from 'sprotty';

const ERDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {

    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.info);
    bind(TYPES.ISnapper).to(CenterGridSnapper);

    const context = { bind, unbind, isBound, rebind };

    configureModelElement(context, 'graph', SGraph, SGraphView);
    configureModelElement(context, 'node', RectangularNode, EntityView, {
        enable: [expandFeature]
    });
    configureModelElement(context, 'node:weak', RectangularNode, EntityView, {
        enable: [expandFeature]
    });

    configureModelElement(context, 'node:relationship', DiamondNode, DiamondNodeView);
    configureModelElement(context, 'node:weak-relationship', DiamondNode, DiamondNodeView);
    configureModelElement(context, 'comp:header', SCompartment, SCompartmentView);
    configureModelElement(context, 'comp:comp', SCompartment, SCompartmentView);
    configureModelElement(context, 'comp:attributes', SCompartment, SCompartmentView);
    configureModelElement(context, 'edge', SEdge, PolylineEdgeView);
    configureModelElement(context, 'edge:inheritance', SEdge, InheritanceEdgeView);
    configureModelElement(context, 'label:header', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:relationship', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:top', MultiplicityLabel, SLabelView);
    configureModelElement(context, 'label:text', SLabel, SLabelView);
    configureModelElement(context, 'label:text-key', SLabel, SLabelView);
    configureModelElement(context, 'label:text-fk', SLabel, SLabelView);
    configureModelElement(context, 'label:text-pk', SLabel, SLabelView);
    configureModelElement(context, 'label:text-null', SLabel, SLabelView);
    configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
    configureModelElement(context, 'palette', SModelRoot, HtmlRootView);
    configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
    configureModelElement(context, 'routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, 'volatile-routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, ExpandButtonHandler.TYPE, SButton, ExpandEntityView);
});

export function createERDiagramContainer(widgetId: string): Container {
    const container = new Container();
    loadDefaultModules(container, { exclude: [labelEditUiModule] });
    container.load(ERDiagramModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden',
        popupOpenDelay: 700
    });
    return container;
}

