package org.big.erd;

import org.big.erd.generator.pure.EntityRelationshipGenerator;
import org.eclipse.xtext.generator.IGenerator2;

/**
 * Use this class to register components to be used at runtime / without the Equinox extension registry.
 */
public class EntityRelationshipRuntimeModule extends AbstractEntityRelationshipRuntimeModule {

	public Class<? extends IGenerator2> bindIGenerator2() {
		return EntityRelationshipGenerator.class;
	}
}
