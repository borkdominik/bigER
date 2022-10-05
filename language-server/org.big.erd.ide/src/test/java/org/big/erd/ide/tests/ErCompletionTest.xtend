package org.big.erd.ide.tests

import org.junit.Test


class ErCompletionTest extends AbstractIdeTest {
	
	@Test 
	def void testEmptyModel() {
		testCompletion [ 
			model = ''''''
			line = 0
			column = 0
			expectedCompletionItems = '''
				erdiagram -> erdiagram [[0, 0] .. [0, 0]]
			'''
		]
	}
}