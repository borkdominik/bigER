package org.big.erd.generator.sql;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.big.erd.entityRelationship.Model;
import org.big.erd.generator.IErGenerator;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtend2.lib.StringConcatenation;
import org.eclipse.xtext.generator.IFileSystemAccess2;
import org.eclipse.xtext.generator.IGeneratorContext;
import org.eclipse.xtext.util.RuntimeIOException;
import org.eclipse.xtext.xbase.lib.Exceptions;

/**
 * Generates vendor-agnostic SQL from the ER model.
 * Can be extended to provide vendor-specific dialects.
 */
public class SqlImport implements IErGenerator {

	private static final String ATTRIBUTE_PATTERN = "\\s*(\\S*) (.*\\(\\d+\\)|[^,\\s]+)[^,\\)]*,?\\s*(?:--(.*))?";
	private static final int ATTRIBUTE_NAME = 1;
	private static final int ATTRIBUTE_TYPE = 2;
	private static final int ATTRIBUTE_COMMENT = 3;
	
	private static final String FOREIGN_KEY_PATTERN = ".*FOREIGN KEY \\((.*)\\)\\s+REFERENCES (?:.+\\.)?(\\S+) ?\\((.*)\\)([^,]*?)";
	private static final int FOREIGN_KEY_ATTRIBUTES = 1;
	private static final int FOREIGN_KEY_REF_TABLE = 2;
	private static final int FOREIGN_KEY_REF_ATTRIBUTES = 3;
	private static final int FOREIGN_KEY_KEYWORDS = 4;

	private static final String PRIMARY_KEY_PATTERN = ".*PRIMARY KEY \\((.*)\\)";

	@SuppressWarnings("unused")
	// for debugging
	private static final String CREATE_TABLE_PATTERN_DEBUG = getCreateTablePattern(false);
	private static final String CREATE_TABLE_PATTERN = getCreateTablePattern(true);
	private static final int CREATE_TABLE_NAME = 1;
	private static final int CREATE_TABLE_ATTRIBUTES = 2;
	private static final int CREATE_TABLE_PRIMARY_KEY = 3;
	private static final int CREATE_TABLE_FOREIGN_KEYS = 4;

	@SuppressWarnings("unused")
	// for debugging
	private static final String ALTER_TABLE_PATTERN_DEBUG = getAlterTablePattern(false);
	private static final String ALTER_TABLE_PATTERN = getAlterTablePattern(true);
	private static final int ALTER_TABLE_NAME = 1;
	private static final int ALTER_TABLE_PRIMARY_KEY = 2;
	private static final int ALTER_TABLE_FOREIGN_KEYS = 3;

	private static String getCreateTablePattern(boolean replace) {
		return "CREATE TABLE(?: IF NOT EXISTS)? (?:.+\\.)?(\\S+)\\s*\\(((?:\r\n"
				+ replaceCaptureGroups(ATTRIBUTE_PATTERN, replace) + ")*)(?:\r\n"
				+ PRIMARY_KEY_PATTERN + ")?((?:,\r\n"
				+ replaceCaptureGroups(FOREIGN_KEY_PATTERN, replace) + ")*)\r\n"
				+ "\\);?";
	}

	private static String getAlterTablePattern(boolean isDebug) {
		return "ALTER TABLE(?: ONLY)?(?: IF EXISTS)? (?:.+\\.)?(\\S+)(?:\r\n"
				+ PRIMARY_KEY_PATTERN + ")?(\r\n"
				+ replaceCaptureGroups(FOREIGN_KEY_PATTERN, isDebug) + ")?;?";
	}
	
	private static String replaceCaptureGroups(String pattern, boolean replace) {
		if (replace) {
			// replace the capturing groups (not escaped leading parenthesis, without ?) with non-capturing groups
			return pattern.replaceAll("(?<!\\\\)\\((?!\\?)", "(?:");
		}
		return pattern;
	}

	@Override
	public void generate(final Resource resource, final IFileSystemAccess2 fsa, final IGeneratorContext context) {
		final Model diagram = (Model) resource.getContents().get(0);
		String diagramName = diagram.getName();
		final String fileName = (diagramName != null ? diagramName : "output") + ".sql";
		final String fileNameDrop = (diagramName != null ? diagramName : "output") + ".erd";
		try {
			String text = fsa.readTextFile(fileName).toString();
			StringConcatenation fileContent = generateFileContent(diagramName, text);
			fsa.generateFile(fileNameDrop, fileContent);
		} catch (final Throwable t) {
			if (t instanceof RuntimeIOException) {
				throw new Error("Could not generate file. Did you open a folder?", t);
			} else {
				throw Exceptions.sneakyThrow(t);
			}
		}
	}
	
