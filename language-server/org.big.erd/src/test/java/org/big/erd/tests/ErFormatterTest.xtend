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
	
	@Test def void testFormatModel() {
		val String source = '''
			erdiagram  Model    generate =  off notation = default
			
			entity  Entity1{ } entity Entity2   extends  Entity1  { }
			weak  entity WeakEntity { }
			
			relationship  Rel1 { }
			weak  relationship  Rel2{}
		''';
		val String expected = '''
			erdiagram Model
			generate=off
			notation=default
			
			entity Entity1 { }
			entity Entity2 extends Entity1 { }
			weak entity WeakEntity { }
			
			relationship Rel1 { }
			weak relationship Rel2 {}
		''';
		assertEquals(expected, format(source));
	}
	
	@Test def void testFormatAttributes() {
		val String source = '''
			erdiagram Model
			
			entity Entity1 { 
			attr1 : int  key
				attr2 :  varchar(255)
			attr3: varchar (  255 )
				attr3  derived
					attr4
			}
		''';	
		val String expected = '''
			erdiagram Model
			
			entity Entity1 {
				attr1: int key
				attr2: varchar(255)
				attr3: varchar(255)
				attr3 derived
				attr4
			}
		''';
		assertEquals(expected, format(source));
	}
	
	@Test def void testFormatRelations() {
		val String source = '''
			erdiagram  Model
			
			entity Entity1 {} 
			entity Entity2 {}
			entity Entity3 {}
			
			relationship Rel1 {
				Entity1 [ 1 ] -> Entity2[  N  ]
			}
			relationship Rel2 {
				Entity1[ 0..1] -> Entity2  [ 0..N ] -> Entity3[1]
			}
		''';
		
		val String expected = '''
			erdiagram Model
			
			entity Entity1 {}
			entity Entity2 {}
			entity Entity3 {}
			
			relationship Rel1 {
				Entity1[1] -> Entity2[N]
			}
			relationship Rel2 {
				Entity1[0..1] -> Entity2[0..N] -> Entity3[1]
			}
		''';
		assertEquals(expected, format(source));
	}
	
	
	def private String format(String text) {
		text.parse.serialize(SaveOptions.newBuilder.format().getOptions())
	}
}