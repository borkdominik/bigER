package org.big.erd.ide.diagram

import com.google.inject.Inject
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.Relationship
import org.big.erd.entityRelationship.Model
import org.big.erd.ide.diagram.EntityNode
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
import org.big.erd.entityRelationship.EntityRelationshipPackage
import org.big.erd.entityRelationship.NotationOption

class ERDiagramGenerator implements IDiagramGenerator {
    
    static val LOG = Logger.getLogger(ERDiagramGenerator)
    
	@Inject extension ITraceProvider
	@Inject extension SIssueMarkerDecorator
	
	// Types for the elements
	static val ENTITY = 'node'
	static val ENTITY_WEAK = 'node:weak'
	static val ENTITY_HEADER = 'comp:header'
	static val ENTITY_LABEL = 'label:header'
	static val ATTRIBUTES_TYPE = 'comp:comp'
	static val BUTTON_EXPAND = 'button:expand'

	IDiagramState state
	Model model
	
	
	List<Entity> extendedEntities
	List<Relationship> ternaryRelationships
	
	// Starts the generating process
	override generate(Context context) {
		this.state = context.state
		val contentHead = context.resource.contents.head
		if (contentHead instanceof Model) {
			LOG.info("Starting diagram generator for '" + context.resource.URI.lastSegment + "'")
			switch contentHead.notationOption {
				case NotationOption.DEFAULT,
				default: 
					return (contentHead).toSGraph(context)
			}
			
		}
		return null;
	}

    def toSGraph(Model m, extension Context context) {
		val graph = new SGraph => [
			type = 'graph'
			id = idCache.uniqueId(m, 'root')
			children = new ArrayList<SModelElement>
		]
		
		
		
		// store all entitites that extend another one
		this.extendedEntities = new ArrayList<Entity>
		this.ternaryRelationships = new ArrayList<Relationship>

		// Entity Nodes
		graph.children.addAll(m.entities.map[toSNode(context)])

		// Map to Entities and Diamond Nodes (Left & Right)
		for(Relationship r : m.relationships) {
			// Relationship Diamond Nodes
			graph.children.add(relationshipNodes(r, context))
			if(r.first !== null) {
				graph.children.add(relationshipEdgesLeft(r,context))
			}
			if(r.second !== null) {
				graph.children.add(relationshipEdgesRight(r,context))
			}
		}

		for(Relationship re : this.ternaryRelationships) {
			graph.children.add(ternaryEdges(re, context))
		}

		for(Entity e : this.extendedEntities) {
			graph.children.add(inheritanceEdges(e, context))
		}
		graph.traceAndMark(m, context)

		return graph

	}

	def SEdge relationshipEdgesLeft(Relationship relationship, extension Context context) {
		
		val sourceEdge = new SEdge [
			sourceId = idCache.getId(relationship.first.target)
			targetId = idCache.getId(relationship)
			val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
			id = theId
			children =  new ArrayList<SModelElement>
		]
		val label = new SLabel [
			id = idCache.uniqueId(relationship + 'label:left')
			text = relationship.first.customMultiplicity ?: relationship.first.cardinality.toString()
			type = 'label:top'
		]

		sourceEdge.children.add(label)

		return sourceEdge
	}

	def SEdge relationshipEdgesRight(Relationship relationship, extension Context context) {
		
		val targetEdge = new SEdge [
			sourceId = idCache.getId(relationship)
			targetId = idCache.getId(relationship.second.target)
			val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
			id = theId
			children =  new ArrayList<SModelElement>
		]
		val label = new SLabel [
			id = idCache.uniqueId(relationship + 'label:right')
			text = relationship.second.customMultiplicity ?: relationship.second.cardinality.toString()
			type = 'label:top'
		]
		targetEdge.children.add(label)

		return targetEdge
	}

	def SEdge ternaryEdges(Relationship relationship, extension Context context){
		val targetEdge = new SEdge [
			sourceId = idCache.getId(relationship)
			targetId = idCache.getId(relationship.third.target)
			val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
			id = theId
			children =  new ArrayList<SModelElement>
		]
		val label = new SLabel [
			id = idCache.uniqueId(relationship + 'label:third')
			text = relationship.third.customMultiplicity ?: relationship.third.cardinality.toString()
			type = 'label:top'
		]
		targetEdge.children.add(label)

		return targetEdge
	}

	
	def SNode relationshipNodes(Relationship relationship, extension Context context) {
		val identifier = relationship.name
		val relationshipId = idCache.uniqueId(relationship, identifier)

		val node = new SNode [
			id = relationshipId
			type = relationship.weak? 'node:weak-relationship': 'node:relationship'
			layout = 'vbox'
			children =  new ArrayList<SModelElement>	
		]

		val label = new SLabel [
			id = idCache.uniqueId(relationshipId + '.label')
			text = relationship.name
			type = 'label:relationship'
		]
		label.trace(relationship, RELATIONSHIP__NAME, -1)
		node.children.add(label)
		
		node.layoutOptions = new LayoutOptions [
			paddingFactor = 2.0
		]
		if(relationship.third !== null) {
			this.ternaryRelationships.add(relationship)
		}
		node.traceAndMark(relationship, context)
		return node
	}
	

