package org.big.erd.ide.diagram

import org.eclipse.sprotty.Action
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer
import com.google.inject.Inject
import org.eclipse.sprotty.xtext.ReconnectAction
import org.apache.log4j.Logger

class ERDiagramServer extends LanguageAwareDiagramServer {
	
	static val LOG = Logger.getLogger(ERDiagramServer)
	
	@Inject ReconnectHandler reconnectHandler
	@Inject NotationHandler notationHandler
	
	override protected handleAction(Action action) {
		if (action.kind === ReconnectAction.KIND) 
			reconnectHandler.handle(action as ReconnectAction, this)
		else if (action.kind === ChangeNotationAction.KIND) {
			notationHandler.handle(action as ChangeNotationAction, this)
		} else 
			super.handleAction(action)
	}
	
} 