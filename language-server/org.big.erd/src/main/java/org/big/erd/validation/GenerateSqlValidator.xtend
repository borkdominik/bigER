package org.big.erd.validation

import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.EntityRelationshipPackage
import org.eclipse.xtext.validation.Check
import org.big.erd.entityRelationship.NotationType
import org.big.erd.entityRelationship.GenerateOptionType
import org.eclipse.xtext.validation.EValidatorRegistrar
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.AttributeType

class GenerateSqlValidator extends AbstractEntityRelationshipValidator {
	
	public static String UNSUPPORTED_GENERATOR_FOR_NOTATION = "unsupportedGeneratedForNotation";
	public static String MISSING_ATTRIBUTE_DATATYPE = "missingAttributeDatatype";
	
	@Check
	def checkModel(Model model) {
		// sql generate option enabled only for default notation
		if (sqlEnabled(model)) {
			if (model.notation !== null && model.notation.notationType !== NotationType.DEFAULT) {
				error('''SQL code generation is not supported for this notation''', model,  EntityRelationshipPackage.Literals.MODEL__GENERATE_OPTION, UNSUPPORTED_GENERATOR_FOR_NOTATION)
			}
			// get all entities that extend another entity
        	model.entities.filter[it.extends !== null].forEach[ e | 
        		error('''Code Generator does not support Generalization. Remove `extends` from entity '«e.name»'.''', e, EntityRelationshipPackage.Literals.ENTITY__NAME)
        	]
        	// check non-weak entities for primary key
			model.entities?.filter[!it.weak].forEach [ e |
				if (e.attributes?.filter[it.type === AttributeType.KEY].isNullOrEmpty) {
					error('''Missing primary key for entity''', e, EntityRelationshipPackage.Literals.ENTITY__NAME);
				}
			]
			// check weak entities for partial-key
			model.entities?.filter[it.weak].forEach [ e |
				if (e.attributes?.filter[it.type == AttributeType.PARTIAL_KEY].isNullOrEmpty) {
					error('''Missing partial-key for entity''', e, EntityRelationshipPackage.Literals.ENTITY__NAME);
				}
			]
		}
	}
	
	@Check
	def checkAttribute(Attribute attribute) {
		val model = attribute.eContainer.eContainer as Model
		if (model.generateOption !== null && model.generateOption.generateOptionType === GenerateOptionType.SQL) {
			if (attribute.datatype === null || attribute.datatype.toString.nullOrEmpty) {
				error('''Missing datatype for attribute''', EntityRelationshipPackage.Literals.ATTRIBUTE__DATATYPE, MISSING_ATTRIBUTE_DATATYPE)
			}
		}
	}
	
	def sqlEnabled(Model model) {
		if (model.generateOption !== null && model.generateOption.generateOptionType === GenerateOptionType.SQL) {
			return true
		}
		return false 
	}
	
	override register(EValidatorRegistrar registrar) {
		// composite validator, no need for registration
	}
}