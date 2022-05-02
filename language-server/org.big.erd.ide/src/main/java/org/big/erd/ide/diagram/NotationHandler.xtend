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
import org.apache.log4j.Logger
import org.eclipse.xtext.resource.ILocationInFileProvider
import org.eclipse.lsp4j.Position
import org.eclipse.osgi.internal.location.Locker.MockLocker
import org.big.erd.entityRelationship.NotationType

import org.eclipse.xtext.nodemodel.util.NodeModelUtils
import org.eclipse.emf.ecore.EObject

class NotationHandler {
	
	static val LOG = Logger.getLogger(NotationHandler)
	
	@Inject UriExtensions uriExtensions
	@Inject extension PositionConverter
	@Inject ILocationInFileProvider locationInFileProvider
	
	def handle(ChangeNotationAction action, ILanguageAwareDiagramServer server) {
		
		val root = server.diagramState.currentModel
		val notation = action?.notation
		
		server.diagramLanguageServer.languageServerAccess.doRead(server.sourceUri, [ context |
			
			val rootelem = root.resolveElement(context)
			
			if (rootelem instanceof Model) {
				val textEdits = newArrayList
				var textRegion = locationInFileProvider.getFullTextRegion(rootelem.notation)
        		var startPosition = toPosition(textRegion.offset, rootelem.notation)
        		var endPosition = toPosition(textRegion.offset + textRegion.length, rootelem.notation)
            		
        		var range = new Range(startPosition, endPosition)
        		textEdits += new TextEdit(range, 'notation='+notation)
				
				val workspaceEdit = new WorkspaceEdit() => [changes = #{ server.sourceUri -> textEdits }]
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
	