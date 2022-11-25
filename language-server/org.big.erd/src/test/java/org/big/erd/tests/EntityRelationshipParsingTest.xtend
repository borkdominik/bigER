package org.big.erd.tests

import com.google.inject.Inject
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.util.ParseHelper
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.^extension.ExtendWith
import org.big.erd.entityRelationship.Model
import org.eclipse.xtext.testing.validation.ValidationTestHelper
import org.big.erd.entityRelationship.NotationType
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.CardinalityType

@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class EntityRelationshipParsingTest {
	
	@Inject ParseHelper<Model> parseHelper
	@Inject ValidationTestHelper validationTestHelper

	@Test
	def void testEmptyModel() {
		val model = parseHelper.parse('''
			erdiagram TestModel
		''')
		checkModel(model)
		Assertions.assertEquals("TestModel", model.name)
	}
	
	@Test
	def void testNotation() {
		val model1 = parseHelper.parse('''
			erdiagram TestModel
			notation=default
		''')
		val model2 = parseHelper.parse('''
			erdiagram TestModel
			notation=bachman
		''')
		val model3 = parseHelper.parse('''
			erdiagram TestModel
			notation=chen
		''')
		val model4 = parseHelper.parse('''
			erdiagram TestModel
			notation=crowsfoot
		''')
		checkModel(model1, model2, model3, model4)
		Assertions.assertEquals(NotationType.DEFAULT, model1.notation.notationType)
		Assertions.assertEquals(NotationType.BACHMAN, model2.notation.notationType)
		Assertions.assertEquals(NotationType.CHEN, model3.notation.notationType)
		Assertions.assertEquals(NotationType.CROWSFOOT, model4.notation.notationType)
	}
	
	@Test
	def void testElementsInRandomOrder() {
		val model = parseHelper.parse('''
			erdiagram TestModel
			
			entity Entity1 {
				id key
			}
			relationship Rel {
				Entity1 -> Entity2
			}
			entity Entity2 {
				id key
			}
		''')
		checkModel(model)
		Assertions.assertEquals(2, model.entities.size)
		Assertions.assertEquals(1, model.relationships.size)
	}
	
	@Test
	def void testWeakEntity() {
		val model = parseHelper.parse('''
			erdiagram TestModel
			
			entity Entity1 {
				id key
			}
			weak entity Entity2 {
				id partial-key
			}
			weak relationship Rel {
				Entity1 -> Entity2
			}
		''')
		checkModel(model)
		Assertions.assertEquals(1, model.entities.filter[it.weak].size)
		Assertions.assertEquals(1, model.entities.filter[!it.weak].size)
		Assertions.assertEquals(true, model.relationships.get(0).isWeak)
	}
	
	/* TODO: Test Inheritance
	@Test
	def void testInheritance() {
		val model = parseHelper.parse('''
			erdiagram TestModel
			
			entity Entity1 {
				id key
			}
			entity Entity2 extends Entity1{
				id
			}
			weak relationship Rel {
				Entity1 -> Entity2
			}
		'''
		)
		checkModel(model)
	}
	*/
	
	@Test
	def void testEntityWithAttributes() {
		val model = parseHelper.parse('''
			erdiagram TestModel
			
			entity Entity1 {
				attr1 key
				attr2
				attr3: int
				attr4: varchar(255)
				attr5 derived
				attr6: int derived
			}
		''')
		checkModel(model)
		val entity = model.entities.get(0)
		val attributesWithDatatype = entity.attributes.filter[it.datatype !== null]
		val attributeWithSize = attributesWithDatatype.filter[it.datatype.type.equals("varchar")]
		Assertions.assertEquals(6, entity.attributes.size)
		Assertions.assertEquals(1, entity.attributes.filter[it.type === AttributeType.KEY].size)
		Assertions.assertEquals(2, entity.attributes.filter[it.type === AttributeType.DERIVED].size)
		Assertions.assertEquals(3, attributesWithDatatype.size)
		Assertions.assertEquals(2, attributesWithDatatype.filter[it.datatype.type.equals("int")].size)
		Assertions.assertEquals(1, attributeWithSize.size)
		Assertions.assertEquals(255, attributeWithSize.get(0).datatype.size)
	}
	
	@Test
	def void testRelationships() {
		val model = parseHelper.parse('''
			erdiagram TestModel
			
			entity Entity1 { id key }
			entity Entity2 { id key }
			entity Entity3 { id key }
			
			relationship Rel1 {
			    // unary relationship
			    Entity1 -> Entity1
			}
			relationship Rel2 {
				// binary relationship
				Entity1 -> Entity2
			}
			relationship Rel3 {
				// ternary relationship
				Entity1 -> Entity2 -> Entity3
			}
			relationship Rel4 {
				// empty relationship
			}
			relationship Rel5 {
				// single entity
				Entity1
			}
		''')
		checkModel(model)
		val rel1 = model.relationships.filter[it.name.equals("Rel1")].get(0)
		val rel2 = model.relationships.filter[it.name.equals("Rel2")].get(0)
		val rel3 = model.relationships.filter[it.name.equals("Rel3")].get(0)
		val rel4 = model.relationships.filter[it.name.equals("Rel4")].get(0)
		val rel5 = model.relationships.filter[it.name.equals("Rel5")].get(0)
		val entity1 = model.entities.filter[it.name.equals("Entity1")].get(0)
		val entity2 = model.entities.filter[it.name.equals("Entity2")].get(0)
		val entity3 = model.entities.filter[it.name.equals("Entity3")].get(0)
		Assertions.assertEquals(entity1, rel1.first.target)
		Assertions.assertEquals(entity1, rel1.second.target)
		Assertions.assertEquals(entity1, rel2.first.target)
		Assertions.assertEquals(entity2, rel2.second.target)
		Assertions.assertEquals(entity1, rel3.first.target)
		Assertions.assertEquals(entity2, rel3.second.target)
		Assertions.assertEquals(entity3, rel3.third.target)
		Assertions.assertEquals(null, rel4.first?.target)
		Assertions.assertEquals(null, rel4.second?.target)
		Assertions.assertEquals(null, rel4.third?.target)
		Assertions.assertEquals(entity1, rel5.first.target)
	}
	
	@Test
	def void testCardinalities() {
		val model = parseHelper.parse('''
			erdiagram TestModel
			
			entity Entity1 { id key }
			entity Entity2 { id key }
			entity Entity3 { id key }
			entity Entity4 { id key }
			entity Entity5 { id key }
			entity Entity6 { id key }
			entity Entity7 { id key }
			entity Entity8 { id key }
			
			relationship Rel1 {
			    // zero-or-one -> one-and-only-one
			    Entity1[0..1] -> Entity2[1..1]
			}
			relationship Rel2 {
			    // [1..1] is the same as [1] (one)
			    Entity3[1..1] -> Entity4[1]
			}
			relationship Rel3 {
			    // zero-or-more -> one-or-more
			    Entity5[0..N] -> Entity6[1..N]
			}
			relationship Rel4 {
			    // [1..N] is the same as [N] (many)
			    Entity7[1..N] -> Entity8[N]
			}
		''')
		checkModel(model)
		val rel1 = model.relationships.filter[it.name.equals("Rel1")].get(0)
		val rel2 = model.relationships.filter[it.name.equals("Rel2")].get(0)
		val rel3 = model.relationships.filter[it.name.equals("Rel3")].get(0)
		val rel4 = model.relationships.filter[it.name.equals("Rel4")].get(0)
		Assertions.assertEquals(CardinalityType.ZERO_OR_ONE, rel1.first.cardinality)
		Assertions.assertEquals(CardinalityType.ONE, rel1.second.cardinality)
		Assertions.assertEquals(CardinalityType.ONE, rel2.first.cardinality)
		Assertions.assertEquals(CardinalityType.ONE, rel2.second.cardinality)
		Assertions.assertEquals(CardinalityType.ZERO_OR_MORE, rel3.first.cardinality)
		Assertions.assertEquals(CardinalityType.MANY, rel3.second.cardinality)
		Assertions.assertEquals(CardinalityType.MANY, rel4.first.cardinality)
		Assertions.assertEquals(CardinalityType.MANY, rel4.second.cardinality)
	}
	
	@Test
	def void testRole() {
		val model = parseHelper.parse('''
			erdiagram TestModel
			
			entity Entity1 { id key }
			entity Entity2 { id key }
			
			relationship Rel1 {
			    Entity1[1] -> Entity2[N | "test"]
			}
		''')
		checkModel(model)
		val rel = model.relationships.get(0)
		Assertions.assertEquals(null, rel.first.role)
		Assertions.assertEquals("test", rel.second.role)
	}
	
	
	@Test
	def void loadModel() {
		val model = parseHelper.parse('''
			erdiagram name
			entity Customer {
				id key
				birthday
				age derived
				address multivalue
			}
			entity Invoice {
				id key
				name
				orderDate
			}
			entity Product {
				id key
				name
				price
			}
			relationship buys {
				Customer[1] -> Product[N]
			}
		''')
		checkModel(model)
	}
	
	def private checkModel(Model... model) {
		model.forEach[m |
			Assertions.assertNotNull(m)
			val errors = m.eResource.errors
			Assertions.assertTrue(errors.isEmpty, '''Unexpected errors: «errors.join(", ")»''')
			validationTestHelper.assertNoIssues(m)
		]
	}
}
