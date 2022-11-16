package org.big.erd.generator;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.generator.IFileSystemAccess2;
import org.eclipse.xtext.generator.IGeneratorContext;


public interface IErGenerator {
	
	void generate(Resource resource, IFileSystemAccess2 fsa, IGeneratorContext context);
	
}
