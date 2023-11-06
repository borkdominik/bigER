package org.big.erd.generator.sql;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import org.big.erd.entityRelationship.Attribute;
import org.big.erd.entityRelationship.AttributeType;
import org.big.erd.entityRelationship.Entity;
import org.big.erd.entityRelationship.Model;
import org.big.erd.entityRelationship.RelationEntity;
import org.big.erd.entityRelationship.Relationship;
import org.big.erd.generator.IErGenerator;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtend2.lib.StringConcatenation;
import org.eclipse.xtext.generator.IFileSystemAccess2;
import org.eclipse.xtext.generator.IGeneratorContext;

/**
 * Generates vendor-agnostic SQL from the ER model.
 * Can be extended to provide vendor-specific dialects.
 */
public class SqlGenerator implements IErGenerator {
	
	private Map<String, Map<String, Attribute>> effectivePrimaryKeys = new HashMap<>();
	
	public static boolean handleFiles(Function<CharSequence, Model> parseFunction) throws IOException {
		boolean success = true;
		String[] fileNames = new String[] {"biger", "biger-basic", "biger-relships"};
		for (String fileName : fileNames) {
			fileName = fileName + ".txt";
			File file = new File("src\\test\\resources\\org\\big\\erd\\generator\\sql\\export\\input", fileName);
			try (InputStream fis = SqlGenerator.class.getResourceAsStream("export/input/" + fileName)) {
				if (fis != null) {
					byte[] content = fis.readAllBytes();
					String strContent = new String(content);
					Model model = parseFunction.apply(strContent);
					success &= exportVendor(file, model, "default_generator", false, new SqlGenerator());
					success &= exportVendor(file, model, "db2", false, new Db2Generator());
					success &= exportVendor(file, model, "mssql", false, new MsSqlGenerator());
					success &= exportVendor(file, model, "mysql", false, new MySqlGenerator());
					success &= exportVendor(file, model, "oracle", false, new OracleGenerator());
					success &= exportVendor(file, model, "postgres", false, new PostgresGenerator());
					success &= exportVendor(file, model, "default_generator_drop", true, new SqlGenerator());
					success &= exportVendor(file, model, "db2_drop", true, new Db2Generator());
					success &= exportVendor(file, model, "mssql_drop", true, new MsSqlGenerator());
					success &= exportVendor(file, model, "mysql_drop", true, new MySqlGenerator());
					success &= exportVendor(file, model, "oracle_drop", true, new OracleGenerator());
					success &= exportVendor(file, model, "postgres_drop", true, new PostgresGenerator());
				} else {
					System.err.println("could not open file: " + "export/input/" + fileName);
				}
			}
		}
		return success;
	}

	private static boolean exportVendor(File file, Model model, String exportKey, boolean drop, SqlGenerator exportObject) throws IOException, FileNotFoundException {
		StringConcatenation fileContent = exportObject.generateFileContent(model, drop);
		String outputContent = fileContent.toString();
		File output = new File(new File(new File(file.getParentFile().getParentFile(), "output"), exportKey), file.getName());
		if (output.getParentFile().isDirectory()) {
			try (FileOutputStream fos = new FileOutputStream(output)) {
				fos.write(outputContent.getBytes());
			}
		}
		try (InputStream fisExpected = SqlImport.class.getResourceAsStream("export/output/expected/" + exportKey + "/" + file.getName())) {
			byte[] contentExpected = fisExpected.readAllBytes();
			if (!new String(contentExpected).equals(outputContent)) {
				System.err.println("unexpected output in file: " + output.getAbsolutePath());
				return false;
			}
		}
		return true;
	}

	@Override
	public void generate(final Resource resource, final IFileSystemAccess2 fsa, final IGeneratorContext context) {
		final Model diagram = (Model) resource.getContents().get(0);
		String diagramName = diagram.getName();
		final String fileName = (diagramName != null ? diagramName : "output") + ".sql";
		StringConcatenation fileContent = generateFileContent(diagram, false);
		fsa.generateFile(fileName, fileContent);
	}
	
	public void generateDrop(final Resource resource, final IFileSystemAccess2 fsa, final IGeneratorContext context) {
		final Model diagram = (Model) resource.getContents().get(0);
		String diagramName = diagram.getName();
		final String fileNameDrop = (diagramName != null ? diagramName : "output") + "-drop.sql";
		StringConcatenation fileContentDrop = generateFileContent(diagram, true);
		fsa.generateFile(fileNameDrop, fileContentDrop);
	}

