package org.big.erd.ide.tests

import org.junit.Test


class ErHoverTest extends AbstractIdeTest {
	
	@Test
	def void testEmptyModel() {
		testHover[
			model = '''
				erdiagram Model
			'''
			line = 0
			column = 10
			expectedHover = '''
				[[0, 10] .. [0, 15]]
				kind: markdown
				value: **ER Model** Model
				
				---
				
				Notation: `default`
				
				Generator: `off`
				
				---
				
				0 Entities, 
				0 Relationships
			'''
		]
	}
}