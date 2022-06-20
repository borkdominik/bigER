package org.big.erd.ide.launch

import org.eclipse.sprotty.xtext.launch.DiagramServerSocketLauncher

class ERDiagramSocketServer extends DiagramServerSocketLauncher {

	override createSetup() {
		new ERDiagramLanguageServerSetup
	}

	def static void main(String... args) {
		new ERDiagramSocketServer().run(args)
	}
}