	public static void main(String[] args) throws IOException {
		byte[] content = new FileInputStream("d:\\Src\\bigER\\bigER\\examples\\generated\\University.sql").readAllBytes();
		StringConcatenation fileContent = new SqlImport().generateFileContent("test", new String(content));
		System.out.println(fileContent.toString());
	}

	private StringConcatenation generateFileContent(String diagramName, String text) {
		StringConcatenation fileContent = new StringConcatenation();
		fileContent.append("erdiagram ");
		fileContent.append(diagramName);
		fileContent.newLineIfNotEmpty();

		Map<String, String> presetPrimaryKeys = new LinkedHashMap<>();
		Map<String, String> presetForeignKeys = new LinkedHashMap<>();
		Map<String, Map<String, String>> globalForeignKeys = new LinkedHashMap<>();
		Map<String, List<SqlAttribute>> globalAttributes = new LinkedHashMap<>();
		Map<String, Boolean> globalWeakMap = new LinkedHashMap<>();
		
		// collect primary and foreign keys
		Pattern pPreset = Pattern.compile(ALTER_TABLE_PATTERN, Pattern.CASE_INSENSITIVE);
		Matcher mPreset = pPreset.matcher(text);
		while (mPreset.find()) {
			String tableName = mPreset.group(ALTER_TABLE_NAME);
			String tablePrimaryKey = mPreset.group(ALTER_TABLE_PRIMARY_KEY);
			String tableForeignKeys = mPreset.group(ALTER_TABLE_FOREIGN_KEYS);
			
			if (tablePrimaryKey != null) {
				presetPrimaryKeys.put(tableName, tablePrimaryKey);
			}
			if (tableForeignKeys != null) {
				if (presetForeignKeys.containsKey(tableName)) {
					presetForeignKeys.put(tableName, presetForeignKeys.get(tableName) + "," + tableForeignKeys);
				} else {
					presetForeignKeys.put(tableName, tableForeignKeys);
				}
			}
		}
		
		// process tables
		Pattern p = Pattern.compile(CREATE_TABLE_PATTERN, Pattern.CASE_INSENSITIVE);
		Matcher m = p.matcher(text);
		while (m.find()) {
			String tableName = m.group(CREATE_TABLE_NAME);
			String tableAttributes = m.group(CREATE_TABLE_ATTRIBUTES);
			String tablePrimaryKey = m.group(CREATE_TABLE_PRIMARY_KEY);
			String tableForeignKeys = m.group(CREATE_TABLE_FOREIGN_KEYS);

			// process foreign keys
			Map<String, String> foreignKeys = new LinkedHashMap<>();
			if (tableForeignKeys == null || tableForeignKeys.isEmpty()) {
				tableForeignKeys = presetForeignKeys.get(tableName);
			}
			if (tableForeignKeys != null) {
				Pattern pFor = Pattern.compile(FOREIGN_KEY_PATTERN, Pattern.CASE_INSENSITIVE);
				Matcher mFor = pFor.matcher(tableForeignKeys);
				while (mFor.find()) {
					String foreignKeyAttributes = mFor.group(FOREIGN_KEY_ATTRIBUTES);
					List<String> foreignKeyAttributeList = splitAndTrim(foreignKeyAttributes);
					String foreignKeyRefTable = mFor.group(FOREIGN_KEY_REF_TABLE);
					String foreignKeyRefAttributes = mFor.group(FOREIGN_KEY_REF_ATTRIBUTES);
					List<String> foreignKeyRefAttributeList = splitAndTrim(foreignKeyRefAttributes);
					String foreignKeyKeywords = mFor.group(FOREIGN_KEY_KEYWORDS);
					for (String id : foreignKeyAttributeList) {
						foreignKeys.put(id, foreignKeyRefTable);
					}
					globalForeignKeys.put(tableName, foreignKeys);
				}
			}

			// process primary keys
			if (tablePrimaryKey == null) {
				tablePrimaryKey = presetPrimaryKeys.get(tableName);
			}
			String[] pk = tablePrimaryKey.split(",");
			List<String> primaryKeyAttributes = new ArrayList<>();
			for (String id : pk) {
				primaryKeyAttributes.add(id.trim());
			}

			// process attributes
			List<SqlAttribute> attributes = new ArrayList<>();
			Pattern pAtt = Pattern.compile(ATTRIBUTE_PATTERN, Pattern.CASE_INSENSITIVE);
			Matcher mAtt = pAtt.matcher(tableAttributes);
			boolean weak = false;
			boolean isEntity = false;
			while (mAtt.find()) {
				String attributeName = mAtt.group(ATTRIBUTE_NAME);
				String attributeType = mAtt.group(ATTRIBUTE_TYPE);
				String attributeComment = mAtt.group(ATTRIBUTE_COMMENT);

				if (!foreignKeys.containsKey(attributeName)) {
					SqlAttribute attribute = new SqlAttribute();
					attribute.setAttributeName(attributeName);
					attribute.setAttributeType(attributeType);
					attribute.setAttributeComment(attributeComment);
					
					attributes.add(attribute);
					
					if (primaryKeyAttributes.contains(attributeName)) {
						isEntity = true;
					}
				} else if (primaryKeyAttributes.contains(attributeName)) {
					weak = true;
				}
			}
			
			if (isEntity) {
				// generate entities
				if (weak) {
					fileContent.append("weak ");
				}
				fileContent.append("entity ");
				fileContent.append(capitalize(tableName));
				fileContent.append(" {");
				fileContent.newLineIfNotEmpty();
				
				addAttributes(fileContent, attributes, primaryKeyAttributes, weak);
				
				fileContent.append("}");
				fileContent.newLineIfNotEmpty();
			} else {
				globalAttributes.put(tableName, attributes);
			}
			globalWeakMap.put(tableName, weak && isEntity);
		}
		
		// generate relationships
		int i = 1;
		for (String tableName : globalForeignKeys.keySet()) {
			Map<String, String> foreignKeys = globalForeignKeys.get(tableName);
			List<SqlAttribute> attributes = globalAttributes.get(tableName);
			boolean weak = globalWeakMap.get(tableName);
			Set<String> refTables = new LinkedHashSet<>(foreignKeys.values());

			if (weak) {
				refTables.add(tableName);
				fileContent.append("weak ");
			}
			fileContent.append("relationship ");
			if (weak) {
				fileContent.append("weakRel");
				fileContent.append(i);
				i++;
			} else {
				fileContent.append(capitalize(tableName));
			}
			fileContent.append(" {");
			fileContent.newLineIfNotEmpty();
			
			boolean first = true;
			for (String table : refTables) {
				if (!first) {
					fileContent.append(" -> ");
				} else {
					fileContent.append("\t");
				}
				fileContent.append(capitalize(table));
				first = false;
			}
			fileContent.newLineIfNotEmpty();

			addAttributes(fileContent, attributes, null, false);
			
			fileContent.append("}");
			fileContent.newLineIfNotEmpty();
		}
		return fileContent;
	}

