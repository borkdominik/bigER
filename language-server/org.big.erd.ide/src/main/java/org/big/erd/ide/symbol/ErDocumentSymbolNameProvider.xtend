package org.big.erd.ide.symbol

import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper.DocumentSymbolNameProvider
import org.eclipse.emf.ecore.EObject
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.Relationship
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.GenerateOption
import org.big.erd.entityRelationship.NotationOption


class ErDocumentSymbolNameProvider extends DocumentSymbolNameProvider {
	
	override getName(EObject object) {
		switch object {
			Model: return object.name
			NotationOption: return 'Notation: ' + object.notationType.toString
			GenerateOption: return 'Generator: ' + object.generateOptionType.toString
			Entity: return object.name
			Relationship: return object.name
			Attribute: return object.name
			default: return super.getName(object)
		}
	}
	
}