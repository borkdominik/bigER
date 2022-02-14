package org.big.erd.ide.diagram

import com.google.inject.Inject
import com.google.inject.Provider
import java.util.List
import org.eclipse.sprotty.xtext.DiagramServerFactory
import org.eclipse.sprotty.IDiagramServer
import org.eclipse.sprotty.xtext.LanguageAwareDiagramServer


class ERDiagramServerFactory extends DiagramServerFactory {
    
    @Inject Provider<IDiagramServer> diagramServerProvider
    
    // TODO: Change name
    public static val DIAGRAM_TYPE = 'erdiagram-diagram'
    
    override List<String> getDiagramTypes() {
		#[DIAGRAM_TYPE]
	}
	
	override IDiagramServer createDiagramServer(String diagramType, String clientId) {
		val server = diagramServerProvider.get
		server.clientId = clientId
		if (server instanceof ERDiagramServer) {
			server.diagramType = diagramType			
		}
		return server
	}
	
	
}