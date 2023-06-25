package org.big.erd.generator.sql;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
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
 * Generates an ER model from SQL DDL statements.
 * 
 * TODO: Integrate SQL Import
 */
public class SqlImport implements IErGenerator {

	private static final boolean REPLACE_NEWLINES = false;

	private static final String SIZE_BASE_PATTERN = "\\d+(?:,\\s*\\d+)?";
	private static final String SIZE_PATTERN = "\\(((?:" + SIZE_BASE_PATTERN + ")|\\*)";
	private static final int SIZE_VALUE = 1;
	
	private static final String ATTRIBUTE_PATTERN = "\\s*([^\\)\\s,]*)(?: (.*\\([\\d\\*]+.*?\\)|[^,\\s]+))?([^,\\)]*),?\\s*(?:--(.*))?";
	private static final int ATTRIBUTE_NAME = 1;
	private static final int ATTRIBUTE_TYPE = 2;
	private static final int ATTRIBUTE_KEYWORDS = 3;
	private static final int ATTRIBUTE_COMMENT = 4;
	
	private static final String FOREIGN_KEY_BASE_PATTERN = "FOREIGN KEY\\s*\\((.*?)\\)\\s*REFERENCES (?:.+?\\.)?(\\S+)\\s*\\((.*?)\\)";
	private static final String FOREIGN_KEY_PATTERN = ".*?" + FOREIGN_KEY_BASE_PATTERN + "([^,]*?)";
	private static final int FOREIGN_KEY_ATTRIBUTES = 1;
	private static final int FOREIGN_KEY_REF_TABLE = 2;
	private static final int FOREIGN_KEY_REF_ATTRIBUTES = 3;
	private static final int FOREIGN_KEY_KEYWORDS = 4;

