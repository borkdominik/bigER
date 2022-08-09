package org.big.erd.ide.hover

import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.ide.labels.INameLabelProvider
import org.eclipse.xtext.ide.server.hover.HoverService
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.NotationType
import org.big.erd.entityRelationship.GenerateOptionType

/**
 * Provides hover information when hovering over model elements in the textual editor.
 */
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
      	Model: hoverInformation(element)
      	Entity : '''
      		*«IF element.weak»Weak «ENDIF»Entity* **«element.name»**
      		
      		---
      		
      		«keyText(element)»
      	'''
        default : '''«getFirstLine(element)»'''
      }
    }
    
    def hoverInformation(Model model) {
    	'''
    	**ER Model** «model.name»
    	
    	---
    	
    	«optionsInfo(model)»
    	
    	---
    	
    	«elementCountInfo(model)»
    	'''
    }
    
    def optionsInfo(Model model) {
    	'''
    	Notation: `«model.notation !== null ? model.notation.notationType.toString : NotationType.DEFAULT.toString»`
    	
    	Generator: `«model.generateOption !== null ? model.generateOption.generateOptionType.toString : GenerateOptionType.OFF.toString»`
    	'''
    }
    
    def elementCountInfo(Model model) {
    	'''
    	«IF model.entities.length === 1»«model.entities.length» Entity, «ENDIF»
    	«IF model.entities.length !== 1»«model.entities.length» Entities, «ENDIF»
    	«IF model.relationships.length === 1»«model.relationships.length» Relationship«ENDIF»
    	«IF model.relationships.length !== 1»«model.relationships.length» Relationships«ENDIF»
    	'''
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
