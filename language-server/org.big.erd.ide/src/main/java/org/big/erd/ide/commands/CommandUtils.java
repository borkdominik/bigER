package org.big.erd.ide.commands;

public final class CommandUtils {
	
	public static final String IMPORT_SQL_COMMAND = "erdiagram.import.sql";
	public static final String GENERATE_PREFIX = "erdiagram.generate";
	public static final String GENERATE_SQL_COMMAND = GENERATE_PREFIX + ".sql";
	public static final String GENERATE_MONGODB_COMMAND = GENERATE_PREFIX + ".mongodb";
	public static final String GENERATE_NEO4J_COMMAND = GENERATE_PREFIX + ".neo4j";
	public static final String GENERATE_CASSANDRADB_COMMAND = GENERATE_PREFIX + ".cassandradb";
	public static final String GENERATE_POSTGRES_COMMAND = GENERATE_PREFIX + ".postgres";
	public static final String GENERATE_ORACLE_COMMAND = GENERATE_PREFIX + ".oracle";
	public static final String GENERATE_MYSQL_COMMAND = GENERATE_PREFIX + ".mysql";
	public static final String GENERATE_MSSQL_COMMAND = GENERATE_PREFIX + ".mssql";
	public static final String GENERATE_DB2_COMMAND = GENERATE_PREFIX + ".db2";
	
	private CommandUtils() {
		
	}

}
