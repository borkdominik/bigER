package org.big.erd.generator.nosql

import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.DataType
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.Relationship
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.generator.IFileSystemAccess2
import org.eclipse.xtext.generator.IGeneratorContext
import org.big.erd.generator.IErGenerator

class CassandraDbGenerator implements IErGenerator {
	
	override void generate(Resource resource, IFileSystemAccess2 fsa, IGeneratorContext context) {
		val model = resource.contents.get(0) as Model
		validate(resource, model)
		val fileName = (model.name ?: 'output') + ".cql"
		fsa.generateFile(fileName, generate(model))
	}
	
	def String generate(Model model) {
		'''
			CREATE KEYSPACE «model.name» WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 2};
			USE «model.name»;
			«FOR entity : model.entities.reject[it.extends !== null]»
				«entity.toTable»
			«ENDFOR»
			«FOR entity : model.entities.reject[it.extends === null]»
				«entity.toTable»
			«ENDFOR»
			«FOR relationship : model.relationships.reject[!it.isWeak]»
				«relationship.weakToTable»
			«ENDFOR»
			«FOR relationship : model.relationships.reject[it.isWeak]»
				«relationship.toTable»
			«ENDFOR»
		'''
	}
	
	private def toTable(Entity entity) {
		return ''' 
				CREATE TABLE «entity.name»(
				«FOR attribute : entity.getAllAttrWithExtends.reject[it.type === AttributeType.DERIVED]» 
					«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
				«ENDFOR»
				«'\t'»PRIMARY KEY («entity.getPrimaryKeysName»)
				);«'\n'»«'\n'»
			'''
	}
	
	private def toTable(Relationship relationship) {
		val keySource = relationship.first.target?.getPrimaryKeysName
		val keyTarget = relationship.second.target?.getPrimaryKeysName
		return ''' 
				CREATE TABLE «relationship.name»(
				«relationship.first.target.foreignKeyRef»,
				«relationship.second.target.foreignKeyRef»,
				«IF relationship.third?.target !== null»«relationship.third.target.foreignKeyRef»,«ENDIF»
				«FOR attribute : relationship.attributes»
					«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
				«ENDFOR»
				«'\t'»PRIMARY KEY («keySource», «keyTarget»«IF relationship.third?.target !== null», «relationship.third.target.getPrimaryKeysName»«ENDIF»)
				) WITH comment='relationship';«'\n'»«'\n'»
			'''
	}
	
	private def weakToTable(Relationship relationship) {
		val strong = getStrongEntity(relationship)
		val weak = getWeakEntity(relationship)
		return ''' 
				CREATE TABLE «relationship.name»(
				«FOR attribute : weak.allAttributes.reject[it.type === AttributeType.DERIVED]»
					«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
				«ENDFOR»
				«FOR attribute : relationship.attributes»
					«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
				«ENDFOR»
				«FOR key : strong.primaryKeys»
					«'\t'»«key.name» «key.datatype.transformDataType»,
				«ENDFOR»
				«'\t'»PRIMARY KEY («weak.getPartialKeysName», «strong.getPrimaryKeysName»)
				) WITH comment='relationship';«'\n'»«'\n'»
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
	private def foreignKeyRef(Entity entity) {
		val keys = entity.attributes.filter[a | a.type === AttributeType.KEY]
		if (keys.nullOrEmpty) {
			//val attr = entity.attributes.get(0)
			//return '''«'\t'»«attr.name» «attr.datatype.transformDataType» references «entity.name»(«attr.name»),'''
			//return '''«'\t'»«attr.name» «attr.datatype.transformDataType»'''
			val attrStrings = entity.attributes.map[ attr |
				'''«'\t'»«attr.name» «attr.datatype.transformDataType»'''
			]
			return attrStrings.join(',\n')

		}
		//return '''«'\t'»«key.get(0).name» «key.get(0).datatype.transformDataType» references «entity.name»(«key.get(0).name»),'''
		val attrStrings = keys.map[ key |
				'''«'\t'»«key.name» «key.datatype.transformDataType»'''
			]
		return attrStrings.join(',\n')
		//return '''«'\t'»«key.get(0).name» «key.get(0).datatype.transformDataType»'''
	}

	private def Iterable<Attribute> primaryKeys(Entity entity) {
		val keyAttributes = entity.attributes?.filter[it.type === AttributeType.KEY]
		if (keyAttributes.nullOrEmpty) {
			return entity.attributes
		}
			
		return keyAttributes
	}

	private def getPrimaryKeysName(Entity entity) {
		val keyAttributes = entity.attributes?.filter[it.type === AttributeType.KEY]
		if (keyAttributes.nullOrEmpty) {
			return entity.primaryKeys.map[key | key.name].join(', ')
		}
			
		return keyAttributes.map[key | key.name].join(', ')
	}
	
	private def Iterable<Attribute> partialKeys(Entity entity) {
		val keyAttributes = entity.attributes?.filter[a | a.type === AttributeType.PARTIAL_KEY]
		if (keyAttributes.nullOrEmpty)
			return entity.attributes
		return keyAttributes
	}

	private def getPartialKeysName(Entity entity) {
		val keyAttributes = entity.attributes?.filter[it.type === AttributeType.KEY]
		if (keyAttributes.nullOrEmpty) {
			return entity.partialKeys.map[key | key.name].join(', ')
		}
			
		return keyAttributes.map[key | key.name].join(', ')
	}

	private def getStrongEntity(Relationship r) {
		if (r.first.target.isWeak) {
			return r.second.target
		} else {
			return r.first.target
		}
	}

	private def getWeakEntity(Relationship r) {
		if (r.first.target.isWeak) {
			return r.first.target
		} else {
			return r.second.target
		}
	}

	private def getAllAttributes(Entity entity) {
		val attributes = newHashSet
		attributes += entity.attributes
		return attributes
	}
	

	// CQL datatypes https://cassandra.apache.org/doc/latest/cassandra/cql/types.html
	private def transformDataType(DataType dataType) {
		// default
		if(dataType === null) {
			return 'TEXT'
		}
			
		val type = dataType.type.toUpperCase()

		if(type == 'VARCHAR' || type == 'CHAR' || type.startsWith('STRING')) {
			return 'TEXT';
		}
		

		if(type == 'SMALLINT' || type == 'BIGINT') {
			return 'VARINT';
		}

		/*
		if(type.startsWith('DATE')) {
			return 'TIMESPAN';
		}
		*/
		
		return type
	}

	
	private def validate(Resource resource, Model model) {
		// additional validation check, since generalization is not supported
		/*
		if (!model.entities?.filter[it.extends !== null].isNullOrEmpty) {
			throw new IllegalArgumentException("CassandraDb CQL Generator does not support generalization, remove the 'extends' keyword")
		}
		*/
	}
}