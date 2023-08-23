package org.big.erd.generator.sql;

public class BachmanSqlImport extends SqlImport {

	protected String getNotation() {
		return "bachman";
	}

	protected String getCardinality(boolean isMandatory, boolean isSingle, int countMultiple) {
		return (isMandatory ? "1" : "0") + (isSingle ? "" : "+");
	}

}
