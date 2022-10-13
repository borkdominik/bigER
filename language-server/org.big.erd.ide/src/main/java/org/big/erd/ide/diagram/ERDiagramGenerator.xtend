package org.big.erd.ide.diagram

import com.google.inject.Inject
import org.big.erd.entityRelationship.Entity
import org.big.erd.entityRelationship.Attribute
import org.big.erd.entityRelationship.AttributeType
import org.big.erd.entityRelationship.EntityRelationshipPackage
import org.big.erd.entityRelationship.Relationship
import org.big.erd.entityRelationship.RelationEntity
import org.big.erd.entityRelationship.Model
import org.big.erd.ide.diagram.EntityNode
import org.big.erd.ide.diagram.NotationEdge
import org.big.erd.ide.diagram.ERModel
import org.eclipse.emf.ecore.EObject
import org.eclipse.sprotty.SEdge
import org.eclipse.sprotty.SModelElement
import org.eclipse.sprotty.SButton
import org.eclipse.sprotty.LayoutOptions
import org.eclipse.sprotty.SLabel
import java.util.ArrayList
import java.util.List
import org.eclipse.sprotty.xtext.IDiagramGenerator
import org.apache.log4j.Logger
import org.eclipse.sprotty.IDiagramState
import org.eclipse.sprotty.xtext.tracing.ITraceProvider
import org.eclipse.sprotty.xtext.SIssueMarkerDecorator
import org.eclipse.sprotty.SCompartment
import org.big.erd.entityRelationship.CardinalityType
import org.big.erd.entityRelationship.NotationType

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
	static val EDGE_LABEL_TOP = 'label:top'
	static val EDGE_LABEL_BOTTOM = 'label:bottom'
	static val EDGE_INHERITANCE = 'edge:inheritance'
	static val BUTTON_EXPAND = 'button:expand'

	IDiagramState state
	Model model
	ERModel graph
	List<Entity> extendedEntities

	override generate(Context context) {
		this.state = context.state
		val contentHead = context.resource.contents.head
		if (contentHead instanceof Model) {
			LOG.debug("Generating diagram for model with URI '" + context.resource.URI.lastSegment + "'")
			model = contentHead
			toSGraph(contentHead, context)
		}
	}

	def ERModel toSGraph(Model m, extension Context context) {
		val genOption = m.generateOption?.generateOptionType
		val notationType = m.notation?.notationType
		graph = new ERModel => [
			id = idCache.uniqueId(m, 'root')
			type = GRAPH
			name = m.name
			notation = notationType !== null ? notationType.toString : 'default'
			generateType = genOption !== null ? genOption.toString : 'off'
			children = new ArrayList<SModelElement>
		]
		graph.traceAndMark(m, context)

		// Create Entity nodes and inheritance edges
		extendedEntities = new ArrayList<Entity>
		graph.children.addAll(m.entities.map[toSNode(context)])
		graph.children.addAll(extendedEntities.map[inheritanceEdges(context)])
		
		m.relationships.forEach[
				graph.children.add(relationshipNodes(it, context))
				addRelationEdges(it, context)
		]
		return graph;
		
		
	}

	def RelationshipNode relationshipNodes(Relationship relationship, extension Context context) {
		val relationshipId = idCache.uniqueId(relationship, relationship.name)
		val node = new RelationshipNode [
			id = relationshipId
			type = NODE_RELATIONSHIP
			weak = relationship.weak ? true : false
			layout = 'vbox'
			layoutOptions = new LayoutOptions [
				paddingFactor = 2.0
			]
			children = #[
				(new SLabel [
					id = idCache.uniqueId(relationshipId + '.label')
					text = relationship.name
					type = 'label:relationship'
				]).trace(relationship, RELATIONSHIP__NAME, -1)
			]
		]
		node.traceAndMark(relationship, context)
		return node
	}
	
	def void addRelationEdges(Relationship relationship, extension Context context) {
		if (relationship.first !== null) {
			val cardinality = getCardinality(relationship.first)
			val source = idCache.getId(relationship.first.target)
			val target = idCache.getId(relationship)
			createEdgeAndAddToGraph(relationship.first, source, target, 'label:first', cardinality, context)
		}
		if (relationship.second !== null) {
			val cardinality = getCardinality(relationship.second)
			val source = idCache.getId(relationship)
			val target = idCache.getId(relationship.second.target)
			createEdgeAndAddToGraph(relationship.second, source, target, 'label:second', cardinality, context)
		}
		if (relationship.third !== null) {
			val cardinality = getCardinality(relationship.third)
			val source = idCache.getId(relationship)
			val target = idCache.getId(relationship.third.target)
			createEdgeAndAddToGraph(relationship.third, source, target, 'label:third', cardinality, context)
		}
	}

	def String getCardinality(RelationEntity relationEntity) {
		if (relationEntity.cardinality !== null && !(relationEntity.cardinality.equals(CardinalityType.NONE))) {
			return relationEntity.cardinality.toString
		}
		return " ";
	}

	def void createEdgeAndAddToGraph(RelationEntity relationEntity, String source, String target, String label, String cardinality, extension Context context) {
		val notationType = model.notation?.notationType ?: NotationType.DEFAULT
		val relationship = relationEntity.eContainer() as Relationship;
		val edgeId = idCache.uniqueId(relationEntity, source + ":" + relationship.name + ":" + target)
		val edge = new NotationEdge [
			sourceId = source
			targetId = target
			notation = notationType.toString
			connectivity = cardinality
			isSource = label === "label:first"
			type = getEdgeType(relationEntity, notationType)
			id = edgeId
			children = #[
				(new SLabel [
					id = idCache.uniqueId(edgeId + '.label')
					text = getEdgeLabelText(notationType, cardinality)
					type = EDGE_LABEL_TOP
				]).trace(relationEntity, RELATION_ENTITY__CARDINALITY, -1),
				(new SLabel [
					id = idCache.uniqueId(edgeId + '.roleLabel')
					text = getRoleLabelText(relationEntity)
					type = EDGE_LABEL_BOTTOM
				]).trace(relationEntity, RELATION_ENTITY__ROLE, -1)
			]
		]
		edge.traceAndMark(relationEntity, context)
		graph.children.add(edge)
	}
	
	def getEdgeType(RelationEntity relation, NotationType notation) {
		if (notation.equals(NotationType.CHEN)) {
			val cardinality = relation.cardinality ?: CardinalityType.NONE
			if (cardinality === CardinalityType.ZERO_OR_ONE || cardinality === CardinalityType.ZERO_OR_MORE) {
				return 'edge:partial'
			}
		}
		return 'edge'
	}
	
	def String getEdgeLabelText(NotationType notation, String cardinality) {
		if (notation.equals(NotationType.CROWSFOOT) || notation.equals(NotationType.BACHMAN)) {
			return ' '
		}
		return cardinality
	}
	
	def String getRoleLabelText(RelationEntity relation) {
		if (relation.role !== null) {
			return relation.role
		} 
		return ' '
	}

	def EntityNode toSNode(Entity e, extension Context context) {
		if (e.extends !== null)
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
			case AttributeType.KEY: 'label:key'
			case AttributeType.PARTIAL_KEY: 'label:partial-key'
			case AttributeType.MULTIVALUED: 'label:text'
			case AttributeType.DERIVED: 'label:derived'
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
					type = labelType
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