	public String generate(final Model diagram) {
		return generateFileContent(diagram, false).toString();
	}

	private StringConcatenation generateFileContent(final Model diagram, boolean drop) {
		List<String> tables = new ArrayList<>();
		StringConcatenation fileContent = new StringConcatenation();
		
		// entities
		for (final Entity entity : diagram.getEntities()) {
			if (!entity.isWeak()) {
				String table = this.toTable(entity, drop);
				tables.add(table);
			}
		}
		
		// weak relationships
		for (final Relationship relationship : diagram.getRelationships()) {
			if (relationship.isWeak()) {
				String weakTable = this.weakToTable(relationship, drop);
				tables.add(weakTable);
			}
		}
		
		// strong relationships
		for (final Relationship relationship : diagram.getRelationships()) {
			if (!relationship.isWeak()) {
				String table = this.toTable(relationship, drop);
				tables.add(table);
			}
		}
		
		// create output
		if (drop) {
			Collections.reverse(tables);
		}
		for (final String table : tables) {
			fileContent.append(table);
			fileContent.newLineIfNotEmpty();
		}
		
		return fileContent;
	}

	private String toTable(final Entity entity, boolean drop) {
		StringConcatenation tableContent = new StringConcatenation();
		startTable(tableContent, entity.getName(), drop);
		if (!drop) {
			Set<String> usedNames = new HashSet<>();
			Map<String, Attribute> attributeMap = deduplicateAttributes(entity.getAttributes(), usedNames);
			
			addAttributes(tableContent, attributeMap);
			
			addPrimaryKeys(tableContent, entity.getName(), Arrays.asList(this.primaryKey(attributeMap)));
		}
		endTable(tableContent, drop);
		return tableContent.toString();
	}

	private String toTable(final Relationship relationship, boolean drop) {
		StringConcatenation tableContent = new StringConcatenation();
		startTable(tableContent, relationship.getName(), drop);

		if (!drop) {
			Entity firstEntity = relationship.getFirst().getTarget();
			Map<String, Attribute> firstKey = null;
			if (firstEntity != null) {
				firstKey = this.effectivePrimaryKey(firstEntity);
			}
			Entity secondEntity = relationship.getSecond().getTarget();
			Map<String, Attribute> secondKey = null;
			if (secondEntity != null) {
				secondKey = this.effectivePrimaryKey(secondEntity);
			}
			RelationEntity third = relationship.getThird();
			Entity thirdEntity = null;
			if (third != null) {
				thirdEntity = third.getTarget();
			}
			Map<String, Attribute> thirdKey = null;
			if (thirdEntity != null) {
				thirdKey = this.effectivePrimaryKey(thirdEntity);
			}
			
			// attributes
			Set<String> usedNames = new HashSet<>();
			Map<String, Attribute> attributeMap = deduplicateAttributes(relationship.getAttributes(), usedNames);
			Map<String, Attribute> firstKeyMap = deduplicateAttributes(firstKey, usedNames);
			Map<String, Attribute> secondKeyMap = deduplicateAttributes(secondKey, usedNames);
			Map<String, Attribute> thirdKeyMap = deduplicateAttributes(thirdKey, usedNames);

			addAttributes(tableContent, firstKeyMap);
			addAttributes(tableContent, secondKeyMap);
			addAttributes(tableContent, thirdKeyMap);
			addAttributes(tableContent, attributeMap);
			
			// primary key
			List<Map<String, Attribute>> keyList = Arrays.asList(firstKeyMap, secondKeyMap, thirdKeyMap);
			addPrimaryKeys(tableContent, false, relationship.getName(), keyList);
	
			// foreign key
			addForeignKey(tableContent, secondKey == null && thirdKey == null, firstKey, firstKeyMap, firstEntity);
			addForeignKey(tableContent, thirdKey == null, secondKey, secondKeyMap, secondEntity);
			addForeignKey(tableContent, thirdKey, thirdKeyMap, thirdEntity);
		}
		
		endTable(tableContent, drop);
		return tableContent.toString();
	}

