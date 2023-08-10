package org.big.erd.generator.nosql

import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.DataType
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.CardinalityType
import org.big.erd.entityRelationship.Relationship
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.generator.IFileSystemAccess2
import org.eclipse.xtext.generator.IGeneratorContext
import org.big.erd.generator.IErGenerator
//import static extension org.eclipse.xtext.xbase.lib.IterableExtensions.*

class Neo4jGenerator implements IErGenerator {

	override void generate(Resource resource, IFileSystemAccess2 fsa, IGeneratorContext context) {
		val model = resource.contents.get(0) as Model
		validate(resource, model)
		val fileName = (model.name ?: 'output') + ".cypher"
		fsa.generateFile(fileName, generate(model))
	}
	
	def String generate(Model model) {

		return '''
			// entities
			«FOR entity : model.entities»
				«entity.toTable»
			«ENDFOR»
			// relationships
			«FOR relationship : model.relationships»
				«relationship.toTable»
			«ENDFOR»
			// extends relationships (IS_A)
			«FOR entity : model.entities»
				«entity.toTableExtends»
			«ENDFOR»
			// constraints
			«FOR entity : model.entities»
				«entity.uniqueKeyConstraint»
			«ENDFOR»

		'''
	}
	
	private def toTable(Entity entity) {
		return ''' 
				CREATE («entity.name»:«entity.name» {name: "«entity.name»"«FOR attribute : entity.getAllAttrWithExtendsWithNamePrefix », «attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR»})«'\n'»
			'''
	}

	private def Iterable<Attribute> getAllAttrWithExtendsWithNamePrefix(Entity entity) {
		val attributes = newHashSet
		for (attr : entity.attributes) {
			if (!attr.name.startsWith(entity.name)) {
				attr.name = entity.name + '_' + attr.name
			}
			attributes += attr
		}
		if (entity.extends !== null) {
			attributes.addAll(getAllAttrWithExtendsWithNamePrefix(entity.extends))
		}
		return attributes
	}

	private def Iterable<Attribute> getAllAttrWithExtends(Entity entity) {
		val attributes = newHashSet
		attributes += entity.attributes
		if (entity.extends !== null) {
			attributes.addAll(getAllAttrWithExtendsWithNamePrefix(entity.extends))
		}
		return attributes
	}

	private def uniqueKeyConstraint(Entity entity) {
		val keys = entity.primaryKeys
		if (keys.length > 1)
			return ''' 
				CREATE CONSTRAINT IF NOT EXISTS FOR (x:«entity.name») REQUIRE (x.«keys.map[key | key.name].join(', ')») IS UNIQUE;«'\n'»
			'''
		else
			return ''' 
				CREATE CONSTRAINT IF NOT EXISTS FOR (x:«entity.name») REQUIRE x.«entity.primaryKey.name» IS UNIQUE;«'\n'»
			'''
	}

	private def toTableExtends(Entity entity){
		return '''
			«IF entity?.extends !== null»CREATE («entity?.name»)-[«entity?.name»_IS_A:«entity?.name»_IS_A]->(«entity.extends?.name»)«'\n'»«ENDIF»
		'''
	}
	
	private def toTable(Relationship relationship) {
		var first = relationship.first;
		var second = relationship.second;
		var third = relationship.third;
		if (first.cardinality == CardinalityType.MANY) {
			first = second
			second = relationship.first
		}

		return ''' 
			«IF third?.target === null»CREATE («first.target.name»)-[«relationship.name»:«relationship.name»{name: "«relationship.name»"«FOR attribute : relationship.attributes», «relationship.name»_«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«second.target.name»)«'\n'»«ENDIF»
			«IF third?.target !== null»CREATE («relationship.name»:«relationship.name»{name: "«relationship.name»"«FOR attribute : relationship.attributes», «relationship.name»_«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR»})«'\n'»«ENDIF»
			«IF third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«first.target.name»:«relationship.name»_«first.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«first.target.name»)«'\n'»«ENDIF»
			«IF third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«second.target.name»:«relationship.name»_«second.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«second.target.name»)«'\n'»«ENDIF»
			«IF third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«third.target.name»:«relationship.name»_«third.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«third.target.name»)«'\n'»«ENDIF»
		'''
	}

	private def primaryKey(Entity entity) {
		val keyAttributes = entity.attributes?.filter[it.type === AttributeType.KEY]
		// TODO: Fix this
		if (keyAttributes.nullOrEmpty) {
			return entity.attributes.get(0)
		}
			
		return keyAttributes.get(0)
	}

	private def Iterable<Attribute> primaryKeys(Entity entity) {
		val keyAttributes = entity.attributes?.filter[it.type === AttributeType.KEY]
		if (keyAttributes.nullOrEmpty) {
			return entity.attributes
		}
			
		return keyAttributes
	}

	private def getAllKeysName(Relationship relationship) {
		return '''«IF relationship.first?.target !== null»"«relationship.first?.target.primaryKey.name»"«ENDIF»«IF relationship.second?.target !== null», "«relationship.second?.target.primaryKey.name»"«ENDIF»«IF relationship.third?.target !== null», "«relationship.third?.target.primaryKey.name»"«ENDIF»'''
	}

	private def getAllAttributes(Entity entity) {
		val attributes = newHashSet
		attributes += entity.attributes
		return attributes
	}
	
	private def transformDataType(DataType dataType) {
		// default
		if(dataType === null) {
			return 'CHAR(20)'
		}
			
		val type = dataType.type
		var size = dataType.size
		
		if (size != 0) {
			return type +  '(' + size + ')';
		}
		
		return type
	}

	
	private def validate(Resource resource, Model model) {
		// additional validation check, since generalization is not supported
		/*
		if (!model.entities?.filter[it.extends !== null].isNullOrEmpty) {
			throw new IllegalArgumentException("SQL Generator does not support generalization, remove the 'extends' keyword")
		}
		*/
	}
}