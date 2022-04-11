package org.big.erd.ide.diagram

import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import org.eclipse.sprotty.HtmlRoot
import org.eclipse.sprotty.IDiagramServer
import org.eclipse.sprotty.IPopupModelFactory
import org.eclipse.sprotty.PreRenderedElement
import org.eclipse.sprotty.RequestPopupModelAction
import org.eclipse.sprotty.SIssueMarker
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.xtext.ILanguageAwareDiagramServer
import org.eclipse.sprotty.xtext.tracing.ITraceProvider
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.Relationship
import java.util.ArrayList

class PopupModelFactory implements IPopupModelFactory {

	@Inject extension ITraceProvider
	
	override createPopupModel(SModelElement element, RequestPopupModelAction request, IDiagramServer server) {
		switch element {
			SIssueMarker: {
				val popupId = element.id + '-popup'
				new HtmlRoot [
					id = popupId
					children = #[
						new PreRenderedElement [
							id = popupId + '-body'
							code = '''«getIssueRow(element)»'''
						]
					]
					canvasBounds = request.bounds
				]
			}
			case null:
				null 
 			default: {
				val future = element.withSource(server as ILanguageAwareDiagramServer) [ semanticElement, context |
					semanticElement?.createPopup(element, request) ?: null
				]
				future.get
			} 
		}
	}
	
	protected def CharSequence getIssueRow(SIssueMarker element) {
		'''
		<div class="sprotty-infoBlock">
			<div class="sprotty-infoRow">
				«FOR issue: element.issues»
					<div class="sprotty-infoText">
						<i class="fa «issue.severity.iconClass» sprotty-«issue.severity»" />«issue.message»
					</div>
				«ENDFOR»
			</div>
		</div>
		'''
	}
	
	
	
	protected def getIconClass(String severity) {
		switch severity {
			case 'error', 
			case 'warning': 'fa-exclamation-circle'
			case 'info': 'fa-info-circle'
		}
	}

	protected def createPopup(EObject semanticElement, SModelElement element, RequestPopupModelAction request) {
		val popupId = element.id + '-popup'
		val issueMarker = element.children?.filter(SIssueMarker)?.head
		var htmlRoot = new HtmlRoot [
			id = popupId
			children = #[
				new PreRenderedElement [
					id = popupId + '-body'
					children = new ArrayList<SModelElement>
					code = '''
					<div class="sprotty-infoBlock">
					«IF issueMarker !== null»
						«getIssueRow(issueMarker)»
					«ENDIF»
					«getHeader(semanticElement)»
					</div>
					'''
				],
				new PopupButton [
					id = popupId + '-editButton'
					type = 'button:edit'
					target = element.id + '.label'
					kind = 'edit'
					code = '''
					<vscode-button class="popup-edit-button" appearance="secondary">
						Rename
						<span slot="start" class="codicon codicon-edit"></span>
					</vscode-button>
					'''
				],
				new PopupButton [
					id = popupId + '-deleteButton'
					type = 'button:delete'
					target = element.id
					kind = 'delete'
					code = '''
					<vscode-button class="popup-delete-button" appearance="secondary">
						Delete
						<span slot="start" class="codicon codicon-trash"></span>
					</vscode-button>
					'''
				]
			]
			canvasBounds = request.bounds
		]
		
		return htmlRoot
	}
	
	protected def String getHeader(EObject semanticElement) {
		'''
		<div class="popup-header">
			«IF semanticElement instanceof Entity»
			<div class="popup-element-info">
				<vscode-tag class="popup-tag">Entity</vscode-tag>«semanticElement.name»
			</div>
			«ENDIF»
			«IF semanticElement instanceof Relationship»
			<div class="popup-element-info">
				<vscode-tag class="popup-tag">Relationship</vscode-tag>«semanticElement.name»
			</div>
			«IF !semanticElement.attributes.empty»
			<div class="popup-attributes">
				«FOR attribute: semanticElement.attributes»
				<div class="popup-attribute-info">«attribute.name»</div>
			«ENDFOR»
			</div>
			«ENDIF»
			«ENDIF»
		</div>
		'''
	}
}