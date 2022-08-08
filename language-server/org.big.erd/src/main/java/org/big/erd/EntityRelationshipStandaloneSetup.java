package org.big.erd;


/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
public class EntityRelationshipStandaloneSetup extends EntityRelationshipStandaloneSetupGenerated {
	
	public static void doSetup() {
		new EntityRelationshipStandaloneSetup().createInjectorAndDoEMFRegistration();
	}
}
