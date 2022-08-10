package org.big.erd.ide.codeActions

import org.big.erd.entityRelationship.Model
import java.util.List
import org.eclipse.emf.common.util.URI
import org.eclipse.lsp4j.CodeAction
import org.eclipse.lsp4j.CodeActionParams
import org.eclipse.lsp4j.Command
import org.eclipse.emf.ecore.EObject
import org.eclipse.lsp4j.TextEdit
import org.eclipse.lsp4j.WorkspaceEdit
import org.eclipse.lsp4j.jsonrpc.messages.Either
import org.eclipse.xtext.ide.server.Document
import org.eclipse.xtext.ide.server.codeActions.ICodeActionService2
import org.big.erd.validation.NamingValidator
import org.eclipse.lsp4j.CodeActionKind
import com.google.inject.Inject
import org.eclipse.xtext.resource.ILocationInFileProvider

class ERDCodeActionService implements ICodeActionService2 {

	@Inject protected ILocationInFileProvider locationProvider

	override getCodeActions(Options options) {
		var root = options.resource.contents.head
		if (root instanceof Model) {
			return createCodeActions(root, options.codeActionParams, options.document)
		}
		return emptyList
	}

	private def dispatch List<Either<Command, CodeAction>> createCodeActions(Model model, CodeActionParams params, Document document) {
		val result = <Either<Command, CodeAction>>newArrayList
		
		// provide quick fixes for validation issues as code actions
		for (d : params.context.diagnostics) {
			if (d.code?.getLeft == NamingValidator.MISSING_MODEL_HEADER) {
				val text = '''erdiagram ModelName«'\n'»'''
				result.add(Either.forRight(new CodeAction => [
					kind = CodeActionKind.QuickFix
					title = "Insert model header"
					edit = new WorkspaceEdit() => [
						addTextEdit(model.eResource.URI, new TextEdit => [
							range = params.range
							newText = text
						])
					]
				]));
			}
			if (d.code?.getLeft == NamingValidator.LOWERCASE_ENTITY_NAME) {
				val text = document.getSubstring(params.range)
				result.add(Either.forRight(new CodeAction => [
					kind = CodeActionKind.QuickFix
					title = "Capitalize Name"
					edit = new WorkspaceEdit() => [
						addTextEdit(model.eResource.URI, new TextEdit => [
							range = params.range
							newText = text.toFirstUpper
						])
					]
				]));
			}
		}
		return result
	}

	protected def addTextEdit(WorkspaceEdit edit, URI uri, TextEdit... textEdit) {
		edit.changes.put(uri.toString, textEdit)
	}

	private def dispatch List<Either<Command, CodeAction>> createCodeActions(EObject element, CodeActionParams params,
		Document document) {
		return emptyList
	}
}
