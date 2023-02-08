package org.big.erd.ide.commands

import org.eclipse.xtext.ide.server.commands.IExecutableCommandService
import org.eclipse.lsp4j.ExecuteCommandParams
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.util.CancelIndicator
import org.big.erd.util.ErUtils
import com.google.gson.JsonPrimitive
import org.eclipse.xtext.generator.GeneratorContext
import com.google.inject.Inject
import java.util.HashMap
import java.util.Map
import org.big.erd.generator.IErGenerator
import org.big.erd.generator.sql.SqlGenerator
import org.eclipse.xtext.validation.IResourceValidator
import org.eclipse.xtext.validation.CheckMode
import org.big.erd.generator.sql.PostgresGenerator
import org.big.erd.generator.sql.Db2Generator
import org.big.erd.generator.sql.MsSqlGenerator
import org.big.erd.generator.sql.MySqlGenerator
import org.big.erd.generator.sql.OracleGenerator

class ErCommandService implements IExecutableCommandService {
	
	@Inject IResourceValidator resourceValidator
	
	Map<String, IErGenerator> generators
	static final String GENERATE_PREFIX = "erdiagram.generate"
	static final String GENERATE_SQL_COMMAND = GENERATE_PREFIX + ".sql"
	static final String GENERATE_POSTGRES_COMMAND = GENERATE_PREFIX + ".postgres"
	static final String GENERATE_ORACLE_COMMAND = GENERATE_PREFIX + ".oracle"
	static final String GENERATE_MYSQL_COMMAND = GENERATE_PREFIX + ".mysql"
	static final String GENERATE_MSSQL_COMMAND = GENERATE_PREFIX + ".mssql"
	static final String GENERATE_DB2_COMMAND = GENERATE_PREFIX + ".db2"
	
	
	override initialize() {
		generators = new HashMap
		generators.put(GENERATE_SQL_COMMAND, new SqlGenerator)
		generators.put(GENERATE_POSTGRES_COMMAND, new PostgresGenerator)
		generators.put(GENERATE_ORACLE_COMMAND, new OracleGenerator)
		generators.put(GENERATE_MYSQL_COMMAND, new MySqlGenerator)
		generators.put(GENERATE_MSSQL_COMMAND, new MsSqlGenerator)
		generators.put(GENERATE_DB2_COMMAND, new Db2Generator)
		return #[ 
			GENERATE_SQL_COMMAND, GENERATE_POSTGRES_COMMAND, GENERATE_ORACLE_COMMAND, 
			GENERATE_MYSQL_COMMAND, GENERATE_MSSQL_COMMAND, GENERATE_DB2_COMMAND
		]
	}
	
	override execute(ExecuteCommandParams params, ILanguageServerAccess access, CancelIndicator cancelIndicator) {
		// handle erdiagram.generate.* commands 
		if (params.command.startsWith(GENERATE_PREFIX)) {
			val fsa = ErUtils.getJavaIoFileSystemAccess()
			fsa.setOutputPath("generated")
			val uri = params.arguments.head as JsonPrimitive
			
			if (uri !== null) {
				if (!generators.containsKey(params.command)) {
					return "Error! Unknown generator for command '" + params.command + "'"
				}
				val generator = generators.get(params.command)
				
				return access.doRead(uri.asString) [
						try {
							// check for syntax errors
							val errors = resource.getErrors();
							if (!errors.isEmpty) {
								return "Error! Model contains syntax errors."
							}
							
							// check for validation errors
							val issues = resourceValidator.validate(resource, CheckMode.ALL, CancelIndicator.NullImpl);
							if (!issues.isEmpty) {
								return "Error! Model contains validation errors."
							}
							
							// execute the generator
							generator.generate(resource, fsa, new GeneratorContext())
							// optionally generate drop tables
							val genDrop = params.arguments.get(1) as JsonPrimitive;
							if (genDrop !== null && genDrop.asString.equals("true") && generator instanceof SqlGenerator) {
								(generator as SqlGenerator).generateDrop(resource, fsa, new GeneratorContext());
							}
							return "Successfully generated code!"
						} catch (Exception ex) {
							return "Error! Exception while executing generator: \n" + ex.message
						}
					].get
			} else {
				return "Error! Missing resource URI"
			}
		}
		
		return "Error! Unknown Command"
	}
}