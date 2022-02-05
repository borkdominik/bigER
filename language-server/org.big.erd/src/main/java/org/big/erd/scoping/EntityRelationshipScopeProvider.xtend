package org.big.erd.scoping

import org.eclipse.xtext.scoping.Scopes
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.EntityRelationshipPackage
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EReference
import org.eclipse.xtext.EcoreUtil2

//import static extension org.eclipse.xtext.EcoreUtil2.*

// import static org.big.erd.entityRelationship.EntityRelationshipPackage.Literals.*

/**
 * This class contains custom scoping description.
 * 
 * See https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#scoping
 * on how and when to use it.
 */
class EntityRelationshipScopeProvider extends AbstractEntityRelationshipScopeProvider {

        override getScope(EObject context, EReference reference) {
            
            // Scoping for inheritance to avoid self-inheritance
            if ((context instanceof Entity) && (reference == EntityRelationshipPackage.Literals.ENTITY__EXTENDS)) {
                val rootElement = EcoreUtil2.getRootContainer(context);
                
                var candidates = EcoreUtil2.getAllContentsOfType(rootElement, Entity);
                if(candidates.contains(context)) {
                    candidates.remove(context)
                } 
                return Scopes.scopeFor(candidates)
            }
            super.getScope(context, reference);
        }
}
