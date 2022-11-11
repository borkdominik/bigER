package org.big.erd.ide.commands

import org.eclipse.xtext.ide.server.commands.IExecutableCommandService
import org.eclipse.lsp4j.ExecuteCommandParams
import org.eclipse.xtext.ide.server.ILanguageServerAccess
import org.eclipse.xtext.util.CancelIndicator
import org.big.erd.util.ErUtils
import org.big.erd.generator.SqlGenerator
import com.google.gson.JsonPrimitive
import org.eclipse.xtext.generator.GeneratorContext
import org.eclipse.xtext.generator.IGenerator2

class ErCommandService implements IExecutableCommandService {
	
	protected IGenerator2 generator = new SqlGenerator
	
	override initialize() {
		#[ "erdiagram.generate.sql" ]
	}
	
	override execute(ExecuteCommandParams params, ILanguageServerAccess access, CancelIndicator cancelIndicator) {
		if (params.command.equals("erdiagram.generate.sql")) {
			val fsa = ErUtils.getJavaIoFileSystemAccess()
			val uri = params.arguments.head as JsonPrimitive
			
			if (uri !== null) {
					return access.doRead(uri.asString) [
						fsa.setOutputPath("generated")
						generator.doGenerate(resource, fsa, new GeneratorContext())
						return "Success! The generated code can be found in the generated/ folder."
					].get
			} else {
				return "Error! Missing resource URI."
			}
		}
	}
	
	
	
}