    def EntityNode toSNode(Entity e, extension Context context) {
		if(e.extends !== null) {
			this.extendedEntities.add(e)
		}
		
		val entityId = idCache.uniqueId(e, e.name)
		val node = new EntityNode [
			id = entityId
			type = e.weak ? ENTITY_WEAK : ENTITY
			layout = 'vbox'
			layoutOptions = new LayoutOptions [
				VGap = 10.0
			]
			children = new ArrayList<SModelElement>
		].traceAndMark(e, context)
		
		val headerComp = new SCompartment [
			id = idCache.uniqueId(entityId + '.header-comp')
			type = ENTITY_HEADER
			layout = 'hbox'
			children = #[
				(new SLabel [
					id = idCache.uniqueId(entityId + '.label')
					type = ENTITY_LABEL
					text = e.name
				]).trace(e, EntityRelationshipPackage.Literals.ENTITY__NAME, -1),
				new SButton [
					id = idCache.uniqueId(entityId + '.button')
					type = BUTTON_EXPAND
				]
			] 
		]
		node.children.add(headerComp)
		
		if (state.expandedElements.contains(entityId) || state.currentModel.type == 'NONE') {
			val comp = new SCompartment [
				id = entityId + '.attributes'
				type = ATTRIBUTES_TYPE
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
		
		return node
	}
	
	def SCompartment createAttributeLabels(Attribute a, String entityId, extension Context context) {
		val attributeId = idCache.uniqueId(a, entityId + '.' + a.name)
		val comp = new SCompartment [
			id = attributeId
			type = 'comp:attributes'
			layout = 'hbox'
			layoutOptions = new LayoutOptions [
				VAlign = 'left'
				HGap = 5.0
			]
			children = new ArrayList<SModelElement>
		]
		comp.traceAndMark(a, context)
		// TODO: Too many lines of code
		val type = new SLabel [ 
			id = attributeId + '.type'
			text = switch a.type {
				case AttributeType.KEY : 'KEY'
				case AttributeType.FOREIGN_KEY : 'FK'
				case AttributeType.PARTIAL_KEY : 'PK'
				case AttributeType.MULTIVALUED : '[ ]'
				case AttributeType.DERIVED : '->'
				case AttributeType.OPTIONAL : 'NULL'
				default: '-'
			}
			type = switch a.type {
				case AttributeType.KEY : 'label:text-key'
				case AttributeType.FOREIGN_KEY : 'label:text-fk'
				case AttributeType.PARTIAL_KEY : 'label:text-pk'
				case AttributeType.OPTIONAL : 'label:text-null'
				default: 'label:text'
			}
		]
		val name = new SLabel [ 
			id = attributeId + '.name'
			text = a.name
			type = switch a.type {
				case AttributeType.KEY : 'label:text-key'
				case AttributeType.FOREIGN_KEY : 'label:text-fk'
				case AttributeType.PARTIAL_KEY : 'label:text-pk'
				case AttributeType.OPTIONAL : 'label:text-null'
				default: 'label:text'
			}
		].trace(a, ATTRIBUTE__NAME, -1)
		
		val dataType = new SLabel [ 
			id = attributeId + ".datatype"
			text = a.datatype?.type.toString
			type = switch a.type {
				case a.type == AttributeType.KEY : 'label:text-key'
				case a.type == AttributeType.FOREIGN_KEY : 'label:text-fk'
				case a.type == AttributeType.PARTIAL_KEY : 'label:text-pk'
				case a.type == AttributeType.OPTIONAL : 'label:text-null'
				default: 'label:text'
			}
		]
		
		
		comp.children.add(type)
		comp.children.add(name)
		comp.children.add(dataType)
		
		
		return comp
	}
	
	def SEdge inheritanceEdges(Entity entity, extension Context context) {
		val edge = new SEdge [
			sourceId = idCache.getId(entity)
			targetId = idCache.getId(entity.extends)
			val theId = idCache.uniqueId(entity + sourceId + ':extends:' + targetId)
			id = theId
			type = 'edge:inheritance'
			children = new ArrayList<SModelElement>
		]	
		return edge
	}
	
	def <T extends SModelElement> T traceAndMark(T sElement, EObject element, extension Context context) {
		return sElement.trace(element).addIssueMarkers(element, context) 
	}

}