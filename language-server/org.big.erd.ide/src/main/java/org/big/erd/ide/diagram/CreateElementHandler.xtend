package org.big.erd.ide.diagram

import com.google.inject.Inject
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.TextEdit
import org.eclipse.lsp4j.WorkspaceEdit
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.xtext.ILanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.WorkspaceEditAction
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.UriExtensions
import org.big.erd.entityRelationship.Model
import org.eclipse.lsp4j.Position
import org.eclipse.emf.common.util.URI

import java.util.List

class CreateElementHandler {

	@Inject UriExtensions uriExtensions

	def handle(CreateElementEditAction action, ILanguageAwareDiagramServer server) {
		val root = server.diagramState.currentModel
		
		server.diagramLanguageServer.languageServerAccess.doRead(server.sourceUri, [ context |
			val model = root.resolveElement(context)
			if (model instanceof Model) {
				if (action.elementType.equals('entity')) {
					server.dispatch(new WorkspaceEditAction => [
						it.workspaceEdit = createInsertWorkspaceEdit(
							model.eResource.URI,
					 		context.document.getPosition(context.document.contents.length),
					 		'''«'\n'»entity «getNewName('Entity', model.entities.map[name])» {«'\n\n'»}'''
						)
					]);
				} else if (action.elementType.equals('relationship')) {
					server.dispatch(new WorkspaceEditAction => [
						it.workspaceEdit = createInsertWorkspaceEdit(
							model.eResource.URI,
					 		context.document.getPosition(context.document.contents.length),
					 		'''«'\n'»relationship «getNewName('relationship', model.relationships.map[name])» {«'\n\n'»}'''
						)
					]);
				}
			}
			
			return null
		])
		
	}

	private def resolveElement(SModelElement sElement, ILanguageServerAccess.Context context) {
		if (sElement.trace !== null) {
			val elementURI = sElement.trace.toURI
			return context.resource.resourceSet.getEObject(elementURI, true);
		} else {
			return null
		}
	}

	private def toURI(String path) {
		val parts = path.split('#')
		if (parts.size !== 2)
			throw new IllegalArgumentException('Invalid trace URI ' + path)
		return uriExtensions.toUri(parts.head).trimQuery.appendFragment(parts.last)
	}	
	
	private def createInsertWorkspaceEdit(URI uri, Position position, String text) {
		new WorkspaceEdit => [
			changes = #{uri.toString -> #[new TextEdit(new Range(position, position), text)]}
		]
	}
	
	private def String getNewName(String prefix, List<? extends String> siblings) {
		for (var i = 0;; i++) {
			val currentName = prefix + i
			if (!siblings.exists[it == currentName])
				return currentName
		}
	}
}