package org.big.erd.importer;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.generator.IFileSystemAccess2;
import org.eclipse.xtext.generator.IGeneratorContext;

public interface IErImporter {
	void importFile(String erdFile, String sqlFile, Resource resource, IFileSystemAccess2 fsa, IGeneratorContext context);
}
