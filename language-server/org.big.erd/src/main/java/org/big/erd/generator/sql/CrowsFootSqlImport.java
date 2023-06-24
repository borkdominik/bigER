package org.big.erd.generator.sql;

public class CrowsFootSqlImport extends SqlImport {

	protected String getCardinality(boolean isMandatory, boolean isSingle) {
		if (!isMandatory) {
			if (isSingle) {
				return "?";
			} else {
				return "0+";
			}
		} else {
			if (isSingle) {
				return "1";
			} else {
				return "1+";
			}
		}
	}

}
