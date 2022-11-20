package org.big.erd.generator.sql;

import org.big.erd.entityRelationship.DataType;

/**
 * Generates SQL for MS SQL Server from the ER model.
 */
public class MsSqlGenerator extends SqlGenerator {
	
	@Override
	protected String getDataType(DataType dataType) {
		String type = super.getDataType(dataType);
		if ("DOUBLE".equalsIgnoreCase(type)) {
			return "DECIMAL";
		}
		return type;
	}
}
