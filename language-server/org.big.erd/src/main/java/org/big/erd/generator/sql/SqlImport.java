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

	private static final String ATTRIBUTE_PATTERN = "\\s*(.*) (.*),\\s*(?:--(.*))?";
	private static final int ATTRIBUTE_NAME = 1;
	private static final int ATTRIBUTE_TYPE = 2;
	private static final int ATTRIBUTE_COMMENT = 3;
	
	private static final String FOREIGN_KEY_PATTERN = "\\s*FOREIGN KEY \\((.*)\\) references (.+) \\((.*)\\)( ON DELETE CASCADE)?";
	private static final int FOREIGN_KEY_ATTRIBUTES = 1;
	private static final int FOREIGN_KEY_REF_TABLE = 2;
	private static final int FOREIGN_KEY_REF_ATTRIBUTES = 3;
	private static final int FOREIGN_KEY_CASCADE_KEYWORD = 4;

	private static final String PRIMARY_KEY_PATTERN = "\\s*PRIMARY KEY \\((.*)\\)";
	private static final String TABLE_PATTERN =
			"CREATE TABLE (.+) \\(((?:\r\n"
			+ replaceCaptureGroups(ATTRIBUTE_PATTERN) + ")*)\r\n"
			+ PRIMARY_KEY_PATTERN + "((?:,\r\n"
			+ replaceCaptureGroups(FOREIGN_KEY_PATTERN) + ")*)\r\n"
			+ "\\);";
	private static final int TABLE_NAME = 1;
	private static final int TABLE_ATTRIBUTES = 2;
	private static final int TABLE_PRIMARY_KEY = 3;
	private static final int TABLE_FOREIGN_KEYS = 4;
	
	private static String replaceCaptureGroups(String pattern) {
		// replace the capturing groups (not escaped leading parenthesis, without ?) with non-capturing groups
		return pattern.replaceAll("(?<!\\\\)\\((?!\\?)", "(?:");
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

		Map<String, Map<String, String>> globalForeignKeys = new LinkedHashMap<>();
		Pattern p = Pattern.compile(TABLE_PATTERN);
		Matcher m = p.matcher(text);
		while (m.find()) {
			String tableName = m.group(TABLE_NAME);
			String tableAttributes = m.group(TABLE_ATTRIBUTES);
			String tablePrimaryKey = m.group(TABLE_PRIMARY_KEY);
			String tableForeignKeys = m.group(TABLE_FOREIGN_KEYS);
			
			Map<String, String> foreignKeys = new LinkedHashMap<>();
			if (tableForeignKeys != null) {
				Pattern pFor = Pattern.compile(FOREIGN_KEY_PATTERN);
				Matcher mFor = pFor.matcher(tableForeignKeys);
				while (mFor.find()) {
					String foreignKeyAttributes = mFor.group(FOREIGN_KEY_ATTRIBUTES);
					List<String> foreignKeyAttributeList = splitAndTrim(foreignKeyAttributes);
					String foreignKeyRefTable = mFor.group(FOREIGN_KEY_REF_TABLE);
					String foreignKeyRefAttributes = mFor.group(FOREIGN_KEY_REF_ATTRIBUTES);
					List<String> foreignKeyRefAttributeList = splitAndTrim(foreignKeyRefAttributes);
					String foreignKeyCascadeKeyword = mFor.group(FOREIGN_KEY_CASCADE_KEYWORD);
					for (String id : foreignKeyAttributeList) {
						foreignKeys.put(id, foreignKeyRefTable);
					}
					globalForeignKeys.put(tableName, foreignKeys);
				}
			}
			
			List<SqlAttribute> attributes = new ArrayList<>();
			Pattern pAtt = Pattern.compile(ATTRIBUTE_PATTERN);
			Matcher mAtt = pAtt.matcher(tableAttributes);
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
				}
			}
			
			if (!attributes.isEmpty()) {
				fileContent.append("entity ");
				fileContent.append(tableName);
				fileContent.append(" {");
				fileContent.newLineIfNotEmpty();
				
				String[] pk = tablePrimaryKey.split(",");
				List<String> primaryKeyAttributes = new ArrayList<>();
				for (String id : pk) {
					primaryKeyAttributes.add(id.trim());
				}
				
				for (SqlAttribute attribute : attributes) {
					fileContent.append("\t");
					fileContent.append(attribute.getAttributeName());
					fileContent.append(": ");
					fileContent.append(attribute.getAttributeType());
					if (primaryKeyAttributes.contains(attribute.getAttributeName())) {
						fileContent.append(" key");
					}
					if (attribute.getAttributeComment() != null) {
						fileContent.append(" //");
						fileContent.append(attribute.getAttributeComment());
					}
					fileContent.newLineIfNotEmpty();
				}
				fileContent.append("}");
				fileContent.newLineIfNotEmpty();
			}
		}
		for (String tableName : globalForeignKeys.keySet()) {
			Map<String, String> foreignKeys = globalForeignKeys.get(tableName);
			
			fileContent.append("relationship ");
			fileContent.append(tableName);
			fileContent.append(" {");
			fileContent.newLineIfNotEmpty();
			
			boolean first = true;
			Set<String> refTables = new LinkedHashSet<>(foreignKeys.values());
			for (String table : refTables) {
				if (!first) {
					fileContent.append(" -> ");
				} else {
					fileContent.append("\t");
				}
				fileContent.append(table);
				first = false;
			}
			fileContent.newLineIfNotEmpty();
			
			fileContent.append("}");
			fileContent.newLineIfNotEmpty();
		}
		return fileContent;
	}

	protected List<String> splitAndTrim(String attributes) {
		String[] arr = attributes.split(",");
		List<String> attributeList = new ArrayList<>();
		for (String id : arr) {
			attributeList.add(id.trim());
		}
		return attributeList;
	}
}
