package org.big.erd.ide.diagram

import org.eclipse.sprotty.xtext.DefaultDiagramModule
import org.eclipse.sprotty.xtext.IDiagramGenerator

class DiagramModule extends DefaultDiagramModule {

	def Class<? extends IDiagramGenerator> bindIDiagramGenerator() {
		ERDiagramGenerator
	} 
	
	override bindIDiagramServer() {
		ERDiagramServer
	}

    override bindIDiagramServerFactory() {
		ERDiagramServerFactory
	}

    override bindILayoutEngine() {
		ERDiagramLayoutEngine
	}

	override bindIPopupModelFactory() {
		PopupModelFactory
	}

	override bindIDiagramExpansionListener() {
		ExpansionListener
	}
	
}