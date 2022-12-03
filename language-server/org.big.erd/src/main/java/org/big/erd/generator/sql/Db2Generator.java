package org.big.erd.generator.sql;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Generates SQL for DB2 from the ER model.
 */
public class Db2Generator extends SqlGenerator {
	
	public static final List<String> INTEGER_TYPES = Arrays.asList("BIGINT", "INTEGER", "SMALLINT");
	
	public static final List<String> FLOAT_TYPES = Arrays.asList("DOUBLE", "FLOAT", "REAL");
	
	public static final List<String> DECIMAL_TYPES = Arrays.asList("DECIMAL", "NUMERIC");
	
	public static final List<String> ALL_NUMERIC_TYPES = 
			Stream.concat(DECIMAL_TYPES.stream(), Stream.concat(FLOAT_TYPES.stream(), INTEGER_TYPES.stream()))
		    .distinct()
		    .collect(Collectors.toList());
	
	public static final List<String> VARCHAR_TYPES = Arrays.asList("VARCHAR");
	
	public static final List<String> CHAR_TYPES = Arrays.asList("CHAR");
	
	public static final List<String> ALL_CHARACTER_TYPES = 
			Stream.concat(VARCHAR_TYPES.stream(), CHAR_TYPES.stream())
		    .distinct()
		    .collect(Collectors.toList());
	
	public static final List<String> DATE_TYPES = Arrays.asList("DATE");
	
	public static final List<String> DATE_TIME_TYPES = Arrays.asList("TIMESTAMP", "TIME");
	
	public static final List<String> ALL_DATE_TYPES = 
			Stream.concat(DATE_TIME_TYPES.stream(), DATE_TYPES.stream())
		    .distinct()
		    .collect(Collectors.toList());
	
	public static final List<String> BLOB_TYPES = Arrays.asList("BLOB");
	
	public static final List<String> CLOB_TYPES = Arrays.asList("CLOB");
	
	public static final List<String> ALL_BINARY_TYPES = 
			Stream.concat(BLOB_TYPES.stream(), CLOB_TYPES.stream())
		    .distinct()
		    .collect(Collectors.toList());
	
	public static final List<String> ALL_TYPES = 
			Stream.concat(ALL_NUMERIC_TYPES.stream(), Stream.concat(ALL_CHARACTER_TYPES.stream(), Stream.concat(ALL_DATE_TYPES.stream(), ALL_BINARY_TYPES.stream())))
		    .distinct()
		    .collect(Collectors.toList());
	
	@Override
	protected String mapDataType(String type) {
		String upperType = type.toUpperCase();
		if (ALL_TYPES.contains(upperType)) {
			return type;
		}
		
		// numeric types
		if (DataTypes.getAllIntegerTypes().contains(upperType)) {
			return INTEGER_TYPES.get(0);
		}
		if (DataTypes.getAllFloatTypes().contains(upperType)) {
			return FLOAT_TYPES.get(0);
		}
		if (DataTypes.getAllDecimalTypes().contains(upperType)) {
			return DECIMAL_TYPES.get(0);
		}
		if (DataTypes.getAllNumericTypes().contains(upperType)) {
			return ALL_NUMERIC_TYPES.get(0);
		}
		
		// character types
		if (DataTypes.getAllIntegerTypes().contains(upperType)) {
			return VARCHAR_TYPES.get(0);
		}
		if (DataTypes.getAllFloatTypes().contains(upperType)) {
			return CHAR_TYPES.get(0);
		}
		if (DataTypes.getAllNumericTypes().contains(upperType)) {
			return ALL_CHARACTER_TYPES.get(0);
		}
		
		// date types
		if (DataTypes.getAllDateTypes().contains(upperType)) {
			return DATE_TYPES.get(0);
		}
		if (DataTypes.getAllDateTimeTypes().contains(upperType)) {
			return DATE_TIME_TYPES.get(0);
		}
		if (DataTypes.getAllTimingTypes().contains(upperType)) {
			return ALL_DATE_TYPES.get(0);
		}
		
		// binary types
		if (DataTypes.getAllBlobTypes().contains(upperType)) {
			return BLOB_TYPES.get(0);
		}
		if (DataTypes.getAllClobTypes().contains(upperType)) {
			return CLOB_TYPES.get(0);
		}
		if (DataTypes.getAllBinaryTypes().contains(upperType)) {
			return ALL_BINARY_TYPES.get(0);
		}
		
		// boolean types
		if (DataTypes.getAllBooleanTypes().contains(upperType)) {
			return ALL_NUMERIC_TYPES.get(0) + "(1)";
		}
		
		return null;
	}
}
