package org.big.erd.generator.sql;

public class MinMaxSqlImport extends SqlImport {

	protected String getMinimumCardinality(boolean isMandatory) {
		return isMandatory ? "1," : "0,";
	}

	protected String getMaximumCardinality(boolean isSingle) {
		return isSingle ? "1" : "*";
	}

}
