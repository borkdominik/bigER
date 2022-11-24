package org.big.erd.tests

import org.junit.jupiter.api.^extension.ExtendWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.util.ParseHelper
import com.google.inject.Inject
import org.junit.jupiter.api.Test
import org.big.erd.entityRelationship.Model
import org.big.erd.generator.SqlGenerator
import org.junit.jupiter.api.BeforeEach
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class SqlGeneratorTest {
	
	// TODO: test .sql file created
	// TODO: add more tests
	
	@Inject ParseHelper<Model> parseHelper
	SqlGenerator generator
	
	@BeforeEach
	def void setup() {
		generator = new SqlGenerator()
	}
	
	@Test
	def void testEntityToTable() {
		val model = parseHelper.parse('''
			erdiagram Model
			
			entity A {
				id: INT key
			}
     	''')
     	val generated = generator.generate(model)
     	assertEquals('''
     		CREATE TABLE A(
     			id INT,
     			PRIMARY KEY (id)
     		);
     	'''.toString, generated.toString)
	}
	
	@Test 
	def void testAttributes() {
		val model = parseHelper.parse('''
			erdiagram Model
			
			entity A {
				id: INT key
				name: VARCHAR(80)
				birthday: DATETIME
				age: INT derived
			}
     	''')
     	val generated = generator.generate(model)
     	assertEquals('''
     		CREATE TABLE A(
     			id INT,
     			name VARCHAR(80),
     			birthday DATETIME,
     			PRIMARY KEY (id)
     		);
     	'''.toString, generated.toString)
     }
     
	@Test 
	def void testRelationship() {
		val model = parseHelper.parse('''
			erdiagram Model
			
			entity A { id1: int key }
			entity B { id2: int key }
			relationship Rel { 
				A -> B
				attr: string
			}
     	''')
     	val generated = generator.generate(model)
     	assertEquals('''
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
     	'''.toString, generated.toString)
     }
     
}