package org.big.erd.ide.diagram

import org.eclipse.sprotty.Action
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer
import com.google.inject.Inject
import org.eclipse.sprotty.xtext.ReconnectAction

class ERDiagramServer extends LanguageAwareDiagramServer {

	@Inject ReconnectHandler reconnectHandler
	@Inject GenerateHandler generateHandler
	@Inject NotationHandler notationHandler
	@Inject CreateElementHandler createElementHandler

	override protected handleAction(Action action) {
		if (action.kind === ReconnectAction.KIND) {
			reconnectHandler.handle(action as ReconnectAction, this)
		} else if (action.kind === ChangeNotationAction.KIND) {
			notationHandler.handle(action as ChangeNotationAction, this)
		} else if (action.kind === CodeGenerateAction.KIND) {
			generateHandler.handle(action as CodeGenerateAction, this)
		} else if (action.kind === CreateElementEditAction.KIND) {
			createElementHandler.handle(action as CreateElementEditAction, this)
		} else {
			super.handleAction(action)
		}
	}

}
