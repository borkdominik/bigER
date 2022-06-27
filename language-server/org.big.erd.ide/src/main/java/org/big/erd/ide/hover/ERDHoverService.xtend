package org.big.erd.ide.hover

import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.labels.INameLabelProvider
import org.eclipse.xtext.ide.server.hover.HoverService
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.AttributeType

class ERDHoverService extends HoverService {

	@Inject INameLabelProvider nameLabelProvider

	override String getContents(EObject element) {
		element.toText.toString
	}

	def String getFirstLine(EObject o) {
		val String label = nameLabelProvider.getNameLabel(o);
		'''«o.eClass().getName()»«IF label !== null» **«label»**«ENDIF»'''
	}
	
	def toText(EObject element) {
      switch element {
      	Entity : '''
      		*«IF element.weak»Weak «ENDIF»Entity* **«element.name»**
      		
      		---
      		
      		«keyText(element)»
      	'''
        default : '''«getFirstLine(element)»'''
      }
    }
    
    def keyText(Entity entity) {
    	if (entity.weak) {
    		val partialKey = entity.attributes.filter[a | 
    			a.type.equals(AttributeType.PARTIAL_KEY)
    		]
    		if (partialKey.size > 0) {
    			return '''🗝«partialKey.get(0).name»'''
    		}
    	} else {
    		val key = entity.attributes.filter[a | 
    			a.type.equals(AttributeType.KEY)
    		]
    		if (key.size > 0) {
    			return '''🔑   «key.get(0).name»'''
    		}
    	}
    	
    	return ''''''
    }
}
