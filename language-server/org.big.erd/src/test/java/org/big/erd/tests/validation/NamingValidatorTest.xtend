package org.big.erd.tests.validation

import org.junit.jupiter.api.^extension.ExtendWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import com.google.inject.Inject
import org.eclipse.xtext.testing.InjectWith
import org.junit.jupiter.api.Test
import org.eclipse.xtext.testing.util.ParseHelper
import org.big.erd.entityRelationship.Model
import org.eclipse.xtext.testing.validation.ValidationTestHelper
import org.big.erd.validation.NamingValidator
import org.eclipse.xtext.diagnostics.Severity
import org.big.erd.tests.EntityRelationshipInjectorProvider
import static org.big.erd.entityRelationship.EntityRelationshipPackage.Literals.*


@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class NamingValidatorTest {
	
	@Inject ParseHelper<Model> parseHelper
	@Inject ValidationTestHelper validationTestHelper
	
	@Test
	def void testDuplicateEntities() {
		val model = parseHelper.parse('''
			erdiagram Model
			entity A { id key }
			entity B { id key }
			entity A { id key }
		''')
		validationTestHelper.assertError(
			model.eResource(), 
			ENTITY, 
			NamingValidator.DUPLICATE_ENTITY_NAME
		)
	}
	
	@Test
	def void testDuplicateRelationships() {
		val model = parseHelper.parse('''
			erdiagram Model
			entity A { id key }
			entity B { id key }
			relationship Rel { }
			relationship Rel { }
		''')
		validationTestHelper.assertError(
			model.eResource(), 
			RELATIONSHIP, 
			NamingValidator.DUPLICATE_RELATIONSHIP_NAME
		)
	}
	
	@Test
	def void testDuplicateAttributes() {
		val model = parseHelper.parse('''
			erdiagram Model
			entity A { 
				attr: int key
				attr: string
			}
		''')
		validationTestHelper.assertError(
			model.eResource(), 
			ATTRIBUTE, 
			NamingValidator.DUPLICATE_ATTRIBUTE_NAME
		)
	}
	
	@Test
	def void testLowercaseEntityName() {
		val model = parseHelper.parse('''
			erdiagram Model
			entity a { }
		''')
		validationTestHelper.assertIssue(
			model.eResource(), 
			ENTITY, 
			NamingValidator.LOWERCASE_ENTITY_NAME,
			Severity.INFO
		)
	}
	
	/* 
	@Test
	def void testMissingModelName(){
		val model = parseHelper.parse('''
			erdiagram 
		''')
		validationTestHelper.assertError(
			model.eResource(), 
			EntityRelationshipPackage.Literals.MODEL, 
			NamingValidator.MISSING_MODEL_NAME
		)
	}*/
}