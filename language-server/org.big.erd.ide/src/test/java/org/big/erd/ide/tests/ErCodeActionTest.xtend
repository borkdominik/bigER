package org.big.erd.ide.tests

import org.junit.Test


class ErCodeActionTest extends AbstractIdeTest {
	
	@Test 
	def void testCapitalizeName() {
		testCodeAction[
			model = '''
				erdiagram Model
				entity entity1 {
					id key
				}
			'''
			line = 1
			expectedCodeActions = '''
				title : Capitalize Name
				kind : quickfix
				command : 
				edit : changes :
					MyModel.erd :  [[1, 0] .. [1, 0]]
				documentChanges : 
			'''
		]
	}
	
	// TODO: Revise code actions and implement tests
	
}