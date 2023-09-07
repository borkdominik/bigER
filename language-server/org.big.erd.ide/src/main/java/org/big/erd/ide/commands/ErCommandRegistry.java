package org.big.erd.ide.commands;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.big.erd.generator.IErGenerator;
import org.big.erd.generator.nosql.MongoDbGenerator;
import org.big.erd.generator.sql.SqlGenerator;
import org.big.erd.importer.IErImporter;
import org.big.erd.generator.nosql.CassandraDbGenerator;
import org.big.erd.generator.nosql.Neo4jGenerator;
import org.big.erd.generator.sql.PostgresGenerator;
import org.big.erd.generator.sql.Db2Generator;
import org.big.erd.generator.sql.MsSqlGenerator;
import org.big.erd.generator.sql.MySqlGenerator;
import org.big.erd.generator.sql.OracleGenerator;
import org.big.erd.generator.sql.SqlImport;

import static org.big.erd.ide.commands.CommandUtils.*;

public class ErCommandRegistry {
	
	private List<String> commands;
	private Map<String, IErGenerator> generators;
	private Map<String, IErImporter> imports;
	
	public ErCommandRegistry() {
		commands = new ArrayList<>();
		commands.addAll(registerGenerators());
		commands.addAll(registerImports());
	}
	
	private List<String> registerGenerators() {
		generators = new HashMap<>();
		generators.put(GENERATE_SQL_COMMAND, new SqlGenerator());
		generators.put(GENERATE_MONGODB_COMMAND, new MongoDbGenerator());
		generators.put(GENERATE_NEO4J_COMMAND, new Neo4jGenerator());
		generators.put(GENERATE_CASSANDRADB_COMMAND, new CassandraDbGenerator());
		generators.put(GENERATE_POSTGRES_COMMAND, new PostgresGenerator());
		generators.put(GENERATE_ORACLE_COMMAND, new OracleGenerator());
		generators.put(GENERATE_MYSQL_COMMAND, new MySqlGenerator());
		generators.put(GENERATE_MSSQL_COMMAND, new MsSqlGenerator());
		generators.put(GENERATE_DB2_COMMAND, new Db2Generator());
		return new ArrayList<>(generators.keySet());
	}
	
	private List<String> registerImports() {
		imports = new HashMap<>();
		imports.put(IMPORT_SQL_COMMAND, new SqlImport());
		return new ArrayList<>(imports.keySet());
	}
	
	public List<String> getCommands() {
		return commands;
	}
	
	public Map<String, IErGenerator> getGenerators() {
		return generators;
	}
	
	public Map<String, IErImporter> getImports() {
		return imports;
	}
	
}
