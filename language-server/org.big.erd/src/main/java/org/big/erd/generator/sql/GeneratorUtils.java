package org.big.erd.generator.sql;

import java.util.Set;

public class GeneratorUtils {
	
	public static final String NOT_NULL = "NOT NULL";

	public static String findUniqueName(String nameOriginal, Set<String> usedNames) {
		String name = nameOriginal;
		int i = 2;
		while (!usedNames.add(name)) {
			name = nameOriginal + i;
			i++;
		}
		return name;
	}
}
