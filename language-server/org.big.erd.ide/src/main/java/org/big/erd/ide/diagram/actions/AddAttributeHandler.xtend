package org.big.erd.ide.diagram.actions

import com.google.inject.Inject
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.TextEdit
import org.eclipse.lsp4j.WorkspaceEdit
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.xtext.ILanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.WorkspaceEditAction
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.UriExtensions
import org.eclipse.lsp4j.Position
import org.eclipse.emf.common.util.URI
import java.util.List
import org.eclipse.xtext.resource.ILocationInFileProvider
import org.big.erd.entityRelationship.Entity
import org.eclipse.sprotty.xtext.tracing.PositionConverter
import org.eclipse.sprotty.SModelIndex
import org.big.erd.entityRelationship.Relationship
import org.big.erd.ide.diagram.EntityNode
import org.big.erd.ide.diagram.RelationshipNode

// import org.apache.log4j.Logger


class AddAttributeHandler {
	
	// static val LOG = Logger.getLogger(AddAttributeHandler)
	
	@Inject UriExtensions uriExtensions
	@Inject extension PositionConverter
	@Inject ILocationInFileProvider locationInFileProvider

	def handle(AddAttributeAction action, ILanguageAwareDiagramServer server) {
		val root = server.diagramState.currentModel
		val node = new SModelIndex(server.model).get(action.elementId)
		
		if (node !== null && node instanceof EntityNode) {
			server.diagramLanguageServer.languageServerAccess.doRead(server.sourceUri, [ context |
				val model = root.resolveElement(context)
				val entity = node.resolveElement(context)
				if (entity instanceof Entity) {
					val textRegion = locationInFileProvider.getFullTextRegion(entity)
					server.dispatch(new WorkspaceEditAction => [
						it.workspaceEdit = createInsertWorkspaceEdit(
							model.eResource.URI,
					 		toPosition(textRegion.offset + textRegion.length - 1, entity),
					 		'''«'\t'»«getNewName('attr', entity.attributes.map[name])»«'\n'»'''
						)]);
				}
				return null
			])
		} else if (node !== null && node instanceof RelationshipNode) {
			// TODO: improve duplicate code
			server.diagramLanguageServer.languageServerAccess.doRead(server.sourceUri, [ context |
				val model = root.resolveElement(context)
				val relationship = node.resolveElement(context)
				if (relationship instanceof Relationship) {
					val textRegion = locationInFileProvider.getFullTextRegion(relationship)
					server.dispatch(new WorkspaceEditAction => [
						it.workspaceEdit = createInsertWorkspaceEdit(
							model.eResource.URI,
					 		toPosition(textRegion.offset + textRegion.length - 1, relationship),
					 		'''«'\t'»«getNewName('attr', relationship.attributes.map[name])»«'\n'»'''
						)]);
				}
				return null
			])
		}
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
		for (var i = 1;; i++) {
			val currentName = prefix + i
			if (!siblings.exists[it == currentName])
				return currentName
		}
	}
}