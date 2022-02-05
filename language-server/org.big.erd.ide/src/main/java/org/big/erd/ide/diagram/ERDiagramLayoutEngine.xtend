package org.big.erd.ide.diagram

import org.eclipse.sprotty.SGraph
import org.eclipse.sprotty.SModelRoot
import org.eclipse.sprotty.layout.ElkLayoutEngine
import org.eclipse.sprotty.layout.SprottyLayoutConfigurator
import org.eclipse.elk.core.options.CoreOptions
import org.eclipse.sprotty.Action
import org.eclipse.elk.alg.layered.options.LayeredOptions
import org.eclipse.elk.core.options.Direction
// Keeping these imports for possible later use
// import org.apache.log4j.Logger
// import org.eclipse.elk.core.options.CoreOptions;
// import org.eclipse.elk.alg.layered.options.PortSortingStrategy
// import org.eclipse.elk.alg.layered.options.NodeFlexibility
// import org.eclipse.elk.core.options.PortConstraints
// import org.eclipse.elk.core.options.PortSide
// import org.eclipse.elk.alg.force.options.StressOptions;
// import org.eclipse.elk.core.options.PortAlignment
// import org.eclipse.elk.core.options.EdgeRouting
// import org.eclipse.elk.alg.force.options.ForceOptions;
//import org.eclipse.elk.alg.layered.options.NodePlacementStrategy

class ERDiagramLayoutEngine extends ElkLayoutEngine {

    //static val LOG = Logger.getLogger(ERDiagramLayoutEngine)
	
	override layout(SModelRoot root, Action cause) {
		if (root instanceof SGraph) {
			val configurator = new SprottyLayoutConfigurator
			configurator.configureByType('graph')
				.setProperty(CoreOptions.DIRECTION, Direction.RIGHT)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 30.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 30.0)
				.setProperty(LayeredOptions.SPACING_EDGE_NODE_BETWEEN_LAYERS, 30.0)
				.setProperty(LayeredOptions.SPACING_EDGE_EDGE, 30.0)
				.setProperty(LayeredOptions.SPACING_EDGE_EDGE_BETWEEN_LAYERS, 0.0)
			layout(root, configurator, cause)
		}
	}
}