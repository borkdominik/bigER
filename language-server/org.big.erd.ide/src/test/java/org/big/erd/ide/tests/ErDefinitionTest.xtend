package org.big.erd.ide.tests

import org.junit.Test

class ErDefinitionTest extends AbstractIdeTest {
	
	@Test
	def void testEntityDefinitionFromRelationship() {
		testDefinition[
			model = '''
				erdiagram Model
				entity A { }
				entity B { }
				relationship Rel {
				   A -> B
				}
			'''
			line = 4
			column = 4
			expectedDefinitions = '''
				MyModel.erd [[1, 7] .. [1, 8]]
			'''
		]
	}
}