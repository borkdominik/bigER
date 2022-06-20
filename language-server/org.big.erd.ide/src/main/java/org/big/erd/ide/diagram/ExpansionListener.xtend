package org.big.erd.ide.diagram

import org.eclipse.sprotty.Action
import org.eclipse.sprotty.IDiagramExpansionListener
import org.eclipse.sprotty.IDiagramServer
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer

class ExpansionListener implements IDiagramExpansionListener {

	override expansionChanged(Action action, IDiagramServer server) {
		if (server instanceof LanguageAwareDiagramServer) {
			server.diagramLanguageServer.diagramUpdater.updateDiagram(server)
		}
	}
}
