package org.big.erd.ide.symbol

import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper.DocumentSymbolKindProvider
import org.eclipse.emf.ecore.EClass
import static org.eclipse.lsp4j.SymbolKind.*
import static org.big.erd.entityRelationship.EntityRelationshipPackage.Literals.*


class ErDocumentSymbolKindProvider extends DocumentSymbolKindProvider {
	
	override protected getSymbolKind(EClass clazz) {
		return switch (clazz) {
			case MODEL: Class
			case ENTITY: Method
			case RELATIONSHIP: Interface
			case ATTRIBUTE: Number
			default: Property
		}
	}
}