package org.big.erd.ide.diagram

import org.eclipse.sprotty.SModelRoot
import org.eclipse.sprotty.layout.ElkLayoutEngine
import org.eclipse.sprotty.layout.SprottyLayoutConfigurator
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.sprotty.Action
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.elk.core.options.Direction
import org.eclipse.elk.core.options.PortAlignment
import org.eclipse.elk.core.options.PortConstraints
import org.apache.log4j.Logger

class ERDiagramLayoutEngine extends ElkLayoutEngine {

	static val LOG = Logger.getLogger(ERDiagramLayoutEngine)

	override layout(SModelRoot root, Action cause) {
		
		if (root instanceof ERModel) {
			LOG.debug("Applying macro layout for model with id: '" + root.id + "'")
			val configurator = new SprottyLayoutConfigurator

			configurator.configureByType('graph')
				.setProperty(CoreOptions.DIRECTION, Direction.RIGHT)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 40.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 40.0)
				.setProperty(CoreOptions.SPACING_PORT_PORT, 30.0)
			
			if (root.notation === 'crowsfoot') {
				configurator.configureByType('graph')
					.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 120.0)
			}
			
			configurator.configureByType('node:entity')
				.setProperty(CoreOptions.PORT_ALIGNMENT_DEFAULT, PortAlignment.CENTER)
				.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_SIDE)
				.setProperty(CoreOptions.SPACING_PORT_PORT, 30.0)
			
			configurator.configureByType('node:relationship')
				.setProperty(CoreOptions.PORT_ALIGNMENT_DEFAULT, PortAlignment.CENTER)
				.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_SIDE)

			configurator.configureByType('node:weak-relationship')
				.setProperty(CoreOptions.PORT_ALIGNMENT_DEFAULT, PortAlignment.CENTER)
				.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_SIDE)

			layout(root, configurator, cause)
			LOG.debug("Finished computing macro layout.")
		}
	}

}
