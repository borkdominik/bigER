package org.big.erd.validation

import org.eclipse.xtext.validation.Check
import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.EntityRelationshipPackage
import com.google.common.collect.Multimaps
import org.big.erd.entityRelationship.Entity
import org.eclipse.xtext.validation.EValidatorRegistrar

class NamingValidator extends AbstractEntityRelationshipValidator {
	
	public static String MISSING_MODEL_HEADER = "missingModelHeader";
	public static String LOWERCASE_ENTITY_NAME = "lowercaseEntityName";
	
	@Check
	def checkModel(Model model) {
        // required model name
		if (model.name === null || model.name.isBlank) {
			error('''Missing model header 'erdiagram <name>' ''' , model, EntityRelationshipPackage.Literals.MODEL__NAME,  MISSING_MODEL_HEADER)
		}
        
        // Entities
        val entityNames = Multimaps.index(model.entities, [name ?: ''])
        entityNames.keySet.forEach [ name |
        	val commonName = entityNames.get(name)
			if (commonName.size > 1) 
				commonName.forEach [
					error('''Multiple entites named '«name»'«».''', it, EntityRelationshipPackage.Literals.ENTITY__NAME)
			]
		]
		// Relationships
		val relNames = Multimaps.index(model.relationships, [name ?: ''])
        relNames.keySet.forEach [ name |
			val commonName = relNames.get(name)
			if (commonName.size > 1) 
				commonName.forEach [
					error('''Multiple relationships named '«name»'«».''', it, EntityRelationshipPackage.Literals.RELATIONSHIP__NAME)
			]
		]
    }
	
	
	@Check
	def checkUppercaseName(Entity entity) {
		if (!Character.isUpperCase(entity.name.charAt(0))) {
			info('''Entity name '«entity.name»' should start with an upper-case letter''', EntityRelationshipPackage.Literals.ENTITY__NAME, LOWERCASE_ENTITY_NAME)
		}
	}
	
	
	override register(EValidatorRegistrar registrar) {
		// composite validator, no need for registration
	}
}