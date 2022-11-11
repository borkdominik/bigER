package org.big.erd.generator

import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.generator.IFileSystemAccess2
import org.eclipse.xtext.generator.IGeneratorContext
import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.DataType
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.Relationship
import org.eclipse.xtext.util.RuntimeIOException
import org.eclipse.xtext.generator.IGenerator2

class SqlGenerator implements IGenerator2 {
	
	
	override void doGenerate(Resource resource, IFileSystemAccess2 fsa, IGeneratorContext context) {
		
		val diagram = resource.contents.get(0) as Model
		
		// TODO Validate
		
		val name = (diagram.name ?: 'output') + '.sql'
		try {
			fsa.generateFile(name, '''
				«FOR entity : diagram.entities.reject[it.isWeak]»
					«entity.toTable»
				«ENDFOR»
				«FOR relationship : diagram.relationships.reject[!it.isWeak]»
					«relationship.weakToTable»
				«ENDFOR»
				«FOR relationship : diagram.relationships.reject[it.isWeak]»
					«relationship.toTable»
				«ENDFOR»
			'''
			)
		} catch (RuntimeIOException e) {
			throw new Error("Could not generate file. Did you open a folder?")
		}
	}
	
	private def toTable(Entity entity) {
		return ''' 
			CREATE TABLE «entity.name»(
			«FOR attribute : entity.attributes.reject[it.type === AttributeType.DERIVED]»
				«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
			«ENDFOR»
			«'\t'»PRIMARY KEY («entity.primaryKey.name»)
			);«'\n'»
		'''
	}
	
	private def toTable(Relationship relationship) {
		val keySource = relationship.first.target?.primaryKey
		val keyTarget = relationship.second.target?.primaryKey
		return ''' 
			CREATE TABLE «relationship.name»(
			«relationship.first.target.foreignKeyRef»
			«relationship.second.target.foreignKeyRef»
			«IF relationship.third?.target !== null»«relationship.third.target.foreignKeyRef»«ENDIF»
			«FOR attribute : relationship.attributes»
				«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
			«ENDFOR»
			«'\t'»PRIMARY KEY («keySource.name», «keyTarget.name»«IF relationship.third?.target !== null», «relationship.third.target.primaryKey.name»«ENDIF»)
			);«'\n'»
		'''
	}
	
	private def weakToTable(Relationship relationship) {
		val strong = getStrongEntity(relationship)
		val weak = getWeakEntity(relationship)
		return ''' 
			CREATE TABLE «weak.name»(
			«FOR attribute : weak.attributes.reject[it.type === AttributeType.DERIVED]»
				«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
			«ENDFOR»
			«FOR attribute : relationship.attributes»
				«'\t'»«attribute.name» «attribute.datatype.transformDataType»,
			«ENDFOR»
			«'\t'»«strong.primaryKey.name» «strong.primaryKey.datatype.transformDataType»,
			«'\t'»PRIMARY KEY («weak.partialKey.name», «strong.primaryKey.name»),
			«'\t'»FOREIGN KEY («strong.primaryKey.name») references «strong.name» ON DELETE CASCASE
			);«'\n'»
		'''
	}
	
	private def foreignKeyRef(Entity entity) {
		val key = entity.attributes.filter[a | a.type === AttributeType.KEY]
		if (key.nullOrEmpty) {
			val attr = entity.attributes.get(0)
			return '''«'\t'»«attr.name» «attr.datatype.transformDataType» references «entity.name»(«attr.name»),'''
		}
		return '''
			«'\t'»«key.get(0).name» «key.get(0).datatype.transformDataType» references «entity.name»(«key.get(0).name»),
		'''
	}

	private def primaryKey(Entity entity) {
		val keyAttributes = entity.attributes?.filter[it.type === AttributeType.KEY]
		if (keyAttributes.nullOrEmpty) {
			return entity.attributes.get(0)
		}
			
		return keyAttributes.get(0)
	}
	
	private def partialKey(Entity entity) {
		val keyAttributes = entity.attributes?.filter[a | a.type === AttributeType.PARTIAL_KEY]
		if (keyAttributes.nullOrEmpty)
			return entity.attributes.get(0)
		return keyAttributes.get(0)
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
	
	override afterGenerate(Resource input, IFileSystemAccess2 fsa, IGeneratorContext context) {
		
	}
	
	override beforeGenerate(Resource input, IFileSystemAccess2 fsa, IGeneratorContext context) {
		
	}
	
}