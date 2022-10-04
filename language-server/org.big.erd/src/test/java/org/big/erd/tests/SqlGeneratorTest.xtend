package org.big.erd.tests

import org.junit.jupiter.api.^extension.ExtendWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import com.google.inject.Inject
import org.eclipse.xtext.testing.InjectWith
import org.junit.jupiter.api.Test
import org.eclipse.xtext.xbase.testing.CompilationTestHelper


@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class SqlGeneratorTest {
	
	@Inject extension CompilationTestHelper
	
	
	// TODO: Fix unnecessary line breaks at end
	@Test def testEntityToTable() {
		'''
			erdiagram Model
			generate=sql
			
			entity A {
				id: INT key
			}
     	'''.assertCompilesTo('''
     		CREATE TABLE A(
     			id INT,
     			PRIMARY KEY (id)
     		);
     		
     		
     	''');
     }
}