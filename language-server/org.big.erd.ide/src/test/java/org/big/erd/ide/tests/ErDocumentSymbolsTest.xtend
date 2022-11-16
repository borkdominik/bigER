package org.big.erd.ide.tests

import org.junit.Test


class ErDocumentSymbolsTest extends AbstractIdeTest {
	
	@Test
	def void testEmptyModel() {
		testDocumentSymbol[
			model = '''
				erdiagram Model
			'''
			expectedSymbols = '''
				symbol "Model" {
					kind: 5
					location: MyModel.erd [[0, 10] .. [0, 15]]
				}
			'''
		]
	}
	
	@Test
	def void testModelWithOptions() {
		testDocumentSymbol[
			model = '''
				erdiagram Model
				notation=default
			'''
			expectedSymbols = '''
				symbol "Model" {
					kind: 5
					location: MyModel.erd [[0, 10] .. [0, 15]]
				}
				symbol "default" {
					kind: 7
					location: MyModel.erd [[1, 0] .. [1, 8]]
					container: "Model"
				}
			'''
		]
	}
}