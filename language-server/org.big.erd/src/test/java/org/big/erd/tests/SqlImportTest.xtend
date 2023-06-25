package org.big.erd.tests

import org.big.erd.generator.sql.SqlImport
import org.junit.jupiter.api.Test
import static org.junit.Assert.assertTrue

class SqlImportTest {
	
	@Test
	def void testImport() {
		assertTrue(SqlImport.handleFiles());
	}
     
}