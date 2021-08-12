package org.xtext.example.erd.ide.diagram

import com.google.inject.Inject
import org.xtext.example.erd.entityRelationship.Entity
import org.xtext.example.erd.entityRelationship.Attribute
import org.xtext.example.erd.entityRelationship.Relationship
import org.xtext.example.erd.entityRelationship.DataType
import org.xtext.example.erd.entityRelationship.AttributeType
import org.xtext.example.erd.entityRelationship.Model
import org.xtext.example.erd.ide.diagram.EntityNode
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

import static org.xtext.example.erd.entityRelationship.EntityRelationshipPackage.Literals.*

class ERDiagramGenerator implements IDiagramGenerator {
    
    static val LOG = Logger.getLogger(ERDiagramGenerator)
    
	@Inject extension ITraceProvider
	@Inject extension SIssueMarkerDecorator

	List<Entity> inheritedEntities
	List<Relationship> ternaryRelationships
	IDiagramState state

	override generate(Context context) {
		this.state = context.state
		
		return (context.resource.contents.head as Model).toSGraph(context)
	}

    def toSGraph(Model m, extension Context context) {
		val graph = new SGraph => [
			type = 'graph'
			id = idCache.uniqueId(m, 'root')
			children = new ArrayList<SModelElement>
		]
		// store all entitites that extend another one
		this.inheritedEntities = new ArrayList<Entity>
		this.ternaryRelationships = new ArrayList<Relationship>

		// Entity Nodes
		graph.children.addAll(m.entities.map[toSNode(context)])

		// Map to Entities and Diamond Nodes (Left & Right)
		for(Relationship r : m.relationships) {
			// Relationship Diamond Nodes
			graph.children.add(relationshipNodes(r, context))
			if(r.left !== null) {
				graph.children.add(relationshipEdgesLeft(r,context))
			}
			if(r.right !== null) {
				graph.children.add(relationshipEdgesRight(r,context))
			}
		}

		for(Relationship re : this.ternaryRelationships) {
			graph.children.add(ternaryEdges(re, context))
		}

		for(Entity e : this.inheritedEntities) {
			graph.children.add(inheritanceEdges(e, context))
		}
		graph.traceAndMark(m, context)

		return graph

	}

	def SEdge relationshipEdgesLeft(Relationship relationship, extension Context context) {
		
		val sourceEdge = new SEdge [
			sourceId = idCache.getId(relationship.left.target)
			targetId = idCache.getId(relationship)
			val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
			id = theId
			children =  new ArrayList<SModelElement>
		]
		val label = new SLabel [
			id = idCache.uniqueId(relationship + 'label:left')
			text = relationship.left.customMultiplicity ?: relationship.left.multiplicity.toString()
			type = 'label:top'
		]

		sourceEdge.children.add(label)

		return sourceEdge
	}

