package org.big.erd.generator.sql;

import org.big.erd.entityRelationship.DataType;

/**
 * Generates SQL for PostgreSQL from the ER model.
 */
public class PostgresGenerator extends SqlGenerator {
	
	@Override
	protected String getDataType(DataType dataType) {
		String type = super.getDataType(dataType);
		if ("DOUBLE".equalsIgnoreCase(type)) {
			return "DOUBLE PRECISION";
		}
		return type;
	}
}