	private String weakToTable(final Relationship relationship, boolean drop) {
		final Entity strong = this.getStrongEntity(relationship);
		final Entity weak = this.getWeakEntity(relationship);
		
		StringConcatenation tableContent = new StringConcatenation();
		startTable(tableContent, weak.getName(), drop);

		if (!drop) {
			// attributes
			Set<String> usedNames = new HashSet<>();
			Map<String, Attribute> weakMap = deduplicateAttributes(weak.getAttributes(), usedNames);
			Map<String, Attribute> relationshipMap = deduplicateAttributes(relationship.getAttributes(), usedNames);
			Map<String, Attribute> primaryKey = this.effectivePrimaryKey(strong);
			Map<String, Attribute> primaryKeyMap = deduplicateAttributes(primaryKey, usedNames);
			
			addAttributes(tableContent, weakMap);
			addAttributes(tableContent, relationshipMap);
	
			// primary key
			addAttributes(tableContent, primaryKeyMap);
			addPrimaryKeys(tableContent, false, weak.getName(), Arrays.asList(this.partialKey(weakMap), primaryKeyMap));
	
			// foreign key
			addForeignKey(tableContent, primaryKey, primaryKeyMap, strong);
		}
		
		endTable(tableContent, drop);
		return tableContent.toString();
	}

	private Map<String, Attribute> primaryKey(final Map<String, Attribute> attributes) {
		Map<String, Attribute> key = new LinkedHashMap<>();
		for (final String name : attributes.keySet()) {
			Attribute attribute = attributes.get(name);
			if (attribute.getType() == AttributeType.KEY) {
				key.put(name, attribute);
			}
		}
		return key;
	}

	private Map<String, Attribute> partialKey(final Map<String, Attribute> attributes) {
		Map<String, Attribute> key = new LinkedHashMap<>();
		for (final String name : attributes.keySet()) {
			Attribute attribute = attributes.get(name);
			if (attribute.getType() == AttributeType.PARTIAL_KEY) {
				key.put(name, attribute);
			}
		}
		return key;
	}

	protected String transformDataType(Attribute attribute, String mappedType, int size, Integer precision, StringBuilder comment) {
		if (size > 0) {
			String strPrecision = "";
			if (precision != null && precision > 0) {
				strPrecision = ", " + precision;
			}
			mappedType = mappedType + "(" + size + strPrecision + ")";
		}
		if (attribute.getType() != AttributeType.OPTIONAL) {
			mappedType = mappedType + " " + GeneratorUtils.NOT_NULL;
		}
		return mappedType;
	}

	protected String mapDataType(String type) {
		return type;
	}
	
	// ER model does not support spaces in data types
	private String replaceUnderscores(String value) {
		return value.replace("_", " ");
	}

	private Entity getStrongEntity(final Relationship r) {
		if (r.getFirst().getTarget().isWeak()) {
			return r.getSecond().getTarget();
		} else {
			return r.getFirst().getTarget();
		}
	}

	private Entity getWeakEntity(final Relationship r) {
		if (r.getFirst().getTarget().isWeak()) {
			return r.getFirst().getTarget();
		} else {
			return r.getSecond().getTarget();
		}
	}

	private void startTable(StringConcatenation tableContent, String tableName, boolean drop) {
		if (!drop) {
			tableContent.append("CREATE ");
		} else {
			tableContent.append("DROP ");
		}
		tableContent.append("TABLE ");
		tableContent.append(tableName);
		if (!drop) {
			tableContent.append(" (");
			tableContent.newLineIfNotEmpty();
		}
	}

	private void endTable(StringConcatenation tableContent, boolean drop) {
		if (!drop) {
			tableContent.append(")");
		}
		tableContent.append(";");
		if (!drop) {
			tableContent.newLineIfNotEmpty();
		}
	}

	private void addAttributes(StringConcatenation tableContent, Map<String, Attribute> attributes) {
		for (final String name : attributes.keySet()) {
			final Attribute attribute = attributes.get(name);
			if (attribute.getType() != AttributeType.DERIVED) {
				tableContent.append("\t");
				tableContent.append(name);
				StringBuilder comment = new StringBuilder();
				if (!name.equals(attribute.getName())) {
					addComment(comment, "renamed from: " + attribute.getName());
				}
				String originalType = "";
				int size;
				Integer precision = null;
				if (attribute.getDatatype() != null) {
					originalType = attribute.getDatatype().getType();
					size = attribute.getDatatype().getSize();
					precision = attribute.getDatatype().getD();
				} else {
					originalType = "VARCHAR";
					size = 255;
					addComment(comment, "added default type");
				}
				originalType = replaceUnderscores(originalType);
				String mappedType = this.mapDataType(originalType);
				if (mappedType == null) {
					mappedType = originalType;
					addComment(comment, "unknown type");
				} else if (!mappedType.equals(originalType)) {
					addComment(comment, "type mapped from: " + originalType);
				}
				String transformedDataType = this.transformDataType(attribute, mappedType, size, precision, comment);
				if (transformedDataType != null && !transformedDataType.isEmpty()) {
					tableContent.append(" ");
					tableContent.append(transformedDataType);
				}
				tableContent.append(",");
				if (comment.length() > 0) {
					tableContent.append("\t");
					tableContent.append("-- ");
					tableContent.append(comment);
				}
				tableContent.newLineIfNotEmpty();
			}
		}
	}

