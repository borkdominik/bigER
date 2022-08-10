/*
 * generated by Xtext 2.24.0
 */
package org.big.erd.validation

import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.EntityRelationshipPackage
import org.eclipse.xtext.validation.Check
import org.big.erd.entityRelationship.CardinalityType
import org.big.erd.entityRelationship.RelationEntity
import org.big.erd.entityRelationship.Relationship
import org.eclipse.emf.ecore.EStructuralFeature
import org.big.erd.entityRelationship.NotationType
import org.big.erd.entityRelationship.GenerateOptionType
import org.eclipse.xtext.validation.ComposedChecks

/**
 * Custom ValidationRules with composed checks 
 *
 * See https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#validation for documentation
 */
@ComposedChecks(validators=#[
	NamingValidator,
	GenerateSqlValidator
])
class EntityRelationshipValidator extends AbstractEntityRelationshipValidator {

	@Check
	def checkRelationEntity(RelationEntity relation) {
		// check min-max
		if (relation.minMax !== null) {
			val model = relation.eContainer.eContainer as Model
			if (model.generateOption !== null && model.generateOption.generateOptionType === GenerateOptionType.SQL) {
				error('''SQL code generation is not supported for min-max relationships!''', relation, EntityRelationshipPackage.Literals.RELATION_ENTITY__MIN_MAX);
			}
			
			val values = relation.minMax.split(",");
			if (values.length != 2) {
				error('''Incorrect usage of min-max!«'\n'»Usage: [min, max] or [min, *]''', relation, EntityRelationshipPackage.Literals.RELATION_ENTITY__MIN_MAX);
			} else {
				if (values.get(0).matches("\\d+") && values.get(1).matches("\\d+") 
					&& (Integer.parseInt(values.get(0)) > Integer.parseInt(values.get(1)))
				) {
					info('''«values.get(0)» (min) is greater than «values.get(1)» (max)!«'\n'»Usage: [min, max] with min ≤ max''', relation, EntityRelationshipPackage.Literals.RELATION_ENTITY__MIN_MAX)
				}
			}
		}
		
		val model = relation.eContainer.eContainer
		if (model instanceof Model) {
			if (model.notation.notationType.equals(NotationType.BACHMAN)) {
				checkBachman(relation)
			} else if (model.notation.notationType.equals(NotationType.CHEN)) {
				checkChen(relation)
			} else if (model.notation.notationType.equals(NotationType.CROWSFOOT)) {
				checkCrowsfoot(relation)
			}
		}
	}
	
    def checkBachman(RelationEntity relation) {
    	switch relation.cardinality {
    		case CardinalityType.ZERO,
    		case CardinalityType.ZERO_OR_MORE,
    		case CardinalityType.ONE,
    		case CardinalityType.ONE_OR_MORE: return
    		default: info('''Invalid cardinality for '«relation.target.name»'!«'\n'»Use: [0], [0+], [1] or [1+]''', relation.eContainer, featureOf(relation))
    	}
    }
    
    def checkChen(RelationEntity relation) {
    	switch relation.cardinality {
    		case CardinalityType.ONE,
    		case CardinalityType.MANY,
    		case CardinalityType.MANY_CHEN: return
    		default: info('''Invalid cardinality for entity '«relation.target.name»'! «'\n'»Use: [1],[N] or [M]''', relation.eContainer, featureOf(relation))
    	}
    }
    
    def checkCrowsfoot(RelationEntity relation) {
    	switch relation.cardinality {
    		case CardinalityType.ONE,
    		case CardinalityType.ZERO_OR_MORE,
    		case CardinalityType.ONE_OR_MORE,
    		case CardinalityType.ZERO_OR_ONE: return
    		default: info('''Invalid cardinality for entity '«relation.target.name»'! «'\n'»Use: [1],[0+],[1+] or [?]''', relation.eContainer, featureOf(relation))
    	}
    }
  	
  	def featureOf(RelationEntity relation) {
  		val r = relation.eContainer as Relationship
  		if (r.first === relation) {
  			return EntityRelationshipPackage.Literals.RELATIONSHIP__FIRST
  		} else if (r.second === relation) {
  			return EntityRelationshipPackage.Literals.RELATIONSHIP__SECOND
  		} else {
  			return EntityRelationshipPackage.Literals.RELATIONSHIP__THIRD
  		}
  	}
  	
