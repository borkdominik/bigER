package org.big.erd.ide.diagram;

public final class DiagramTypes {
	
	private DiagramTypes() {}
	
	// graph
	public static final String GRAPH = "graph";
	
	// nodes
	public static final String NODE_ENTITY = "node:entity";
	public static final String NODE_RELATIONSHIP = "node:relationship";
	
	// edges
	public static final String EDGE = "edge";
	public static final String EDGE_PARTIAL = "edge:partial";
	public static final String EDGE_INHERITANCE = "edge:inheritance";
	
	// composites
	public static final String COMP_ENTITY_HEADER = "comp:entity-header";
	public static final String COMP_ATTRIBUTES = "comp:attributes";
	public static final String COMP_ATTRIBUTE_ROW = "comp:attribute-row";
	
	// labels
	public static final String ENTITY_LABEL = "label:header";
	public static final String LABEL_TOP = "label:top";
	public static final String LABEL_BOTTOM = "label:bottom";
	public static final String LABEL_KEY = "label:key";
	public static final String LABEL_VISIBILITY = "label:visibility";
	public static final String LABEL_PARTIAL_KEY = "label:partial-key";
	public static final String LABEL_DERIVED = "label:derived";
	public static final String LABEL_TEXT = "label:text";
	public static final String LABEL_BOTTOM_LEFT = "label:bottom-left";
	public static final String LABEL_BOTTOM_RIGHT = "label:bottom-right";
	public static final String LABEL_TOP_LEFT = "label:top-left";
	public static final String LABEL_TOP_RIGHT = "label:top-right";
	
	// other
	public static final String BUTTON_EXPAND = "button:expand";
	public static final String BACHMAN_TYPE = "bachman";
	public static final String CHEN_TYPE = "chen";
	public static final String CROWSFOOT_TYPE = "crowsfoot";
}
