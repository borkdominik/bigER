package org.big.erd.ide.tests

import org.eclipse.xtext.testing.AbstractLanguageServerTest


abstract class AbstractIdeTest extends AbstractLanguageServerTest {
	
	new() {
		super('erd')
	}
}