	private static final String PRIMARY_KEY_BASE_PATTERN = "PRIMARY KEY(?: CLUSTERED)?\\s*\\((.*?)\\)";
	private static final String PRIMARY_KEY_PATTERN = ".*" + PRIMARY_KEY_BASE_PATTERN + "(?:WITH.+?\\(.*?\\))?[^,\\)]*?";
	private static final String UNIQUE_KEY_PATTERN = ".*UNIQUE KEY[^,\\)]*?";

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
		String pattern = "CREATE TABLE(?: IF NOT EXISTS)? (?:.+?\\.)?(\\S+)\\s*\\(((?:\r\n"
				+ replaceCaptureGroups(ATTRIBUTE_PATTERN, replace) + ")*?)(?:\r\n"
				+ PRIMARY_KEY_PATTERN + ")?(?:,\r\n"
				+ UNIQUE_KEY_PATTERN + ")?((?:,\r\n"
				+ replaceCaptureGroups(FOREIGN_KEY_PATTERN, replace) + ")*)\r?\n?"
				+ "\\s*\\)";
		if (replace) {
			pattern = removeNewlines(pattern, REPLACE_NEWLINES);
		}
		return pattern;
	}

	private static String getAlterTablePattern(boolean replace) {
		String pattern = "ALTER TABLE(?: ONLY)?(?: IF EXISTS)? (?:.+?\\.)?(\\S+)\\s*(?:\r?\n?"
				+ PRIMARY_KEY_PATTERN + ")?(\r?\n?"
				+ replaceCaptureGroups(FOREIGN_KEY_PATTERN, replace) + ")?;?";
		if (replace) {
			pattern = removeNewlines(pattern, REPLACE_NEWLINES);
		}
		return pattern;
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
	
	public boolean handleFiles() throws IOException {
		File root = new File("src\\main\\java\\org\\big\\erd\\generator\\sql\\input");
		return handleFile(root);
	}
	
	private static boolean handleFile(File file) throws IOException {
		boolean success = true;
		if (file.isFile()) {
			try (FileInputStream fis = new FileInputStream(file)) {
				byte[] content = fis.readAllBytes();
				String strContent = new String(content);
				success &= importNotation(file, strContent, "default_notation", new SqlImport());
				success &= importNotation(file, strContent, "uml", new UmlSqlImport());
				success &= importNotation(file, strContent, "min_max", new MinMaxSqlImport());
				success &= importNotation(file, strContent, "crows_foot", new CrowsFootSqlImport());
				success &= importNotation(file, strContent, "chen", new ChenSqlImport());
				success &= importNotation(file, strContent, "bachman", new BachmanSqlImport());
			}
		} else if (file.isDirectory()) {
			for (File f : file.listFiles()) {
				success &= handleFile(f);
			}
		} else {
			throw new FileNotFoundException(file.getAbsolutePath());
		}
		return success;
	}

	private static boolean importNotation(File file, String strContent, String importKey, SqlImport importObject) throws IOException, FileNotFoundException {
		StringConcatenation fileContent = importObject.generateFileContent("test", strContent);
		String outputContent = fileContent.toString();
		File output = new File(new File(new File(file.getParentFile().getParentFile(), "output"), importKey), file.getName());
		try (FileOutputStream fos = new FileOutputStream(output)) {
			fos.write(outputContent.getBytes());
		}
		File expected = new File(new File(new File(new File(file.getParentFile().getParentFile(), "output"), "expected"), importKey), file.getName());
		if (expected.isFile()) {
			try (FileInputStream fisExpected = new FileInputStream(expected)) {
				byte[] contentExpected = fisExpected.readAllBytes();
				if (!new String(contentExpected).equals(outputContent)) {
					System.out.println("unexpected output in file: " + output.getAbsolutePath());
					return false;
				}
			}
		}
		return true;
	}

	private StringConcatenation generateFileContent(String diagramName, String text) {
		String preprocessedSql = preprocessSql(text);
		
		StringConcatenation fileContent = new StringConcatenation();
		fileContent.append("// ER Model");
		fileContent.newLineIfNotEmpty();
		fileContent.append("erdiagram ");
		fileContent.append(diagramName);
		fileContent.newLineIfNotEmpty();
		fileContent.append("// Options");
		fileContent.newLineIfNotEmpty();
		fileContent.append("notation=");
		fileContent.append(getNotation());
		fileContent.newLineIfNotEmpty();

		Map<String, String> presetPrimaryKeys = new LinkedHashMap<>();
		Map<String, String> presetForeignKeys = new LinkedHashMap<>();
		Map<String, Map<String, String>> globalForeignKeys = new LinkedHashMap<>();
		Map<String, Map<String, String>> globalForeignKeysRefTable = new LinkedHashMap<>();
		Map<String, List<SqlAttribute>> globalAttributes = new LinkedHashMap<>();
		Map<String, List<SqlAttribute>> globalAttributesAll = new LinkedHashMap<>();
		Map<String, Boolean> globalWeakMap = new LinkedHashMap<>();
		
		// collect primary and foreign keys
		Pattern pPreset = Pattern.compile(ALTER_TABLE_PATTERN, Pattern.CASE_INSENSITIVE);
		Matcher mPreset = pPreset.matcher(preprocessedSql);
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
		
		fileContent.append("// Entities");
		fileContent.newLineIfNotEmpty();
		
		// process tables
		Pattern p = Pattern.compile(CREATE_TABLE_PATTERN, Pattern.CASE_INSENSITIVE);
		Matcher m = p.matcher(preprocessedSql);
		while (m.find()) {
			String tableName = m.group(CREATE_TABLE_NAME);
			String tableAttributes = m.group(CREATE_TABLE_ATTRIBUTES);
			String tablePrimaryKey = m.group(CREATE_TABLE_PRIMARY_KEY);
			String tableForeignKeys = m.group(CREATE_TABLE_FOREIGN_KEYS);

			// process foreign keys
			Map<String, String> foreignKeys = new LinkedHashMap<>();
			Map<String, String> foreignKeysRefTable = new LinkedHashMap<>();
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
					for (int i = 0; i < foreignKeyAttributeList.size(); i++) {
						String id = foreignKeyAttributeList.get(i);
						String idRefTable = foreignKeyRefAttributeList.get(i);
						foreignKeys.put(id, foreignKeyRefTable);
						foreignKeysRefTable.put(id, idRefTable);
					}
					globalForeignKeys.put(tableName, foreignKeys);
					globalForeignKeysRefTable.put(tableName, foreignKeysRefTable);
				}
			}

			// process primary keys
			if (tablePrimaryKey == null) {
				tablePrimaryKey = presetPrimaryKeys.get(tableName);
			}
			List<String> primaryKeyAttributes = new ArrayList<>();
			if (tablePrimaryKey != null) {
				String[] pk = tablePrimaryKey.split(",");
				for (String id : pk) {
					id = id.trim();
					int index = id.indexOf(" ");
					if (index > 0) {
						id = id.substring(0, index);
					}
					primaryKeyAttributes.add(id);
				}
			}

			// process attributes
			List<SqlAttribute> attributes = new ArrayList<>();
			List<SqlAttribute> attributesAll = new ArrayList<>();
			Pattern pAtt = Pattern.compile(ATTRIBUTE_PATTERN, Pattern.CASE_INSENSITIVE);
			Matcher mAtt = pAtt.matcher(tableAttributes);
			boolean weak = false;
			boolean isEntity = false;
			while (mAtt.find()) {
				String attributeName = mAtt.group(ATTRIBUTE_NAME);
				String attributeType = mAtt.group(ATTRIBUTE_TYPE);
				String attributeKeywords = mAtt.group(ATTRIBUTE_KEYWORDS);
				String attributeComment = mAtt.group(ATTRIBUTE_COMMENT);

				if (!attributeName.isBlank()) {
					int size = 0;
					Integer precision = null;
					if (attributeType != null) {
						Pattern pSize = Pattern.compile(SIZE_PATTERN);
						Matcher mSize = pSize.matcher(attributeType);
						if (mSize.find()) {
							String sizeValue = mSize.group(SIZE_VALUE);
							if ("*".equals(sizeValue)) {
								size = -1;
							} else {
								int index = sizeValue.indexOf(',');
								if (index > 0) {
									precision = Integer.parseInt(sizeValue.substring(index + 1).trim());
									sizeValue = sizeValue.substring(0, index);
								}
								size = Integer.parseInt(sizeValue);
							}
						}
					}
					if (size > 0) {
						String strPrecision = "";
						if (precision != null) {
							strPrecision = ", " + precision;
						}
						attributeType = replaceSpaces(deQuote(attributeType.substring(0, attributeType.indexOf("(" + size)))) + "(" + size + strPrecision + ")";
					} else if (size < 0) {
						attributeType = replaceSpaces(deQuote(attributeType.substring(0, attributeType.indexOf("(*"))));
					}
					SqlAttribute attribute = new SqlAttribute();
					attribute.setAttributeName(attributeName);
					attribute.setAttributeType(attributeType);
					attribute.setAttributeKeywords(attributeKeywords);
					attribute.setAttributeComment(attributeComment);
	
					attributesAll.add(attribute);
	
					if (!foreignKeys.containsKey(attributeName)) {
						attributes.add(attribute);
						
						if (primaryKeyAttributes.contains(attributeName) || foreignKeys.isEmpty()) {
							isEntity = true;
						}
					} else if (primaryKeyAttributes.contains(attributeName)) {
						weak = true;
					}
				}
			}
			
			if (isEntity) {
				// generate entities
				if (weak) {
					fileContent.append("weak ");
				}
				fileContent.append("entity ");
				fileContent.append(capitalize(deQuote(tableName)));
				fileContent.append(" {");
				fileContent.newLineIfNotEmpty();
				
				addAttributes(fileContent, attributes, primaryKeyAttributes, weak);
				
				fileContent.append("}");
				fileContent.newLineIfNotEmpty();
			}
			globalAttributes.put(tableName, attributes);
			globalAttributesAll.put(tableName, attributesAll);
			globalWeakMap.put(tableName, weak && isEntity);
		}
		
		fileContent.append("// Relationships");
		fileContent.newLineIfNotEmpty();
		
		// generate relationships
		Set<String> usedNames = new HashSet<>();
		for (String tableName : globalForeignKeys.keySet()) {
			Map<String, String> foreignKeys = globalForeignKeys.get(tableName);
			Map<String, String> foreignKeysRefTable = globalForeignKeysRefTable.get(tableName);
			List<SqlAttribute> attributes = globalAttributes.get(tableName);
			List<SqlAttribute> attributesAll = globalAttributesAll.get(tableName);
			boolean weak = globalWeakMap.get(tableName);
			Set<String> refTables = new LinkedHashSet<>(foreignKeys.values());
			
			Map<String, SqlAttribute> attributeMap = new HashMap<>();
			if (attributesAll != null) {
				for (SqlAttribute attribute : attributesAll) {
					attributeMap.put(attribute.getAttributeName(), attribute);
				}
			}

			if (weak) {
				refTables.add(tableName);
				fileContent.append("weak ");
			}
			fileContent.append("relationship ");
			if (weak) {
				StringBuilder sb = new StringBuilder();
				for (String table : refTables) {
					sb.append(capitalize(deQuote(table)));
				}
				String name = GeneratorUtils.findUniqueName(sb.toString(), usedNames);
				fileContent.append(name);
			} else {
				fileContent.append(capitalize(deQuote(tableName)));
			}
			fileContent.append(" {");
			fileContent.newLineIfNotEmpty();
			
			boolean first = true;
			int countMultiple = 0;
			for (String attribute : foreignKeys.keySet()) {
				String table = foreignKeys.get(attribute);
				List<SqlAttribute> attributesRefTable = globalAttributes.get(table);
				Map<String, SqlAttribute> attributeMapRefTable = new HashMap<>();
				if (attributesRefTable != null) {
					for (SqlAttribute attributeRefTable : attributesRefTable) {
						attributeMapRefTable.put(attributeRefTable.getAttributeName(), attributeRefTable);
					}
				}
				SqlAttribute sqlAttributeRefTable = attributeMapRefTable.get(foreignKeysRefTable.get(attribute));
				boolean isFirstDegreeRelship = attributesRefTable == null || sqlAttributeRefTable != null;
				if (isFirstDegreeRelship) {
					if (!first) {
						fileContent.append(" -> ");
					} else {
						fileContent.append("\t");
					}
					fileContent.append(capitalize(deQuote(table)));
					SqlAttribute sqlAttribute = attributeMap.get(attribute);
					boolean isMandantory = sqlAttribute != null && sqlAttribute.isMandatory();
					boolean isSingle = weak && first;
					fileContent.append("[");
					fileContent.append(getCardinality(weak || isMandantory, isSingle, countMultiple));
					fileContent.append("]");
					first = false;
					if (!isSingle) {
						countMultiple++;
					}
				}
			}
			if (weak) {
				fileContent.append(" -> ");
				fileContent.append(capitalize(deQuote(tableName)));
				fileContent.append("[");
				fileContent.append(getCardinality(false, false, countMultiple));
				fileContent.append("]");
			} else {
				fileContent.append("\t");
				fileContent.append("// example cardinalities");
			}
			fileContent.newLineIfNotEmpty();

			if (!weak) {
				addAttributes(fileContent, attributes, null, false);
			}
			
			fileContent.append("}");
			fileContent.newLineIfNotEmpty();
		}
		return fileContent;
	}

	protected String getNotation() {
		return "default";
	}

	protected String getCardinality(boolean isMandatory, boolean isSingle, int countMultiple) {
		return isSingle ? "1" : "N";
	}
	
	// ER model does not support spaces in data types
	private String replaceSpaces(String value) {
		return value.replace(" ", "_");
	}

	private String preprocessSql(String text) {
		// Oracle: insert line break
		text = text.replace("(\t", "(\r\n\t");
		// MsSql: combine primary key and foreign key clauses into a single line
		Pattern pPrimaryKey = Pattern.compile(PRIMARY_KEY_BASE_PATTERN, Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
		Matcher mPrimaryKey = pPrimaryKey.matcher(text);
		while (mPrimaryKey.find()) {
			String originalText = mPrimaryKey.group();
			String replacedText = removeNewlines(originalText);
			text = text.replace(originalText, replacedText);
		}
		Pattern pForeignKey = Pattern.compile(FOREIGN_KEY_BASE_PATTERN, Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
		Matcher mForeignKey = pForeignKey.matcher(text);
		while (mForeignKey.find()) {
			String originalText = mForeignKey.group();
			String replacedText = removeNewlines(originalText);
			text = text.replace(originalText, replacedText);
		}
		return removeNewlines(text, REPLACE_NEWLINES);
	}

	private void addAttributes(StringConcatenation fileContent, List<SqlAttribute> attributes, List<String> primaryKeyAttributes, boolean weak) {
		if (attributes != null) {
			for (SqlAttribute attribute : attributes) {
				fileContent.append("\t");
				fileContent.append(deQuote(attribute.getAttributeName()));
				if (attribute.getAttributeType() != null) {
					fileContent.append(": ");
					fileContent.append(deQuote(attribute.getAttributeType()));
				}
				if (primaryKeyAttributes != null && primaryKeyAttributes.contains(attribute.getAttributeName())) {
					fileContent.append(" ");
					if (weak) {
						fileContent.append("partial-");
					}
					fileContent.append("key");
				} else if (!attribute.isMandatory()) {
					fileContent.append(" optional");
				}
				if (attribute.getAttributeComment() != null) {
					fileContent.append("\t");
					fileContent.append("//");
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
	
	private String deQuote(String str) {
		str = deQuote(str, "'");
		str = deQuote(str, "\"");
		str = deQuote(str, "`");
		str = deQuote(str, "[", "]");
		return str;
	}
	
	private String deQuote(String str, String quoteChar) {
		return deQuote(str, quoteChar, null);
	}
	
	private String deQuote(String str, String quoteChar, String differentEndChar) {
		if (str != null && str.length() > 1) {
			if (differentEndChar == null) {
				if (str.startsWith(quoteChar) && str.endsWith(quoteChar)) {
					str = str.substring(1, str.length() - 1);
				}
			} else {
				if (str.startsWith(quoteChar) && str.endsWith(differentEndChar)) {
					str = str.substring(1, str.length() - 1);
				}
			}
		}
		return str;
	}
	
	private static String removeNewlines(String str) {
		return removeNewlines(str, true);
	}
	
	private static String removeNewlines(String str, boolean replace) {
		if (replace) {
			str = removeFromString(str, "\r\n");
			str = removeFromString(str, "\r");
			str = removeFromString(str, "\n");
		}
		return str;
	}
	
	private static String removeFromString(String str, String search) {
		if (str != null) {
			return str.replace(search, "");
		}
		return str;
	}
}
