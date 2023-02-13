package org.big.erd.ide.diagram

import org.eclipse.sprotty.Action
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer
import com.google.inject.Inject
import org.big.erd.ide.diagram.actions.AddAttributeHandler
import org.big.erd.ide.diagram.actions.CreateElementHandler
import org.big.erd.ide.diagram.actions.NotationHandler
import org.big.erd.ide.diagram.actions.ChangeNotationAction
import org.big.erd.ide.diagram.actions.CreateElementEditAction
import org.big.erd.ide.diagram.actions.AddAttributeAction
import org.big.erd.ide.diagram.actions.ChangeLayoutDirectionAction
import org.eclipse.sprotty.SGraph
import org.eclipse.sprotty.UpdateModelAction

class ERDiagramServer extends LanguageAwareDiagramServer {

	@Inject NotationHandler notationHandler
	@Inject CreateElementHandler createElementHandler
	@Inject AddAttributeHandler addAttributeHandler

	override protected handleAction(Action action) {
		if (action.kind === ChangeNotationAction.KIND) {
			notationHandler.handle(action as ChangeNotationAction, this)
		} else if (action.kind === CreateElementEditAction.KIND) {
			createElementHandler.handle(action as CreateElementEditAction, this)
		} else if (action.kind === AddAttributeAction.KIND) {
			addAttributeHandler.handle(action as AddAttributeAction, this)
		} else if (action.kind === ChangeLayoutDirectionAction.KIND) {
			handle(action as ChangeLayoutDirectionAction);
		} else {
			super.handleAction(action)
		}
	}
	
	def void handle(ChangeLayoutDirectionAction action) {
		val model = getModel() as SGraph;
		val layoutEngine = getLayoutEngine() as ERDiagramLayoutEngine;
		layoutEngine.layout(model, action);
		dispatch(new UpdateModelAction(model));
	}

}
