package org.big.erd.util

import org.eclipse.xtext.generator.JavaIoFileSystemAccess
import com.google.inject.Guice
import org.eclipse.xtext.service.AbstractGenericModule
import org.eclipse.xtext.parser.IEncodingProvider

class ErUtils {
	
	def static JavaIoFileSystemAccess getJavaIoFileSystemAccess() {
		val fsa = new JavaIoFileSystemAccess()
		
		Guice.createInjector(new AbstractGenericModule() {
			def Class<? extends IEncodingProvider> bindIEncodingProvider() {
				return IEncodingProvider.Runtime
			}
		}).injectMembers(fsa)
		
		return fsa
	}
}