  	@Check
	def checkCardinality(Model model) {
		model.relationships.forEach [ r |
			val firstElement = r.first
			val secondElement = r.second
			val thirdElement = r.third
			
			if (model.notation.notationType.equals(NotationType.CROWSFOOT)) {
				if (r.second === null) {
					error('''Target relationship required!!''', r, EntityRelationshipPackage.Literals.RELATIONSHIP__SECOND)
				}
				if (r.third !== null){
					error('''Ternary relationships are not allowed in `crowsfoot` notation!''', r, EntityRelationshipPackage.Literals.RELATIONSHIP__THIRD)
				}
			} else if (model.notation.notationType.equals(NotationType.UML)) {
				checkUmlCardinality(firstElement, r, EntityRelationshipPackage.Literals.RELATIONSHIP__FIRST)
				checkUmlCardinality(secondElement, r, EntityRelationshipPackage.Literals.RELATIONSHIP__SECOND)
				checkUmlCardinality(thirdElement, r, EntityRelationshipPackage.Literals.RELATIONSHIP__THIRD)
				checkNoMultipleAggregation(r)
			}
		]
    }
    
	def checkUmlCardinality(RelationEntity relationEntity, Relationship relationship, EStructuralFeature feature) {
		if (relationEntity !== null) {
			if(relationEntity.customMultiplicity !== null || relationEntity.minMax !== null ||
			  (relationEntity.uml === null && relationEntity.cardinality !== CardinalityType.ZERO && 
			  relationEntity.cardinality !== CardinalityType.ONE)){
				info('''Wrong cardinality.Usage: [num],[min..max] or [min..*]''', relationship, feature)
			}
			if(relationEntity.uml.contains("comp") && relationEntity.uml.contains("agg")){
				info('''Invalid aggregation. Use comp or agg''', relationship, feature)
			}
			if (relationEntity.uml.contains("..")) {
				var cardinality = relationEntity.uml
				
				if(relationEntity.uml.contains(" ")){
					// remove type (agg|comp)
					cardinality = relationEntity.uml.split(" ").get(1)
				}
				var numbers = cardinality.split("\\.\\.")
				if(numbers.length <= 1){
					info('''Wrong cardinality. Usage: [min..max] min <= max''', relationship, feature)
				}
				if(numbers.length === 2){
					if(numbers.get(0).isEmpty || numbers.get(1).isEmpty){
						info('''Wrong cardinality. Usage: [min..max] min <= max''', relationship, feature)
					}
					var n1 = numbers.get(0)
					var n2 = numbers.get(1)
					if (n1.matches("\\d+") && n2.matches("\\d+") && Integer.parseInt(n1) > Integer.parseInt(n2)) {
						info('''Wrong cardinality. Usage: [min..max] min <= max''', relationship, feature)
					}
				}
			}
		}
	}
	
	def checkNoMultipleAggregation(Relationship relationship){
		val firstElement = relationship.first
		val secondElement = relationship.second
		val thirdElement = relationship.third
		var aggregationCounter = 0;
		
		if (firstElement !== null) {
			if (firstElement.uml.contains("agg") || firstElement.uml.contains("comp")) {
				aggregationCounter++;
			}
		}
		if (secondElement !== null ) {
			if(secondElement.uml.contains("agg") || secondElement.uml.contains("comp")) {
				aggregationCounter++;
				if(aggregationCounter > 1){
					info('''No multiple aggregation possible.''', relationship, EntityRelationshipPackage.Literals.RELATIONSHIP__SECOND)
				}
			}
		}
		if (thirdElement !== null) {
			if (thirdElement.uml.contains("agg") || thirdElement.uml.contains("comp")) {
				aggregationCounter++;
				if (aggregationCounter > 1) {
					info('''No multiple aggregation possible.''', relationship, EntityRelationshipPackage.Literals.RELATIONSHIP__THIRD)
				}
			}
		}
	}
	
}
