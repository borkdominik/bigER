package org.big.erd.ide.diagram

import org.eclipse.sprotty.SNode
import org.eclipse.sprotty.SEdge
import org.big.erd.entityRelationship.NotationOption
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.sprotty.SGraph

/*
 * Only entity nodes, for the rest of the elements the default SModel is used
 */
@Accessors
class EntityNode extends SNode {
	boolean expanded
	
	new() { }
	
	new((EntityNode) => void initializer) {
		initializer.apply(this)
	}
}

@Accessors
class NotationEdge extends SEdge {
	Boolean isSource
	String notation
	String crowsFootCardinality
	
	new() { }
	
	new((NotationEdge) => void initializer) {
		initializer.apply(this)
	}
}

@Accessors
class ERModel extends SGraph {
	String name
	String notationType

	new() { }
	
		
	new((ERModel) => void initializer) {
		initializer.apply(this)
	}
	
}