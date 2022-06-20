package org.big.erd.ide.diagram

import com.google.inject.Inject
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.TextEdit
import org.eclipse.lsp4j.WorkspaceEdit
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.SModelIndex
import org.eclipse.sprotty.xtext.ILanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.ReconnectAction
import org.eclipse.sprotty.xtext.WorkspaceEditAction
import org.eclipse.sprotty.xtext.tracing.PositionConverter
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.UriExtensions
import org.eclipse.xtext.nodemodel.util.NodeModelUtils
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.Relationship
import org.big.erd.entityRelationship.RelationEntity

class ReconnectHandler {

	@Inject UriExtensions uriExtensions
	@Inject extension PositionConverter

	def handle(ReconnectAction action, ILanguageAwareDiagramServer server) {
		val root = server.diagramState.currentModel
		val extension index = new SModelIndex(root)
		val source = action.newSourceId?.get
		val target = action.newTargetId?.get
		server.diagramLanguageServer.languageServerAccess.doRead(server.sourceUri, [ context |
			val sourceElement = source?.resolveElement(context)
			val targetElement = target?.resolveElement(context)
			if (sourceElement instanceof Relationship && targetElement instanceof Entity) {
				val textEdits = newArrayList
				var relationText = ''
				var newRange = getNewRange(sourceElement as Relationship)

				if ((sourceElement as Relationship).first === null) {
					relationText = ''' {«'\n\t'»«(targetElement as Entity).name»«'\n'»}'''
					textEdits += new TextEdit(newRange, relationText)
				} else {
					if ((sourceElement as Relationship).second === null) {
						newRange = getSourceRange((sourceElement as Relationship).first)
						relationText = ''' -> «(targetElement as Entity).name»'''
						textEdits += new TextEdit(newRange, relationText)
					} else {
						// TODO: ternary relationship	
						// Not supported
						return null
					}

				}
				val workspaceEdit = new WorkspaceEdit() => [
					changes = #{server.sourceUri -> textEdits}
				]
				server.dispatch(new WorkspaceEditAction => [
					it.workspaceEdit = workspaceEdit
				]);
			}
			return null
		])
	}

	private def getNewRange(Relationship sourceElement) {
		val position = NodeModelUtils.findActualNodeFor(sourceElement).endOffset.toPosition(sourceElement)
		return new Range(position, position)
	}

	private def getSourceRange(RelationEntity sourceElement) {
		val position = NodeModelUtils.findActualNodeFor(sourceElement).endOffset.toPosition(sourceElement)
		return new Range(position, position)
	}

	private def resolveElement(SModelElement sElement, ILanguageServerAccess.Context context) {
		if (sElement.trace !== null) {
			val connectableURI = sElement.trace.toURI
			return context.resource.resourceSet.getEObject(connectableURI, true);
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
}
