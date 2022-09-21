package org.big.erd.tests.validation


import org.junit.jupiter.api.^extension.ExtendWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.InjectWith
import org.big.erd.tests.EntityRelationshipInjectorProvider
import org.junit.jupiter.api.Test
import org.eclipse.xtext.testing.util.ParseHelper
import org.big.erd.entityRelationship.Model
import org.eclipse.xtext.testing.validation.ValidationTestHelper
import org.big.erd.entityRelationship.EntityRelationshipPackage
import org.big.erd.validation.GenerateSqlValidator
import com.google.inject.Inject

@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class GenerateSqlValidatorTest {
	
	@Inject ParseHelper<Model> parseHelper
	@Inject ValidationTestHelper validationTestHelper
	
	@Test
	def void testMissingDatatype(){
		val model = parseHelper.parse('''
			erdiagram Model 
			generate=sql
			
			entity A {
				attr key
			}
		''')
		validationTestHelper.assertError(
			model.eResource(), 
			EntityRelationshipPackage.Literals.ATTRIBUTE, 
			GenerateSqlValidator.MISSING_ATTRIBUTE_DATATYPE
		)
	}
}