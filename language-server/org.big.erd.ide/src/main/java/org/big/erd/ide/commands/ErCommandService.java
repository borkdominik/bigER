package org.big.erd.ide.commands;

import java.net.URI;
import java.util.List;
import java.util.function.Function;
import org.big.erd.generator.IErGenerator;
import org.big.erd.generator.sql.SqlGenerator;
import org.big.erd.generator.sql.SqlImport;
import org.big.erd.util.ErUtils;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource.Diagnostic;
import org.eclipse.lsp4j.ExecuteCommandParams;
import org.eclipse.xtext.generator.GeneratorContext;
import org.eclipse.xtext.generator.IFileSystemAccess2;
import org.eclipse.xtext.generator.InMemoryFileSystemAccess;
import org.eclipse.xtext.generator.JavaIoFileSystemAccess;
import org.eclipse.xtext.ide.server.ILanguageServerAccess;
import org.eclipse.xtext.ide.server.commands.IExecutableCommandService;
import org.eclipse.xtext.util.CancelIndicator;
import org.eclipse.xtext.validation.CheckMode;
import org.eclipse.xtext.validation.IResourceValidator;
import org.eclipse.xtext.validation.Issue;
import com.google.gson.JsonPrimitive;
import com.google.inject.Inject;
import org.apache.log4j.Logger;

import static org.big.erd.ide.commands.CommandUtils.*;

public class ErCommandService implements IExecutableCommandService {
	
	@Inject private ErCommandRegistry commandRegistry;
	@Inject private IResourceValidator resourceValidator;
	private static Logger LOG = Logger.getLogger(ErCommandService.class);

	@Override
	public List<String> initialize() {
		return commandRegistry.getCommands();
	}

	@Override
	public Object execute(ExecuteCommandParams params, ILanguageServerAccess access, CancelIndicator cancelIndicator) {
		// IMPORT COMMANDS
		if (params.getCommand().equals(IMPORT_SQL_COMMAND)) {
			JsonPrimitive erdFileUri = ((JsonPrimitive) params.getArguments().get(0));
			JsonPrimitive sqlFileUri = ((JsonPrimitive) params.getArguments().get(1));
			//InMemoryFileSystemAccess fsa = ErUtils.getInMemoryFileSystemAccess();
			
			JavaIoFileSystemAccess fsa = ErUtils.getJavaIoFileSystemAccess();
			// fsa.setOutputPath("./");
			
			//JavaIoFileSystemAccess fsa = ErUtils.getJavaIoFileSystemAccess();
			fsa.setOutputPath("output");
			LOG.info("ERD File URI: " + erdFileUri);
			LOG.info("SQL File URI: " + sqlFileUri);
			
			try {
				return access.<String>doRead(erdFileUri.getAsString(), getImportFunction(sqlFileUri.getAsString(), fsa, params)).get();
			} catch (Exception ex) {
				return "Error! Exception while importing file: \n" + ex.getMessage();
			}
			
		}
		
		// GENERATE COMMANDS
		if (params.getCommand().startsWith(GENERATE_PREFIX)) {
			JavaIoFileSystemAccess fsa = ErUtils.getJavaIoFileSystemAccess();
			fsa.setOutputPath("generated");
			JsonPrimitive uri = ((JsonPrimitive) params.getArguments().get(0));
			
			// validate command
			if (uri == null) {
				return "Error! Missing resource URI";
			}
			if (!commandRegistry.getGenerators().containsKey(params.getCommand())) {
				return "Error! Unknown generator for command '" + params.getCommand() + "'";
			}
			IErGenerator generator = commandRegistry.getGenerators().get(params.getCommand());
			
			try {
				return access.<String>doRead(uri.getAsString(), getGenerateFunction(fsa, generator, params)).get();
			} catch (Exception ex) {
				// client (e.g. VS Code) checks for "Error" prefix
				// TODO: improve this?
				return "Error! Exception while executing generator: \n" + ex.getMessage();
			}
		}
		return "Error! Unknown Command";
	}
	
	private Function<ILanguageServerAccess.Context, String> getImportFunction(String sqlFileUri, IFileSystemAccess2 fsa, ExecuteCommandParams params) {
		return (ILanguageServerAccess.Context it) -> {
			// LOG.info("URI: " + it.getResource().getURI().trimSegments(1).path());
			//fsa.setOutputPath(it.getResource().getURI().trimSegments(1).path());
			
			SqlImport sqlImport = new SqlImport();
			sqlImport.importFile(it.getResource(), sqlFileUri, fsa, new GeneratorContext());
			return "Successfully imported code!";
		};
	}
	
	private Function<ILanguageServerAccess.Context, String> getGenerateFunction(IFileSystemAccess2 fsa, IErGenerator generator, ExecuteCommandParams params) {
		return (ILanguageServerAccess.Context it) -> {
			// check for syntax errors
			EList<Diagnostic> errors = it.getResource().getErrors();
			if (!errors.isEmpty()) {
				return "Error! Model contains syntax errors.";
			}
			
			// check for validation errors
			List<Issue> issues = resourceValidator.validate(it.getResource(), CheckMode.ALL, CancelIndicator.NullImpl);
			if (!issues.isEmpty()) {
				return "Error! Model contains validation errors.";
			}
			
			// generate
			generator.generate(it.getResource(), fsa, new GeneratorContext());
			
			// optionally generate drop tables
			JsonPrimitive genDrop = ((JsonPrimitive) params.getArguments().get(1));
			if (genDrop != null && genDrop.getAsString().equals("true") && generator instanceof SqlGenerator) {
				SqlGenerator sqlGenerator = (SqlGenerator) generator;
				sqlGenerator.generateDrop(it.getResource(), fsa, new GeneratorContext());
			}
			return "Successfully generated code!";
		};
	}

}
