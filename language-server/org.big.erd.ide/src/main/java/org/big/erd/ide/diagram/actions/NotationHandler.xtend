package org.big.erd.ide.diagram.actions

import com.google.inject.Inject
import org.eclipse.lsp4j.Range
import org.eclipse.lsp4j.TextEdit
import org.eclipse.lsp4j.WorkspaceEdit
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.xtext.ILanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.WorkspaceEditAction
import org.eclipse.sprotty.xtext.tracing.PositionConverter
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.ide.server.UriExtensions
import org.big.erd.entityRelationship.Model
//import org.apache.log4j.Logger
import org.eclipse.xtext.resource.ILocationInFileProvider
import org.eclipse.lsp4j.Position
import static org.big.erd.entityRelationship.EntityRelationshipPackage.Literals.*

class NotationHandler {

	// static val LOG = Logger.getLogger(NotationHandler)
	@Inject UriExtensions uriExtensions
	@Inject extension PositionConverter
	@Inject ILocationInFileProvider locationInFileProvider

	def handle(ChangeNotationAction action, ILanguageAwareDiagramServer server) {

		val root = server.diagramState.currentModel
		val newNotation = action?.notation

		server.diagramLanguageServer.languageServerAccess.doRead(server.sourceUri, [ context |

			val rootelem = root.resolveElement(context)

			if (rootelem instanceof Model) {
				val textEdits = newArrayList

				if (rootelem.notation !== null) {

					var textRegion = locationInFileProvider.getFullTextRegion(rootelem.notation)
					var startPosition = toPosition(textRegion.offset, rootelem.notation)
					var endPosition = toPosition(textRegion.offset + textRegion.length, rootelem.notation)
					var range = new Range(startPosition, endPosition)
					var newText = '''notation=«newNotation»'''
					textEdits += new TextEdit(range, newText)

				} else {

					var textRegion = locationInFileProvider.getFullTextRegion(rootelem, MODEL__NAME, -1);
					var rootPosition = toPosition(textRegion.offset + textRegion.length, rootelem)
					var generatePosition = new Position(rootPosition.line + 1, 0)
					var range = new Range(generatePosition, generatePosition)
					var newText = '''notation=«newNotation»«'\n'»'''
					textEdits += new TextEdit(range, newText)

				}

				val workspaceEdit = new WorkspaceEdit() => [changes = #{server.sourceUri -> textEdits}]
				server.dispatch(new WorkspaceEditAction => [it.workspaceEdit = workspaceEdit]);
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

}
