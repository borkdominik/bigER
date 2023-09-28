package org.big.erd.generator.sql;

public class ChenSqlImport extends SqlImport {

	protected String getNotation() {
		return "chen";
	}

	protected String getCardinality(boolean isMandatory, boolean isSingle, int countMultiple) {
		return isSingle ? "1" : "N";
		// TODO: use different characters -> currently not supported by the validator
		// return isSingle ? "1" : ("" + (char)(Integer.max('A', 'N' - countMultiple)));
	}

}
