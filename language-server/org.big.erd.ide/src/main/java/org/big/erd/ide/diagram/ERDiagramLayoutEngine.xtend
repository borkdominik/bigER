package org.big.erd.ide.diagram

import org.eclipse.sprotty.SModelRoot
import org.eclipse.sprotty.layout.ElkLayoutEngine
import org.eclipse.sprotty.layout.SprottyLayoutConfigurator
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.sprotty.Action
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.elk.core.options.Direction
import org.apache.log4j.Logger
import org.big.erd.entityRelationship.NotationType
import org.big.erd.ide.diagram.actions.ChangeLayoutDirectionAction

class ERDiagramLayoutEngine extends ElkLayoutEngine {

	static val LOG = Logger.getLogger(ERDiagramLayoutEngine)

	override layout(SModelRoot root, Action cause) {
		
		if (root instanceof ERModel) {
			LOG.debug("Applying macro layout for model with id: '" + root.id + "'")
			val configurator = new SprottyLayoutConfigurator

			
			if (cause instanceof ChangeLayoutDirectionAction) {
				switch (cause.direction) {
					case "left": configurator.configureByType('graph').setProperty(CoreOptions.DIRECTION, Direction.LEFT)
					case "right": configurator.configureByType('graph').setProperty(CoreOptions.DIRECTION, Direction.RIGHT)
					case "up": configurator.configureByType('graph').setProperty(CoreOptions.DIRECTION, Direction.UP)
					case "down": configurator.configureByType('graph').setProperty(CoreOptions.DIRECTION, Direction.DOWN)
					default: configurator.configureByType('graph').setProperty(CoreOptions.DIRECTION, Direction.RIGHT)
				}
			} else {
				configurator.configureByType('graph').setProperty(CoreOptions.DIRECTION, Direction.RIGHT)
			}
			

			configurator.configureByType('graph')
				.setProperty(CoreOptions.SPACING_NODE_NODE, 50.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, root.notation.equals(NotationType.UML.toString)? 100.0 : 50.0)
				.setProperty(CoreOptions.SPACING_PORT_PORT, 50.0)

			layout(root, configurator, cause)
			LOG.debug("Finished computing macro layout.")
		}
	}
}
