package org.xtext.example.erd.ide.diagram

import org.eclipse.sprotty.xtext.DefaultDiagramModule
import org.eclipse.sprotty.xtext.IDiagramGenerator

class ERDiagramModule extends DefaultDiagramModule {

	def Class<? extends IDiagramGenerator> bindIDiagramGenerator() {
		ERDiagramGenerator
	} 

    override bindIDiagramServerFactory() {
		ERDiagramServerFactory
	}

    override bindILayoutEngine() {
		ERDiagramLayoutEngine
	}

	override bindIPopupModelFactory() {
		ERDiagramPopup
	}

	override bindIDiagramExpansionListener() {
		ERDiagramExpansionListener
	}

	override bindIDiagramServer() {
		ERDiagramServer
	}	
}