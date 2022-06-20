package org.big.erd.ide.codeActions

import org.big.erd.entityRelationship.Model
import java.util.List
import org.eclipse.emf.common.util.URI
import org.eclipse.lsp4j.CodeAction
import org.eclipse.lsp4j.CodeActionParams
import org.eclipse.lsp4j.Command
import org.eclipse.emf.ecore.EObject
import org.eclipse.lsp4j.Position
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.TextEdit
import org.eclipse.lsp4j.WorkspaceEdit
import org.eclipse.lsp4j.jsonrpc.messages.Either
import org.eclipse.xtext.ide.server.Document
import org.eclipse.xtext.ide.server.codeActions.ICodeActionService2
import org.big.erd.validation.EntityRelationshipValidator
import org.eclipse.lsp4j.CodeActionKind
import com.google.inject.Inject
import org.eclipse.xtext.resource.ILocationInFileProvider

class ERDCodeActionService implements ICodeActionService2 {

	@Inject protected ILocationInFileProvider locationProvider
	static val CREATE_ENTITY_KIND = 'sprotty.create.entity'
	static val CREATE_RELATIONSHIP_KIND = 'sprotty.create.relationship'

	override getCodeActions(Options options) {
		var root = options.resource.contents.head
		if (root instanceof Model)
			return createCodeActions(root, options.codeActionParams, options.document)
		else
			return emptyList

	}

	private def dispatch List<Either<Command, CodeAction>> createCodeActions(Model model, CodeActionParams params,
		Document document) {
		val result = <Either<Command, CodeAction>>newArrayList

		if (CREATE_ENTITY_KIND.matchesContext(params)) {
			result.add(Either.forRight(new CodeAction => [
				kind = CREATE_ENTITY_KIND
				title = 'new Entity'
				edit = createInsertWorkspaceEdit(
					model.eResource.URI,
					document.getPosition(document.contents.length),
					'''«'\n'»entity «getNewName('Entity', model.entities.map[name])» {«'\n\n'»}'''
				)
			]));
		}

		if (CREATE_RELATIONSHIP_KIND.matchesContext(params)) {
			result.add(Either.forRight(new CodeAction => [
				kind = CREATE_RELATIONSHIP_KIND
				title = 'new Relationship'
				edit = createInsertWorkspaceEdit(
					model.eResource.URI,
					document.getPosition(document.contents.length),
					'''«'\n'»relationship «getNewName('relationship', model.relationships.map[name])» {«'\n\n'»}'''
				)
			]));
		}
		for (d : params.context.diagnostics) {
			/*if (d.code?.getLeft == EntityRelationshipValidator.MISSING_MODEL_NAME) {
			 * val region = locationProvider.getFullTextRegion(model)
			 * val startPos = new Position(region.offset, 0)
			 * //val textEditposition = new Position(startPos.line, 0)
			 * result.add(Either.forRight(new CodeAction => [
			 * 	kind = CodeActionKind.QuickFix
			 * 	title = "Add Header"
			 * 	edit = createInsertWorkspaceEdit(
			 * 		model.eResource.URI, 
			 * 		startPos, 
			 * 		'''erdiagram ModelName«'\n\n'»'''
			 * 	)
			 * ]));
			 }*/
			if (d.code?.getLeft == EntityRelationshipValidator.MISSING_MODEL_HEADER) {
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

			if (d.code?.getLeft == EntityRelationshipValidator.LOWERCASE_ENTITY_NAME) {
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

	private def matchesContext(String kind, CodeActionParams params) {
		if (params.context?.only === null)
			return true
		else
			return params.context.only.exists[kind.startsWith(it)]
	}

	private def String getNewName(String prefix, List<? extends String> siblings) {
		for (var i = 0;; i++) {
			val currentName = prefix + i
			if (!siblings.exists[it == currentName])
				return currentName
		}
	}

	private def dispatch List<Either<Command, CodeAction>> createCodeActions(EObject element, CodeActionParams params,
		Document document) {
		return emptyList
	}

	private def createInsertWorkspaceEdit(URI uri, Position position, String text) {
		new WorkspaceEdit => [
			changes = #{uri.toString -> #[new TextEdit(new Range(position, position), text)]}
		]
	}
}
