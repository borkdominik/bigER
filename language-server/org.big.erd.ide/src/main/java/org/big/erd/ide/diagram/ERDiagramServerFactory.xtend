package org.big.erd.ide.diagram

import org.eclipse.sprotty.xtext.DiagramServerFactory

class ERDiagramServerFactory extends DiagramServerFactory {
    
    override getDiagramTypes() {
		#['erdiagram-diagram']
	}
}