package org.big.erd.tests

import org.big.erd.generator.sql.SqlImport
import org.junit.jupiter.api.Test
import static org.junit.Assert.assertTrue
import org.junit.jupiter.api.BeforeEach

class SqlImportTest {
	
	SqlImport generator
	
	@BeforeEach
	def void setup() {
		generator = new SqlImport()
	}
	
	@Test
	def void testImport() {
		assertTrue(generator.handleFiles());
	}
     
}