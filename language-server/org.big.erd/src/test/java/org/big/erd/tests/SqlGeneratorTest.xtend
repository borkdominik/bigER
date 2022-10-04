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
	
	@Test 
	def void testEntityToTable() {
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
     
	@Test 
	def void testAttributes() {
		'''
			erdiagram Model
			generate=sql
			
			entity A {
				id: INT key
				name: VARCHAR(80)
				birthday: DATETIME
				age: INT derived
			}
     	'''.assertCompilesTo('''
     		CREATE TABLE A(
     			id INT,
     			name VARCHAR(80),
     			birthday DATETIME,
     			PRIMARY KEY (id)
     		);
     	''');
     }
     
	@Test 
	def void testRelationship() {
		'''
			erdiagram Model
			generate=sql
			
			entity A { id1: int key }
			entity B { id2: int key }
			relationship Rel { 
				A -> B
				attr: string
			}
     	'''.assertCompilesTo('''
     		CREATE TABLE A(
     			id1 int,
     			PRIMARY KEY (id1)
     		);
     		CREATE TABLE B(
     			id2 int,
     			PRIMARY KEY (id2)
     		);
     		CREATE TABLE Rel(
     			id1 int references A(id1),
     			id2 int references B(id2),
     			attr string,
     			PRIMARY KEY (id1, id2)
     		);
     	''');
     }
     
}