	def SEdge relationshipEdgesRight(Relationship relationship, extension Context context) {
		
		val targetEdge = new SEdge [
			sourceId = idCache.getId(relationship)
			targetId = idCache.getId(relationship.right.target)
			val theId = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
			id = theId
			children =  new ArrayList<SModelElement>
		]
		val label = new SLabel [
			id = idCache.uniqueId(relationship + 'label:right')
			text = relationship.right.customMultiplicity ?: relationship.right.multiplicity.toString()
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
			id = idCache.uniqueId(relationship + 'label:right')
			text = relationship.third.customMultiplicity ?: relationship.third.multiplicity.toString()
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
	

    def EntityNode toSNode(Entity entity, extension Context context) {
		val entityId = idCache.uniqueId(entity, entity.name)
		
		val node = new EntityNode => [
			id = entityId
			type = entity.weak? 'node:weak' : 'node'
			layout = 'vbox'
			layoutOptions = new LayoutOptions [
				VGap = 10.0
			]
			children = new ArrayList<SModelElement>
			expanded = false
		]

		val headercomp = new SCompartment [
			id = idCache.getId(entity) + '.header-comp'
			type = 'comp:header'
			layout = 'hbox'
			children = new ArrayList<SModelElement>
		]
		node.children.add(headercomp)
	
		val label = new SLabel [
			id = idCache.uniqueId(entityId + '.label')
			text = entity.name
			type = 'label:header'
		]
		label.trace(entity, ENTITY__NAME, -1)
		headercomp.children.add(label)

		val expandButton = new SButton [
			id = idCache.uniqueId(entityId + '.button')
			type = 'button:expand'
		]
		headercomp.children.add(expandButton)

		if(state.expandedElements.contains(entityId) || 
			state.currentModel.type == 'NONE') {
			val comp = createAttributes(entity, context)
			node.children.add(comp)
			state.expandedElements.add(entityId)
			node.expanded = true
		} 

		// entity extends another entity
		if(entity.extends !== null) {
			this.inheritedEntities.add(entity)
		}
		node.traceAndMark(entity, context)

		return node
	}

	def SCompartment createAttributes(Entity entity, extension Context context) {
		val comp = new SCompartment [
			id = idCache.getId(entity) + '.comp'
			type = 'comp:comp'
			layout = 'vbox'
			layoutOptions = new LayoutOptions [
				HAlign = 'left'
				VGap = 1.0
			]
			children = new ArrayList<SModelElement>
		]

		for(Attribute a : entity.attributes) {		
			val attributeId = idCache.uniqueId(a, entity.name + '.' + a.name)
			val attributecomp = new SCompartment [
				id = idCache.uniqueId(attributeId + '.comp')
				type = 'comp:attributes'
				layout = 'hbox'
				children = new ArrayList<SModelElement>
				layoutOptions = new LayoutOptions [
					VAlign = 'left'
					HGap = 5.0
				]
			]
			attributecomp.children.addAll(attributeLabels(a, context));
			attributecomp.traceAndMark(a, context)
			comp.children.add(attributecomp)
		}
		return comp	
	}

	def List<SLabel> attributeLabels(Attribute a, extension Context context) {
		
		val labels = new ArrayList<SLabel>
		val attributeId = idCache.getId(a)

		val attributeType = new SLabel [ 
			id = attributeId + ".key"
			text = switch a.type {
				case a.type == AttributeType.KEY : 'KEY'
				case a.type == AttributeType.FOREIGN_KEY : 'FK'
				case a.type == AttributeType.PARTIAL_KEY : 'PK'
				case a.type == AttributeType.MULTIVALUED : '[ ]'
				case a.type == AttributeType.DERIVED : '->'
				case a.type == AttributeType.NULLABLE : 'NULL'
				default: '-'
			}
			type = switch a.type {
				case a.type == AttributeType.KEY : 'label:text-key'
				case a.type == AttributeType.FOREIGN_KEY : 'label:text-fk'
				case a.type == AttributeType.PARTIAL_KEY : 'label:text-pk'
				case a.type == AttributeType.NULLABLE : 'label:text-null'
				default: 'label:text'
			}
		]
		
		val attributeName = new SLabel [ 
			id = attributeId + ".name"
			text = a.name
			type = switch a.type {
				case a.type == AttributeType.KEY : 'label:text-key'
				case a.type == AttributeType.FOREIGN_KEY : 'label:text-fk'
				case a.type == AttributeType.PARTIAL_KEY : 'label:text-pk'
				case a.type == AttributeType.NULLABLE : 'label:text-null'
				default: 'label:text'
			}
		]

		val attributeDataType = new SLabel [ 
			id = attributeId + ".type"
			text = a.datatype == DataType.NONE ? "" : a.datatype.toString()
			type = switch a.type {
				case a.type == AttributeType.KEY : 'label:text-key'
				case a.type == AttributeType.FOREIGN_KEY : 'label:text-fk'
				case a.type == AttributeType.PARTIAL_KEY : 'label:text-pk'
				case a.type == AttributeType.NULLABLE : 'label:text-null'
				default: 'label:text'
			}
		]
		labels.add(attributeType)
		labels.add(attributeName)
		labels.add(attributeDataType)
		
		return labels
		
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
	
	def <T extends SModelElement> T traceAndMark(T sElement, EObject element, Context context) {
		sElement.trace(element).addIssueMarkers(element, context) 
	}

}