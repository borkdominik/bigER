package org.big.erd.ide.diagram

import com.google.inject.Inject
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.EntityRelationshipPackage
import org.big.erd.entityRelationship.Relationship
import org.big.erd.entityRelationship.Model
import org.big.erd.ide.diagram.EntityNode
import org.big.erd.ide.diagram.ERModel
import org.eclipse.emf.ecore.EObject
import org.eclipse.sprotty.SEdge
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.SGraph
import org.eclipse.sprotty.SButton
import org.eclipse.sprotty.LayoutOptions
import org.eclipse.sprotty.SLabel
import org.eclipse.sprotty.SNode
import java.util.ArrayList
import java.util.List
import org.eclipse.sprotty.xtext.IDiagramGenerator
import org.apache.log4j.Logger
import org.eclipse.sprotty.IDiagramState
import org.eclipse.sprotty.xtext.tracing.ITraceProvider
import org.eclipse.sprotty.xtext.SIssueMarkerDecorator
import org.eclipse.sprotty.SCompartment

import static org.big.erd.entityRelationship.EntityRelationshipPackage.Literals.*


class ERDiagramGenerator implements IDiagramGenerator {
    
    static val LOG = Logger.getLogger(ERDiagramGenerator)
    
	@Inject extension ITraceProvider
	@Inject extension SIssueMarkerDecorator
	
	// Types for the elements
	static val GRAPH = 'graph'
	static val NODE_ENTITY = 'node:entity'
	static val NODE_RELATIONSHIP = 'node:relationship'
	static val COMP_ENTITY_HEADER = 'comp:entity-header'
	static val ENTITY_LABEL = 'label:header'
	static val COMP_ATTRIBUTES = 'comp:attributes'
	static val COMP_ATTRIBUTE_ROW = 'comp:attribute-row'
	static val ATTRIBUTE_LABEL_TEXT = 'label:text'
	static val EDGE_LABEL = 'label:top'
	static val EDGE_INHERITANCE = 'edge:inheritance'
	static val BUTTON_EXPAND = 'button:expand'
	
	IDiagramState state
	Model model
	SGraph graph
	List<Entity> extendedEntities
	
	
	override generate(Context context) {
		this.state = context.state
		val contentHead = context.resource.contents.head
		if (contentHead instanceof Model) {
			LOG.info("Generating diagram for model with URI '" + context.resource.URI.lastSegment + "'")
			model = contentHead
			toSGraph(model, context)
		}
		return graph
	}
	

    def void toSGraph(Model m, extension Context context) {
		val genOption = m.generateOption?.generateOptionType
		graph = new ERModel => [
			type = GRAPH
			id = idCache.uniqueId(m, 'root')
			name = m.name
			generateType = genOption !== null ? genOption.toString : 'off'
			children = new ArrayList<SModelElement>
		]
		graph.traceAndMark(m, context)
		
		// Create Entity nodes and inheritance edges
		extendedEntities = new ArrayList<Entity>
		graph.children.addAll(m.entities.map[toSNode(context)])
		graph.children.addAll(extendedEntities.map[inheritanceEdges(context)])
		
		// Create Relationship nodes and edges
		m.relationships.forEach[ r |
			graph.children.add(relationshipNodes(r, context))
			addRelationEdges(r, context)
		]
	}
	

	def RelationshipNode relationshipNodes(Relationship relationship, extension Context context) {
		val relationshipId = idCache.uniqueId(relationship, relationship.name)
		val node = new RelationshipNode [
			id = relationshipId
			type = NODE_RELATIONSHIP
			weak = relationship.weak ? true : false
			layout = 'vbox'
			children =  #[ 
				(new SLabel [
					id = idCache.uniqueId(relationshipId + '.label')
					text = relationship.name
					type = 'label:relationship'
				]).trace(relationship, RELATIONSHIP__NAME, -1)
			]
		]
		node.layoutOptions = new LayoutOptions [
			paddingFactor = 2.0
		]
		
