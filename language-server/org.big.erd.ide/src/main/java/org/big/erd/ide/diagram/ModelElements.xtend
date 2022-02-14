package org.big.erd.ide.diagram

import org.eclipse.sprotty.SNode
import org.eclipse.xtend.lib.annotations.Accessors

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