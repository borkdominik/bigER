package org.big.erd.generator.sql;

public class SqlAttribute {
	
	private String attributeName;
	private String attributeType;
	private String attributeKeywords;
	private String attributeComment;
	
	public boolean isMandatory() {
		return attributeKeywords.toUpperCase().contains("NOT NULL");
	}
	
	public String getAttributeName() {
		return attributeName;
	}
	public void setAttributeName(String attributeName) {
		this.attributeName = attributeName;
	}
	public String getAttributeType() {
		return attributeType;
	}
	public void setAttributeType(String attributeType) {
		this.attributeType = attributeType;
	}
	public String getAttributeComment() {
		return attributeComment;
	}
	public void setAttributeComment(String attributeComment) {
		this.attributeComment = attributeComment;
	}
	public String getAttributeKeywords() {
		return attributeKeywords;
	}
	public void setAttributeKeywords(String attributeKeywords) {
		this.attributeKeywords = attributeKeywords;
	}
}
