package org.big.erd.ide.diagram

import org.eclipse.sprotty.SNode
import org.eclipse.sprotty.SGraph
import org.eclipse.xtend.lib.annotations.Accessors

@Accessors
class ERModel extends SGraph {
	String name

	new() { }
	
	new((ERModel) => void initializer) {
		initializer.apply(this)
	}
}


@Accessors
class EntityNode extends SNode {
	boolean expanded
	
	new() { }
	
	new((EntityNode) => void initializer) {
		initializer.apply(this)
	}
}