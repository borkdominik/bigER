package org.xtext.example.erd.ide.diagram

import org.eclipse.sprotty.xtext.DiagramServerFactory

class ERDiagramServerFactory extends DiagramServerFactory {
    
    override getDiagramTypes() {
		#['erdiagram-diagram']
	}
}