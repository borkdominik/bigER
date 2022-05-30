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
import org.eclipse.elk.core.options.PortAlignment
import org.eclipse.elk.core.options.PortConstraints
import org.eclipse.elk.core.options.PortSide

class ERDiagramLayoutEngine extends ElkLayoutEngine {

    //static val LOG = Logger.getLogger(ERDiagramLayoutEngine)
	
	// TODO: Improve layout
	override layout(SModelRoot root, Action cause) {
		if (root instanceof ERModel) {
			val configurator = new SprottyLayoutConfigurator
			configurator.configureByType('graph')
				.setProperty(CoreOptions.DIRECTION, Direction.RIGHT)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 40.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 40.0)
				/* 
				.setProperty(CoreOptions.EDGE_ROUTING, EdgeRouting.SPLINES)
				.setProperty(LayeredOptions.SPACING_NODE_SELF_LOOP, 20.0)
				.setProperty(CoreOptions.SPACING_NODE_NODE, 40.0)
				.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 40.0)
				.setProperty(LayeredOptions.SPACING_EDGE_EDGE, 20.0)
				.setProperty(LayeredOptions.SPACING_EDGE_EDGE_BETWEEN_LAYERS, 0.0)
				.setProperty(LayeredOptions.SPACING_EDGE_NODE, 20.0)
				.setProperty(LayeredOptions.SPACING_EDGE_NODE_BETWEEN_LAYERS, 20.0)
				*/
			configurator.configureByType('node')
				 .setProperty(CoreOptions.PORT_ALIGNMENT_DEFAULT, PortAlignment.CENTER)
				 .setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_SIDE)
			configurator.configureByType('node:relationship')
				.setProperty(CoreOptions.PORT_ALIGNMENT_DEFAULT, PortAlignment.CENTER)
				.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_SIDE)
			configurator.configureByType('node:weak-relationship')
				.setProperty(CoreOptions.PORT_ALIGNMENT_DEFAULT, PortAlignment.CENTER)
				.setProperty(CoreOptions.PORT_CONSTRAINTS, PortConstraints.FIXED_SIDE)
			configurator.configureByType('port')
				.setProperty(CoreOptions.PORT_SIDE, PortSide.NORTH)
				.setProperty(CoreOptions.PORT_BORDER_OFFSET, 5.0)
				
			if(root.notation === 'crowsfoot'){
				configurator.configureByType('graph')
					.setProperty(LayeredOptions.SPACING_NODE_NODE_BETWEEN_LAYERS, 120.0)
				}
			layout(root, configurator, cause)
		}
	}
}