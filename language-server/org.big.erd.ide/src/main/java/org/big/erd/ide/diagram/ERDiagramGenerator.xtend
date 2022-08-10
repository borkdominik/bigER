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
import org.eclipse.sprotty.SGraph
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
			LOG.debug("Generating diagram for model with URI '" + context.resource.URI.lastSegment + "'")
			model = contentHead
			toSGraph(model, context)
		}
		return graph
	}

	def void toSGraph(Model m, extension Context context) {
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

		// Create Relationship nodes and edges
		m.relationships.forEach [ r |
			if (notationType !== null) {
				if (notationType.equals(NotationType.CROWSFOOT)) {
					addRelationEdges(r, context)
				} else if (notationType.equals(NotationType.UML)) {
					if (r.third !== null) {
						graph.children.add(relationshipNodes(r, context))
					}
					addRelationEdges(r, context)
				} else {
					graph.children.add(relationshipNodes(r, context))
					addRelationEdges(r, context)
				}
			} else {
				graph.children.add(relationshipNodes(r, context))
				addRelationEdges(r, context)
			}
		]

		LOG.debug("Generated Graph: " + graph)
	}

	def RelationshipNode relationshipNodes(Relationship relationship, extension Context context) {
		val relationshipId = idCache.uniqueId(relationship, relationship.name)
		val node = new RelationshipNode [
			id = relationshipId
			type = NODE_RELATIONSHIP
			weak = relationship.weak ? true : false
			layout = 'vbox'
			children = #[
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

	def void addRelationEdges(Relationship relationship, extension Context context) {
		val notation = model.notation?.notationType !== null ? model.notation.notationType : NotationType.DEFAULT;
		if (relationship.first !== null) {
			var cardinality = getCardinality(relationship.first)
			if (notation.equals(NotationType.CROWSFOOT) || notation.equals(NotationType.UML)) {
				cardinality = combineCardinality(relationship.first, relationship.second)
			}
			val source = idCache.getId(relationship.first.target)
			val target = idCache.getId(
				notation.equals(NotationType.CROWSFOOT) || (notation.equals(NotationType.UML) &&
					relationship.third === null) ? relationship.second.target : relationship
			)
			createEdgeAndAddToGraph(relationship, source, target, 'label:first', cardinality, context)
		}
		if (relationship.second !== null && !notation.equals(NotationType.CROWSFOOT) &&
			!(notation.equals(NotationType.UML) && relationship.third === null)) {
			var cardinality = getCardinality(relationship.second)
			if (notation.equals(NotationType.UML)) {
				cardinality = combineCardinality(relationship.first, relationship.second)
			}
			val source = idCache.getId(relationship)
			val target = idCache.getId(relationship.second.target)
			createEdgeAndAddToGraph(relationship, source, target, 'label:second', cardinality, context)
		}
		if (relationship.third !== null && !notation.equals(NotationType.CROWSFOOT)) {
			var cardinality = getCardinality(relationship.third)
			if (notation.equals(NotationType.UML)) {
				cardinality = combineCardinality(relationship.second, relationship.third)
			}
			val source = idCache.getId(relationship)
			val target = idCache.getId(relationship.third.target)
			createEdgeAndAddToGraph(relationship, source, target, 'label:third', cardinality, context)
		}
	}

	def String combineCardinality(RelationEntity source, RelationEntity target) {
		val firstCardinality = getCardinality(source)
		val secondCardinality = getCardinality(target)
		if (source !== null && target !== null && !firstCardinality.isEmpty && !secondCardinality.isEmpty) {
			return firstCardinality + ":" + secondCardinality
		}
		return "";
	}

	def String getCardinality(RelationEntity relationEntity) {
		switch model.notation?.notationType {
			case NotationType.BACHMAN: return relationEntity.cardinality.toString
			case NotationType.CHEN: return getChenCardinality(relationEntity.cardinality)
			case NotationType.CROWSFOOT: return getCrowsFootsCardinality(relationEntity.cardinality)
			case NotationType.UML: return relationEntity.uml ?: relationEntity.cardinality.toString()
			case NotationType.DEFAULT: return getDefaultCardinality(relationEntity)
			default: return getDefaultCardinality(relationEntity)
		}
	}

	def String getDefaultCardinality(RelationEntity relationEntity) {
		if (relationEntity.customMultiplicity !== null) {
			return relationEntity.customMultiplicity
		} else if (relationEntity.minMax !== null) {
			return relationEntity.minMax
		} else if (relationEntity.cardinality !== null) {
			if (relationEntity.cardinality === CardinalityType.NONE) {
				return " ";
			}
			return relationEntity.cardinality.toString();
		}
		return " ";
	}

	def String getChenCardinality(CardinalityType cardinality) {
		if (cardinality === null || cardinality === CardinalityType.ZERO ||
			cardinality === CardinalityType.ZERO_OR_MORE || cardinality === CardinalityType.ONE_OR_MORE ||
			cardinality === CardinalityType.ZERO_OR_ONE) {
			return "";
		} else {
			return cardinality.toString;
		}
	}

	def String getCrowsFootsCardinality(CardinalityType cardinality) {
		if (cardinality === null || cardinality === CardinalityType.ZERO || cardinality === CardinalityType.MANY ||
			cardinality === CardinalityType.MANY_CHEN) {
			return "";
		} else {
			return cardinality.toString;
		}
	}

	def void createEdgeAndAddToGraph(Relationship relationship, String source, String target, String label,
		String cardinality, extension Context context) {
		var labelText = '';
		var combinedLabels = '';
		val notationType = model.notation?.notationType
		val notation = model.notation?.notationType !== null ? model.notation.notationType : NotationType.DEFAULT;

		if (notation.equals(NotationType.CROWSFOOT)) {
			combinedLabels = cardinality

		} else if (notation.equals(NotationType.UML)) {
			labelText = relationship.name
			combinedLabels = cardinality

		} else {
			labelText = cardinality
		}
		// must be final for lambda expression
		val edgeLabelTextFinal = labelText
		val combinedLabelsFinal = combinedLabels

		graph.children.add(new NotationEdge [
			sourceId = source
			targetId = target
			notation = notationType !== null ? notationType.toString : 'default'
			relationshipCardinality = combinedLabelsFinal
			showRelationship = relationship.third !== null
			isSource = label === "label:first"
			id = idCache.uniqueId(relationship + sourceId + ':' + relationship.name + ':' + targetId)
			children = #[new SLabel [
				id = idCache.uniqueId(relationship + label)
				text = edgeLabelTextFinal
				type = EDGE_LABEL
			]]
		])
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
