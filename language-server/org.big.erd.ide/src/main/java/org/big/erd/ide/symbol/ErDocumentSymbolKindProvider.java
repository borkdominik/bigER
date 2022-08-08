package org.big.erd.ide.symbol;

import org.eclipse.emf.ecore.EClass;
import org.eclipse.lsp4j.SymbolKind;
import org.big.erd.entityRelationship.EntityRelationshipPackage;
import org.eclipse.xtext.ide.server.symbol.DocumentSymbolMapper.DocumentSymbolKindProvider;


public class ErDocumentSymbolKindProvider extends DocumentSymbolKindProvider {
	
	@Override
	protected SymbolKind getSymbolKind(EClass clazz) {
		if (clazz.getEPackage() == EntityRelationshipPackage.eINSTANCE) {
			switch (clazz.getClassifierID()) {
				case EntityRelationshipPackage.MODEL: return SymbolKind.Class;
				case EntityRelationshipPackage.ENTITY: return SymbolKind.Method;
				case EntityRelationshipPackage.RELATIONSHIP: return SymbolKind.Interface;
				case EntityRelationshipPackage.ATTRIBUTE: return SymbolKind.Number;
				default: return SymbolKind.Property;
			}
		}
		
		return super.getSymbolKind(clazz);
	}
}
