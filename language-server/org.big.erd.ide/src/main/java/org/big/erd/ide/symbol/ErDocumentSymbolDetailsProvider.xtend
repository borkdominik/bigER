package org.big.erd.ide.symbol

import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper.DocumentSymbolDetailsProvider
import org.eclipse.emf.ecore.EObject
import org.big.erd.entityRelationship.Model
import org.big.erd.entityRelationship.NotationOption
import org.big.erd.entityRelationship.GenerateOption
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.AttributeType

class ErDocumentSymbolDetailsProvider extends DocumentSymbolDetailsProvider {
	
	override String getDetails(EObject object) {
		switch object {
			Model: 
				return "ER Model"
			NotationOption: 
				return "Notation"
			GenerateOption: 
				return "Generator"
			Attribute:
				if (object.type.equals(AttributeType.KEY)) {
					return "KEY"
				} else {
					return ""
				}
			default:
				return ""
		}
	}
	
}