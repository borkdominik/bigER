package org.big.erd.tests

import org.junit.jupiter.api.^extension.ExtendWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.util.ParseHelper
import com.google.inject.Inject
import org.junit.jupiter.api.Test
import org.big.erd.entityRelationship.Model
import org.big.erd.generator.sql.SqlGenerator
import static org.junit.Assert.assertTrue

@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class SqlNewGeneratorTest {
	
	@Inject ParseHelper<Model> parseHelper
	
	@Test
	def void testExport() {
		// TODO: fix test
		// assertTrue(SqlGenerator.handleFiles([fileContent | parseHelper.parse(fileContent)]));
	}
     
}