package org.big.erd.generator.sql;

public class MinMaxSqlImport extends SqlImport {

	protected String getNotation() {
		return "minmax";
	}

	protected String getCardinality(boolean isMandatory, boolean isSingle, int countMultiple) {
		return (isMandatory ? "1" : "0") + "," + (isSingle ? "1" : "*");
	}

}
