package org.big.erd.generator

import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.DataType
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.Relationship
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.generator.IFileSystemAccess2
import org.eclipse.xtext.generator.IGeneratorContext

class Neo4jGenerator implements IErGenerator {

	override void generate(Resource resource, IFileSystemAccess2 fsa, IGeneratorContext context) {
		val model = resource.contents.get(0) as Model
		validate(resource, model)
		val fileName = (model.name ?: 'output') + ".cypher"
		fsa.generateFile(fileName, generate(model))
	}
	
	def String generate(Model model) {
		return '''
			«FOR entity : model.entities»
				«entity.toTable»
			«ENDFOR»
			«FOR relationship : model.relationships»
				«relationship.toTable»
			«ENDFOR»
		'''
	}
	
	private def toTable(Entity entity) {
		return ''' 
			CREATE («entity.name»:«entity.name» {name: "«entity.name»"«FOR attribute : entity.allAttributes.reject[it.type === AttributeType.DERIVED] », «entity.name»_«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR»})«'\n'»
		'''
	}
	
	private def toTable(Relationship relationship) {
		return ''' 
			«IF relationship.third?.target === null»CREATE («relationship.first.target.name»)-[«relationship.name»:«relationship.name»{name: "«relationship.name»"«FOR attribute : relationship.attributes», «relationship.name»_«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.second.target.name»)«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»:«relationship.name»{name: "«relationship.name»"«FOR attribute : relationship.attributes», «relationship.name»_«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR»})«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«relationship.first.target.name»:«relationship.name»_«relationship.first.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.first.target.name»)«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«relationship.second.target.name»:«relationship.name»_«relationship.second.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.second.target.name»)«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«relationship.third.target.name»:«relationship.name»_«relationship.third.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.third.target.name»)«'\n'»«ENDIF»
		'''
	}
	
	private def weakToTable(Relationship relationship) {
		return ''' 
			«IF relationship.third?.target === null»CREATE («relationship.first.target.name»)-[«relationship.name»:«relationship.name»{name: "«relationship.name»"«FOR attribute : relationship.attributes», «relationship.name»_«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.second.target.name»)«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»:«relationship.name» {name: "«relationship.name»"«FOR attribute : relationship.attributes», «relationship.name»_«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR»})«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«relationship.first.target.name»:«relationship.name»_«relationship.first.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.first.target.name»)«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«relationship.second.target.name»:«relationship.name»_«relationship.second.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.second.target.name»)«'\n'»«ENDIF»
			«IF relationship.third?.target !== null»CREATE («relationship.name»)-[«relationship.name»_«relationship.third.target.name»:«relationship.name»_«relationship.third.target.name» {«FOR attribute : relationship.attributes SEPARATOR ','»«attribute.name»: "«attribute.datatype.transformDataType»"«ENDFOR» }]->(«relationship.third.target.name»)«'\n'»«ENDIF»
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