		node.traceAndMark(relationship, context)
		return node
	}
	
	
	// TODO: Refactor method (duplicate code)
	def void addRelationEdges(Relationship relationship, extension Context context) { 
		if (relationship.first !== null) {
			val edge = new SEdge [
				sourceId = idCache.getId(relationship.first.target)
				targetId = idCache.getId(relationship)
				val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
				id = theId
				children = #[
					new SLabel [
						id = idCache.uniqueId(relationship + 'label:first')
						text = relationship.first.customMultiplicity ?: relationship.first.cardinality.toString()
						type = EDGE_LABEL
					]
				]
			]
			graph.children.add(edge)	
		}
		if (relationship.second !== null) {
			val edge = new SEdge [
				sourceId = idCache.getId(relationship)
				targetId = idCache.getId(relationship.second.target)
				val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
				id = theId
				children = #[
					new SLabel [
						id = idCache.uniqueId(relationship + 'label:second')
						text = relationship.second.customMultiplicity ?: relationship.second.cardinality.toString()
						type = EDGE_LABEL
					]
				]
			]
			graph.children.add(edge)	
		}
		if (relationship.third !== null) {
			val edge = new SEdge [
				sourceId = idCache.getId(relationship)
				targetId = idCache.getId(relationship.third.target)
				val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
				id = theId
				children =  #[
					new SLabel [
						id = idCache.uniqueId(relationship + 'label:third')
						text = relationship.third.customMultiplicity ?: relationship.third.cardinality.toString()
						type = EDGE_LABEL
					]
				]
			]
			graph.children.add(edge)	
		}
	}
	

    def EntityNode toSNode(Entity e, extension Context context) {
		if(e.extends !== null)
			this.extendedEntities.add(e)
		
		val entityId = idCache.uniqueId(e, e.name)
		val node = new EntityNode [
			id = entityId
			type = NODE_ENTITY
			weak = e.weak ? true : false
			layout = 'vbox'
			layoutOptions = new LayoutOptions [ 
				VGap = 10.0
			]
			children = new ArrayList<SModelElement>
		]
		
		// Header with label and collapse/expand button
		val headerComp = new SCompartment => [
			id = idCache.uniqueId(entityId + '.header-comp')
			type = COMP_ENTITY_HEADER
			layout = 'hbox'
			children = #[
				(new SLabel [
					id = idCache.uniqueId(entityId + '.label')
					type = ENTITY_LABEL
					text = e.name
				]).trace(e, EntityRelationshipPackage.Literals.ENTITY__NAME, -1),
				(new SButton [
					id = idCache.uniqueId(entityId + '.button')
					type = BUTTON_EXPAND
				])
			] 
		]
		node.children.add(headerComp)	
		
		// Create attributes if element is expanded
		if (state.expandedElements.contains(entityId) || state.currentModel.type == 'NONE') {
			val comp = new SCompartment => [
				id = entityId + '.attributes'
				type = COMP_ATTRIBUTES
				layout = 'vbox'
				layoutOptions = new LayoutOptions [
					HAlign = 'left'
					VGap = 1.0
				]
				children = new ArrayList<SModelElement>
			] 
			comp.children.addAll(e.attributes.map[createAttributeLabels(entityId, context)])
			node.children.add(comp)
			state.expandedElements.add(entityId)
			node.expanded = true
		} else {
			node.expanded = false
		}
		node.traceAndMark(e, context)
		return node
	}
	
	
	def SCompartment createAttributeLabels(Attribute a, String entityId, extension Context context) {
		val attributeId = idCache.uniqueId(a, entityId + '.' + a.name)
		val labelType = switch a.type {
						case AttributeType.KEY : 'label:key'
						case AttributeType.PARTIAL_KEY : 'label:partial-key'
						case AttributeType.MULTIVALUED : 'label:text'
						case AttributeType.DERIVED : 'label:derived'
						default: 'label:text'
		}
		val comp = new SCompartment => [
			id = attributeId
			type = COMP_ATTRIBUTE_ROW
			layout = 'hbox'
			layoutOptions = new LayoutOptions [
				VAlign = 'middle'
				HGap = 5.0
			]
			children = #[
				(new SLabel [ 
					id = attributeId + '.name'
					text = a.name
					type = labelType
				]).trace(a, EntityRelationshipPackage.Literals.ATTRIBUTE__NAME, -1),
				(new SLabel [ 
					id = attributeId + ".datatype"
					text = attributeDatatypeString(a)
					type =labelType
				])
			]
		]
		comp.traceAndMark(a, context)
		return comp
	}
	
	def SEdge inheritanceEdges(Entity entity, extension Context context) {
		val edge = new SEdge [
			sourceId = idCache.getId(entity)
			targetId = idCache.getId(entity.extends)
			val theId = idCache.uniqueId(entity + sourceId + ':extends:' + targetId)
			id = theId
			type = EDGE_INHERITANCE
			children = new ArrayList<SModelElement>
		]	
		return edge
	}
	
	def String attributeDatatypeString(Attribute a) {
		if (a.datatype !== null) {
			if (a.datatype.size != 0) {
				return a.datatype.type + '(' + a.datatype.size + ')'
			} 
			return a.datatype.type
		}
		return ' '
	}
	
	def <T extends SModelElement> T traceAndMark(T sElement, EObject element, Context context) {
		return sElement.trace(element).addIssueMarkers(element, context) 
	}

}