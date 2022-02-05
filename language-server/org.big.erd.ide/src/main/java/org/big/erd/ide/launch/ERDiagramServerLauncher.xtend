package org.big.erd.ide.launch

import org.eclipse.sprotty.xtext.launch.DiagramServerLauncher

class ERDiagramServerLauncher extends DiagramServerLauncher {

	override createSetup() {
		new ERDiagramLanguageServerSetup
	}

	def static void main(String[] args) {
		new ERDiagramServerLauncher().run(args)
	}
}