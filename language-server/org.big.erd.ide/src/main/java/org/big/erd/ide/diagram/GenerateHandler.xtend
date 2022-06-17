package org.big.erd.ide.diagram

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

class GenerateHandler {

    //static val LOG = Logger.getLogger(GenerateHandler)
    @Inject UriExtensions uriExtensions
	@Inject extension PositionConverter
	@Inject ILocationInFileProvider locationInFileProvider
   
    def handle(CodeGenerateAction action, ILanguageAwareDiagramServer server) {
        val root = server.diagramState.currentModel
        val newOption = action.generateType

        server.diagramLanguageServer.languageServerAccess.doRead(server.sourceUri, [ context |
            val rootElement = root.resolveElement(context)
            if (rootElement instanceof Model) {
            	
            	val textEdits = newArrayList
            	
            	if (rootElement.generateOption !== null) {
            		
            		var textRegion = locationInFileProvider.getFullTextRegion(rootElement.generateOption)
            		var startPosition = toPosition(textRegion.offset, rootElement.generateOption)
            		var endPosition = toPosition(textRegion.offset + textRegion.length, rootElement.generateOption)
            		var range = new Range(startPosition, endPosition)
            		var newText = '''generate=«newOption»'''
            		textEdits += new TextEdit(range, newText)
            		
            	} else {
            		
            		var textRegion = locationInFileProvider.getFullTextRegion(rootElement, MODEL__NAME, -1);
            		var rootPosition = toPosition(textRegion.offset + textRegion.length, rootElement)
            		var generatePosition = new Position(rootPosition.line + 1, 0)
            		var range = new Range(generatePosition, generatePosition)
            		var newText = '''generate=«newOption»«'\n'»'''
            		textEdits += new TextEdit(range, newText)
            		
            	}
            	
            	val workspaceEdit = new WorkspaceEdit() => [
					changes = #{ server.sourceUri -> textEdits }
				]

				server.dispatch(new WorkspaceEditAction => [
					it.workspaceEdit = workspaceEdit
				]);
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