	private void addAttributes(StringConcatenation fileContent, List<SqlAttribute> attributes, List<String> primaryKeyAttributes, boolean weak) {
		if (attributes != null) {
			for (SqlAttribute attribute : attributes) {
				fileContent.append("\t");
				fileContent.append(attribute.getAttributeName());
				fileContent.append(": ");
				fileContent.append(attribute.getAttributeType().replace(" ", ""));
				if (primaryKeyAttributes != null && primaryKeyAttributes.contains(attribute.getAttributeName())) {
					fileContent.append(" ");
					if (weak) {
						fileContent.append("partial-");
					}
					fileContent.append("key");
				}
				if (attribute.getAttributeComment() != null) {
					fileContent.append(" //");
					fileContent.append(attribute.getAttributeComment());
				}
				fileContent.newLineIfNotEmpty();
			}
		}
	}

	private List<String> splitAndTrim(String attributes) {
		String[] arr = attributes.split(",");
		List<String> attributeList = new ArrayList<>();
		for (String id : arr) {
			attributeList.add(id.trim());
		}
		return attributeList;
	}
	
	private String capitalize(String str) {
		if (str != null && !str.isEmpty()) {
			str = str.substring(0, 1).toUpperCase() + str.substring(1);
		}
		return str;
	}
}
