package org.big.erd.tests

import com.google.inject.Inject
import org.big.erd.entityRelationship.Model
import org.big.erd.generator.sql.SqlImport
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.util.ParseHelper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.^extension.ExtendWith

import static org.junit.Assert.assertTrue

@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class SqlImportTest {
	
	@Inject ParseHelper<Model> parseHelper
	SqlImport importer
	
	@BeforeEach
	def void setup() {
		importer = new SqlImport()
	}
	
	@Test
	def void testImport() {
		assertTrue(importer.handleFiles());
	}
     
}