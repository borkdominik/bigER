package org.big.erd.ide.diagram

import org.eclipse.sprotty.xtext.EditActionTypeAdapterFactory
import org.eclipse.sprotty.Action
import java.util.function.Consumer
import org.eclipse.xtend.lib.annotations.Accessors
import org.eclipse.xtend.lib.annotations.EqualsHashCode
import org.eclipse.xtend.lib.annotations.ToString

/**
 * Factory to process custom actions on the server
 */
class CustomActionTypeAdapterFactory extends EditActionTypeAdapterFactory {

	new() {
		addActionKind(ChangeNotationAction.KIND, ChangeNotationAction)
		addActionKind(CodeGenerateAction.KIND, CodeGenerateAction)
		addActionKind(CreateElementEditAction.KIND, CreateElementEditAction)
	}
}

/**
 * Action to change the notation option in the underlying model, to be synchronized with the diagram
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls=true)
class ChangeNotationAction implements Action {

	public static val KIND = 'changeNotation'
	String kind = KIND
	String notation

	new() { }

	new(Consumer<ChangeNotationAction> initializer) {
		initializer.accept(this)
	}
}

/**
 * Action to change the generate option in the underlying model, to be synchronized with the diagram
 */
@Accessors
@EqualsHashCode
@ToString(skipNulls=true)
class CodeGenerateAction implements Action {

	public static val KIND = 'codeGenerate'
	String kind = KIND
	String generateType

	new() { }

	new(Consumer<CodeGenerateAction> initializer) {
		initializer.accept(this)
	}
}

@Accessors
@EqualsHashCode
@ToString(skipNulls=true)
class CreateElementEditAction implements Action {

	public static val KIND = 'createElementEdit'
	String kind = KIND
	String elementType

	new() { }

	new(Consumer<CreateElementEditAction> initializer) {
		initializer.accept(this)
	}
}
