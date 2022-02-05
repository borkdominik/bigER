package org.big.erd.ide.diagram

import org.eclipse.sprotty.SNode
import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors

@Accessors
class EntityNode extends SNode {
	boolean expanded

    new() {
		type = 'node'
	}
	new(Consumer<EntityNode> initializer) {
		this()
		initializer.accept(this)
	}
}