	protected void addComment(StringBuilder comment, String str) {
		if (comment.length() > 0 && !str.isEmpty()) {
			comment.append("; ");
		}
		comment.append(str);
	}

	private void addPrimaryKeys(StringConcatenation tableContent, String entityName, List<Map<String, Attribute>> keys) {
		addPrimaryKeys(tableContent, true, entityName, keys);
	}

	private void addPrimaryKeys(StringConcatenation tableContent, boolean isLastContent, String entityName, List<Map<String, Attribute>> keys) {
		tableContent.append("\t");
		tableContent.append("PRIMARY KEY (");
		
		boolean isFirst = true;
		for (Map<String, Attribute> key : keys) {
			if (key != null) {
				for (String name : key.keySet()) {
					if (!isFirst) {
						tableContent.append(", ");
					} else {
						isFirst = false;
					}
					tableContent.append(name);
				}
			}
		}
		
		tableContent.append(")");
		if (!isLastContent) {
			tableContent.append(",");
		}
		tableContent.newLineIfNotEmpty();

		effectivePrimaryKeys.put(entityName, mergeMaps(keys));
	}

	private void addForeignKey(StringConcatenation tableContent, Map<String, Attribute> key, Map<String, Attribute> keyDeduplicated, Entity refEntity) {
		addForeignKey(tableContent, true, key, keyDeduplicated, refEntity);
	}

	private void addForeignKey(StringConcatenation tableContent, boolean isLastContent, Map<String, Attribute> key, Map<String, Attribute> keyDeduplicated, Entity refEntity) {
		if (key != null && refEntity != null) {
			tableContent.append("\t");
			tableContent.append("FOREIGN KEY (");
			boolean isFirst = true;
			for (String name : keyDeduplicated.keySet()) {
				if (!isFirst) {
					tableContent.append(", ");
				} else {
					isFirst = false;
				}
				tableContent.append(name);
			}
			tableContent.append(") REFERENCES ");
			tableContent.append(refEntity.getName());
			tableContent.append(" (");
			isFirst = true;
			for (String name : key.keySet()) {
				if (!isFirst) {
					tableContent.append(", ");
				} else {
					isFirst = false;
				}
				tableContent.append(name);
			}
			tableContent.append(")");
			tableContent.append(" ON DELETE CASCADE");
			if (!isLastContent) {
				tableContent.append(",");
			}
			tableContent.newLineIfNotEmpty();
		}
	}
	
	private Map<String, Attribute> mergeMaps(final List<Map<String, Attribute>> list) {
		Map<String, Attribute> result = new LinkedHashMap<>();
		for (Map<String, Attribute> map : list) {
			if (map != null) {
				result.putAll(map);
			}
		}
		return result;
	}
	
	private Map<String, Attribute> deduplicateAttributes(final List<Attribute> attributes, Set<String> usedNames) {
		Map<String, Attribute> map = new LinkedHashMap<>();
		if (attributes != null) {
			for (Attribute a : attributes) {
				String nameOriginal = a.getName();
				String name = GeneratorUtils.findUniqueName(nameOriginal, usedNames);
				map.put(name, a);
			}
		}
		return map;
	}
	
	private Map<String, Attribute> deduplicateAttributes(final Map<String, Attribute> attributes, Set<String> usedNames) {
		Map<String, Attribute> map = new LinkedHashMap<>();
		if (attributes != null) {
			for (String nameOriginal : attributes.keySet()) {
				Attribute a = attributes.get(nameOriginal);
				String name = GeneratorUtils.findUniqueName(nameOriginal, usedNames);
				map.put(name, a);
			}
		}
		return map;
	}

	private Map<String, Attribute> effectivePrimaryKey(final Entity entity) {
		String name = entity.getName();
		if (!effectivePrimaryKeys.containsKey(name)) {
			throw new IllegalArgumentException("Entity" + name + " not yet processed.");
		}
		return effectivePrimaryKeys.get(name);
	}
}
