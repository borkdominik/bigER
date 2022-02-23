package org.big.erd.ide.diagram

import org.eclipse.sprotty.Action
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer
import com.google.inject.Inject
import org.eclipse.sprotty.xtext.ReconnectAction

class ERDiagramServer extends LanguageAwareDiagramServer {
	
	@Inject ReconnectHandler reconnectHandler
	
	
	// handle new actions here
	override protected handleAction(Action action) {
		if (action.kind === ReconnectAction.KIND) 
			reconnectHandler.handle(action as ReconnectAction, this)
		else 
			super.handleAction(action)
	}
} 