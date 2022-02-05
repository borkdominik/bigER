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
import org.eclipse.xtext.naming.IQualifiedNameConverter
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.Relationship

class ERDiagramPopup implements IPopupModelFactory {

	@Inject extension ITraceProvider
	
	@Inject extension IQualifiedNameProvider
	@Inject IQualifiedNameConverter qualifiedNameConverter
	
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
	
	protected def CharSequence getIssueRow(SIssueMarker element) '''
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
	
	
	protected def getIconClass(String severity) {
		switch severity {
			case 'error', 
			case 'warning': 'fa-exclamation-circle'
			case 'info': 'fa-info-circle'
		}
	}

	protected def createPopup(EObject semanticElement, SModelElement element, RequestPopupModelAction request) {
		val popupId = element.id + '-popup'
		val title = getTitle(semanticElement)
		val issueMarker = element.children?.filter(SIssueMarker)?.head
		//val attributes = element.children?.filter(Attribute)
		//val docs = semanticElement.documentation
		if (title === null && issueMarker === null)
			return null
		new HtmlRoot [
			id = popupId
			children = #[
				new PreRenderedElement [
					id = popupId + '-body'
					code = '''
						<div class="sprotty-infoBlock">
							«IF issueMarker !== null»
								«getIssueRow(issueMarker)»
							«ENDIF»
							«IF title !== null»
								<div class="sprotty-infoRow">
									<div class="sprotty-infoTitle">«title»</div>
								</div>
							«ENDIF»
							«IF semanticElement instanceof Entity»
								«FOR attribute: semanticElement.attributes»
									<div class="sprotty-infoRow">
										<div class="sprotty-infoText">«attribute.name»</div>
									</div>
								«ENDFOR»
							«ENDIF»
							«IF semanticElement instanceof Relationship»
								«FOR attribute: semanticElement.attributes»
									<div class="sprotty-infoRow">
										<div class="sprotty-infoText">«attribute.name»</div>
									</div>
								«ENDFOR»
							«ENDIF»
						</div>
					'''
				]
			]
			canvasBounds = request.bounds
		]
	}

	/*
	protected def createPopup(Entity entity, SModelElement element, RequestPopupModelAction request) {
		val title = getTitle(semanticElement)
		val attributes = entity.attributes

	}
	*/
	
	protected def String getTitle(EObject semanticElement) {
		if(semanticElement instanceof Entity) {
			return semanticElement.eClass.name + ' - ' + semanticElement.name
		} else if (semanticElement instanceof Relationship) {
			return semanticElement.eClass.name + ' - ' + semanticElement.name
		}
		
		return ' '
	}
	
	protected def String getDisplayName(EObject semanticElement) {
		val qualifiedName = semanticElement.fullyQualifiedName
		if (qualifiedName !== null)
			qualifiedNameConverter.toString(qualifiedName) 
		else 
		 	'<unnamed>'
	}
}