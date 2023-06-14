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

class MongoDbGenerator implements IErGenerator {
	
	override void generate(Resource resource, IFileSystemAccess2 fsa, IGeneratorContext context) {
		val model = resource.contents.get(0) as Model
		validate(resource, model)
		val fileName = (model.name ?: 'output') + ".js"
		fsa.generateFile(fileName, generate(model))
	}
	
	def String generate(Model model) {
		// db = connect("localhost:27020/«model.name»");
		'''
			use(«model.name»);
			«FOR entity : model.entities»
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
				db.createCollection("«entity.name»", {
					validator: {
						$jsonSchema: {
							bsonType: "object",
							title: "«entity.name» Object Validation",
							required: ["«entity.primaryKey.name»"],
							properties: {
								«FOR attribute : entity.getAllAttrWithExtends.reject[it.type === AttributeType.DERIVED] SEPARATOR ','»
								«attribute.name»: {
									bsonType: "«attribute.datatype.transformDataType»"
								}
								«ENDFOR»
							}
						}
					}
				});
				«'\n'»«'\n'»
			'''
	}
	
	private def toTable(Relationship relationship) {
		//val keySource = relationship.first.target?.primaryKey
		//val keyTarget = relationship.second.target?.primaryKey
		return ''' 
				db.createCollection("«relationship.name»", {
					validator: {
						$jsonSchema: {
							bsonType: "object",
							title: "«relationship.name» (relationship) Object Validation",
							required: [«relationship.getAllKeysName»],
							properties: {
								«FOR attribute : relationship.getAllKeysNameArray»
								«attribute.name»: {
									bsonType: "«attribute.datatype.transformDataType»",
								},
								«ENDFOR»
								«FOR attribute : relationship.attributes»
								«attribute.name»: {
									bsonType: "«attribute.datatype.transformDataType»",
								},
								«ENDFOR»
							}
						}
					}
				});
				«'\n'»«'\n'»
			'''
	}
	
	private def weakToTable(Relationship relationship) {
		//val strong = getStrongEntity(relationship)
		//val weak = getWeakEntity(relationship)
		return ''' 
				db.createCollection("«relationship.name»", {
					validator: {
						$jsonSchema: {
							bsonType: "object",
							title: "«relationship.name» (relationship) Object Validation",
							required: ["«relationship.first.target.primaryKey.name»", "«relationship.second.target.primaryKey.name»"],
							properties: {
								«FOR attribute : relationship.getAllKeysNameArray»
								«attribute.name»: {
									bsonType: "«attribute.datatype.transformDataType»",
								},
								«ENDFOR»
								«FOR attribute : relationship.attributes»
								«attribute.name»: {
									bsonType: "«attribute.datatype.transformDataType»",
								},
								«ENDFOR»
							}
						}
					}
				});
				«'\n'»«'\n'»
			'''
	}
	
	private def Iterable<Attribute> getAllAttrWithExtendsWithNamePrefix(Entity entity) {
		val attributes = newHashSet
		//attributes += entity.attributes
		for (attr : entity.attributes) {
			if (!attr.name.startsWith(entity.name)) {
				attr.name = entity.name + '_' + attr.name
			}
			//val newattr = new Attribute()
			//newattr.name = entity.name + '_' + attr.name
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

	private def getAllKeysNameArray(Relationship relationship) {
		val keys = newHashSet
		if (relationship.first?.target !== null) { keys += relationship.first?.target?.primaryKey }
		if (relationship.second?.target !== null) { keys += relationship.second?.target?.primaryKey }
		if (relationship.third?.target !== null) { keys += relationship.third?.target?.primaryKey }
		return keys
	}

	
	private def transformDataType(DataType dataType) {
		// default
		if(dataType === null) {
			return 'string'
		}
			
		val type = dataType.type.toLowerCase()

		if(type.contains('char') || type.contains('string')) {
			return 'string';
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