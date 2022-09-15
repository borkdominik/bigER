package org.big.erd.tests

import org.junit.jupiter.api.^extension.ExtendWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import com.google.inject.Inject
import org.eclipse.xtext.serializer.ISerializer
import org.eclipse.xtext.testing.InjectWith
import org.junit.jupiter.api.Test
import org.eclipse.xtext.testing.util.ParseHelper
import org.big.erd.entityRelationship.Model
import org.eclipse.xtext.resource.SaveOptions
import static org.junit.jupiter.api.Assertions.*;


@ExtendWith(InjectionExtension)
@InjectWith(EntityRelationshipInjectorProvider)
class ErFormatterTest {
	
	@Inject extension ISerializer
	@Inject extension ParseHelper<Model>
	
	
	@Test
	def void testFormatModel() throws Exception {
		val String source = '''
			erdiagram  Model
		''';
		
		val String expected = '''
			erdiagram Model
		''';
		assertEquals(expected, format(source));
	}
	
	@Test
	def void testFormatOptions() throws Exception {
		val String source = '''
			erdiagram Model generate=off notation=default
		''';
		
		val String expected = '''
			erdiagram Model
			generate=off
			notation=default
		''';
		assertEquals(expected, format(source));
	}
	
	@Test
	def void testFormatEntity() throws Exception {
		val String source = '''
			erdiagram Model
			
			entity  Name  { attr1 attr2 }
		''';
		
		val String expected = '''
			erdiagram Model
			
			entity Name {
				attr1
				attr2
			}
		''';
		assertEquals(expected, format(source));
	}
	
	
	
	def private String format(String text) {
		text.parse.serialize(SaveOptions.newBuilder.format().getOptions())
	}
}