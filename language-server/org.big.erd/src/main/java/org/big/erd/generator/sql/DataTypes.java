package org.big.erd.generator.sql;

import java.util.HashSet;
import java.util.Set;

public class DataTypes {

	public static Set<String> getAllIntegerTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.INTEGER_TYPES);
		types.addAll(MsSqlGenerator.INTEGER_TYPES);
		types.addAll(MySqlGenerator.INTEGER_TYPES);
		types.addAll(PostgresGenerator.INTEGER_TYPES);
		types.addAll(Db2Generator.INTEGER_TYPES);
		return types;
	}

	public static Set<String> getAllFloatTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.FLOAT_TYPES);
		types.addAll(MsSqlGenerator.FLOAT_TYPES);
		types.addAll(MySqlGenerator.FLOAT_TYPES);
		types.addAll(PostgresGenerator.FLOAT_TYPES);
		types.addAll(Db2Generator.FLOAT_TYPES);
		return types;
	}

	public static Set<String> getAllDecimalTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.DECIMAL_TYPES);
		types.addAll(MsSqlGenerator.DECIMAL_TYPES);
		types.addAll(MySqlGenerator.DECIMAL_TYPES);
		types.addAll(PostgresGenerator.DECIMAL_TYPES);
		types.addAll(Db2Generator.DECIMAL_TYPES);
		return types;
	}

	public static Set<String> getAllNumericTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.ALL_NUMERIC_TYPES);
		types.addAll(MsSqlGenerator.ALL_NUMERIC_TYPES);
		types.addAll(MySqlGenerator.ALL_NUMERIC_TYPES);
		types.addAll(PostgresGenerator.ALL_NUMERIC_TYPES);
		types.addAll(Db2Generator.ALL_NUMERIC_TYPES);
		return types;
	}

	public static Set<String> getAllVarcharTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.VARCHAR_TYPES);
		types.addAll(MsSqlGenerator.VARCHAR_TYPES);
		types.addAll(MySqlGenerator.VARCHAR_TYPES);
		types.addAll(PostgresGenerator.VARCHAR_TYPES);
		types.addAll(Db2Generator.VARCHAR_TYPES);
		return types;
	}

	public static Set<String> getAllCharTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.CHAR_TYPES);
		types.addAll(MsSqlGenerator.CHAR_TYPES);
		types.addAll(MySqlGenerator.CHAR_TYPES);
		types.addAll(PostgresGenerator.CHAR_TYPES);
		types.addAll(Db2Generator.CHAR_TYPES);
		return types;
	}

	public static Set<String> getAllCharacterTypes() {
		Set<String> types = new HashSet<>();
		types.add("STRING");
		types.addAll(OracleGenerator.ALL_CHARACTER_TYPES);
		types.addAll(MsSqlGenerator.ALL_CHARACTER_TYPES);
		types.addAll(MySqlGenerator.ALL_CHARACTER_TYPES);
		types.addAll(PostgresGenerator.ALL_CHARACTER_TYPES);
		types.addAll(Db2Generator.ALL_CHARACTER_TYPES);
		return types;
	}

	public static Set<String> getAllDateTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.DATE_TYPES);
		types.addAll(MsSqlGenerator.DATE_TYPES);
		types.addAll(MySqlGenerator.DATE_TYPES);
		types.addAll(PostgresGenerator.DATE_TYPES);
		types.addAll(Db2Generator.DATE_TYPES);
		return types;
	}

	public static Set<String> getAllDateTimeTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.DATE_TIME_TYPES);
		types.addAll(MsSqlGenerator.DATE_TIME_TYPES);
		types.addAll(MySqlGenerator.DATE_TIME_TYPES);
		types.addAll(PostgresGenerator.DATE_TIME_TYPES);
		types.addAll(Db2Generator.DATE_TIME_TYPES);
		return types;
	}

	public static Set<String> getAllTimingTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.ALL_DATE_TYPES);
		types.addAll(MsSqlGenerator.ALL_DATE_TYPES);
		types.addAll(MySqlGenerator.ALL_DATE_TYPES);
		types.addAll(PostgresGenerator.ALL_DATE_TYPES);
		types.addAll(Db2Generator.ALL_DATE_TYPES);
		return types;
	}

	public static Set<String> getAllClobTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.CLOB_TYPES);
		types.addAll(MsSqlGenerator.CLOB_TYPES);
		types.addAll(MySqlGenerator.CLOB_TYPES);
		types.addAll(PostgresGenerator.CLOB_TYPES);
		types.addAll(Db2Generator.CLOB_TYPES);
		return types;
	}

	public static Set<String> getAllBlobTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.BLOB_TYPES);
		types.addAll(MsSqlGenerator.BLOB_TYPES);
		types.addAll(MySqlGenerator.BLOB_TYPES);
		types.addAll(PostgresGenerator.BLOB_TYPES);
		types.addAll(Db2Generator.BLOB_TYPES);
		return types;
	}

	public static Set<String> getAllBinaryTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(OracleGenerator.ALL_BINARY_TYPES);
		types.addAll(MsSqlGenerator.ALL_BINARY_TYPES);
		types.addAll(MySqlGenerator.ALL_BINARY_TYPES);
		types.addAll(PostgresGenerator.ALL_BINARY_TYPES);
		types.addAll(Db2Generator.ALL_BINARY_TYPES);
		return types;
	}

	public static Set<String> getAllBooleanTypes() {
		Set<String> types = new HashSet<>();
		types.addAll(MsSqlGenerator.ALL_BOOLEAN_TYPES);
		types.addAll(MySqlGenerator.ALL_BOOLEAN_TYPES);
		types.addAll(PostgresGenerator.ALL_BOOLEAN_TYPES);
		return types;
	}
}
