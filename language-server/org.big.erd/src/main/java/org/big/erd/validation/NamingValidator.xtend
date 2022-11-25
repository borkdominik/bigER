package org.big.erd.validation

import org.eclipse.xtext.validation.Check
import org.big.erd.entityRelationship.Model
import com.google.common.collect.Multimaps
import org.big.erd.entityRelationship.Entity
import org.eclipse.xtext.validation.EValidatorRegistrar
import static org.big.erd.entityRelationship.EntityRelationshipPackage.Literals.*


class NamingValidator extends AbstractEntityRelationshipValidator {
	
	public static final String MISSING_MODEL_NAME = "missingModelHeader";
	public static final String DUPLICATE_ENTITY_NAME = "duplicateEntityName";
	public static final String DUPLICATE_RELATIONSHIP_NAME = "duplicateRelationshipName";
	public static final String DUPLICATE_ATTRIBUTE_NAME = "duplicateAttributeName";
	public static final String LOWERCASE_ENTITY_NAME = "lowercaseEntityName";
	
	@Check
	def checkModel(Model model) {
        // check model name exists
		if (model.name === null || model.name.isBlank) {
			error('''Missing model header 'erdiagram <name>' ''' , model, MODEL__NAME,  MISSING_MODEL_NAME)
		}
        
        // check duplicate entities
        val entityNames = Multimaps.index(model.entities, [name ?: ''])
        entityNames.keySet.forEach[ name |
        	val commonName = entityNames.get(name)
			if (commonName.size > 1) 
				commonName.forEach[
					error('''Multiple entites named '«name»'«».''', it, ENTITY__NAME, DUPLICATE_ENTITY_NAME)
			]
		]
		// check duplicate relationships
		val relNames = Multimaps.index(model.relationships, [name ?: ''])
        relNames.keySet.forEach[ name |
			val commonName = relNames.get(name)
			if (commonName.size > 1) 
				commonName.forEach[
					error('''Multiple relationships named '«name»'«».''', it, RELATIONSHIP__NAME, DUPLICATE_RELATIONSHIP_NAME)
			]
		]
    }
    
    @Check
	def checkAttributeNames(Entity entity) {
		// check duplicate attributes within entity
		val attributeNames = Multimaps.index(entity.attributes, [name ?: ''])
		attributeNames.keySet.forEach[ name | 
			val commonName = attributeNames.get(name)
			if (commonName.size > 1) {
				commonName.forEach[
					error('''Multiple attributes named '«name»'«».''', it, ATTRIBUTE__NAME, DUPLICATE_ATTRIBUTE_NAME)
				]
			}
		]
	}
	
	
	@Check
	def checkUppercaseName(Entity entity) {
		// check entity names start with upper-case
		if (!Character.isUpperCase(entity.name.charAt(0))) {
			info('''Entity name '«entity.name»' should start with an upper-case letter''', ENTITY__NAME, LOWERCASE_ENTITY_NAME)
		}
	}
	
	
	override register(EValidatorRegistrar registrar) {
		// composite validator, no need for registration
	}
}