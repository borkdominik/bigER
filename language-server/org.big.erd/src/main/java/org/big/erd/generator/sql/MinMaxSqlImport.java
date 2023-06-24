package org.big.erd.generator.sql;

public class MinMaxSqlImport extends SqlImport {

	protected String getCardinality(boolean isMandatory, boolean isSingle) {
		return (isMandatory ? "1" : "0") + "," + (isSingle ? "1" : "*");
	}

}
