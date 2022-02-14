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
import org.eclipse.elk.alg.layered.options.NodeFlexibility
// import org.eclipse.elk.core.options.PortConstraints
// import org.eclipse.elk.core.options.PortSide
// import org.eclipse.elk.alg.force.options.StressOptions;
// import org.eclipse.elk.core.options.PortAlignment
// import org.eclipse.elk.core.options.EdgeRouting
// import org.eclipse.elk.alg.force.options.ForceOptions;
import org.eclipse.elk.alg.layered.options.NodePlacementStrategy
import org.eclipse.elk.core.options.EdgeRouting
import org.eclipse.elk.alg.layered.options.Spacings
import org.eclipse.elk.core.options.PortConstraints

class ERDiagramLayoutEngine extends ElkLayoutEngine {

    //static val LOG = Logger.getLogger(ERDiagramLayoutEngine)
	
	override layout(SModelRoot root, Action cause) {
		if (root instanceof SGraph) {
			val configurator = new SprottyLayoutConfigurator
			configurator.configureByType('graph')
				.setProperty(LayeredOptions.NODE_PLACEMENT_STRATEGY, NodePlacementStrategy.NETWORK_SIMPLEX)
				.setProperty(CoreOptions.DIRECTION, Direction.RIGHT)
				//.setProperty(CoreOptions.EDGE_ROUTING, EdgeRouting.SPLINES)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 40.0)
				
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 40.0)
				.setProperty(LayeredOptions.SPACING_EDGE_EDGE, 0.0)
				/* 
				.setProperty(LayeredOptions.SPACING_NODE_SELF_LOOP, 20.0)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 40.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 40.0)
				.setProperty(LayeredOptions.SPACING_EDGE_EDGE, 20.0)
				.setProperty(LayeredOptions.SPACING_EDGE_EDGE_BETWEEN_LAYERS, 0.0)
				.setProperty(LayeredOptions.SPACING_EDGE_NODE, 20.0)
				.setProperty(LayeredOptions.SPACING_EDGE_NODE_BETWEEN_LAYERS, 20.0)
				* */
				
				.setProperty(LayeredOptions.NODE_PLACEMENT_NETWORK_SIMPLEX_NODE_FLEXIBILITY, NodeFlexibility.PORT_POSITION)
				
			configurator.configureByType('node')
				.setProperty(LayeredOptions.SPACING_BASE_VALUE, 40.0)
			/*configurator.configureByType('node:relationship')	
				.setProperty(LayeredOptions.PORT_CONSTRAINTS, PortConstraints.)
				
				*/
			layout(root, configurator, cause)
		}
	}
}