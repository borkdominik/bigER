package org.big.erd.generator.sql;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.eclipse.xtext.util.RuntimeIOException;
import org.eclipse.xtext.xbase.lib.Exceptions;

/**
 * Generates vendor-agnostic SQL from the ER model.
 * Can be extended to provide vendor-specific dialects.
 */
public class SqlGenerator implements IErGenerator {
	
	private Map<String, List<Attribute>> effectivePrimaryKeys = new HashMap<>();

	@Override
	public void generate(final Resource resource, final IFileSystemAccess2 fsa, final IGeneratorContext context) {
		final Model diagram = (Model) resource.getContents().get(0);
		String diagramName = diagram.getName();
		final String fileName = (diagramName != null ? diagramName : "output") + ".sql";
		final String fileNameDrop = (diagramName != null ? diagramName : "output") + "-drop.sql";
		try {
			StringConcatenation fileContent = generateFileContent(diagram, false);
			fsa.generateFile(fileName, fileContent);
			StringConcatenation fileContentDrop = generateFileContent(diagram, true);
			fsa.generateFile(fileNameDrop, fileContentDrop);
		} catch (final Throwable t) {
			if (t instanceof RuntimeIOException) {
				throw new Error("Could not generate file. Did you open a folder?");
			} else {
				throw Exceptions.sneakyThrow(t);
			}
		}
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
			addAttributes(tableContent, entity.getAttributes());
			
			addPrimaryKeys(tableContent, entity.getName(), Arrays.asList(this.primaryKey(entity)));
		}
		endTable(tableContent, drop);
		return tableContent.toString();
	}

	private String toTable(final Relationship relationship, boolean drop) {
		Entity firstEntity = relationship.getFirst().getTarget();
		List<Attribute> firstKey = null;
		if (firstEntity != null) {
			firstKey = this.effectivePrimaryKey(firstEntity);
		}
		Entity secondEntity = relationship.getSecond().getTarget();
		List<Attribute> secondKey = null;
		if (secondEntity != null) {
			secondKey = this.effectivePrimaryKey(secondEntity);
		}
		RelationEntity third = relationship.getThird();
		Entity thirdEntity = null;
		if (third != null) {
			thirdEntity = third.getTarget();
		}
		List<Attribute> thirdKey = null;
		if (thirdEntity != null) {
			thirdKey = this.effectivePrimaryKey(thirdEntity);
		}
		
		StringConcatenation tableContent = new StringConcatenation();
		startTable(tableContent, relationship.getName(), drop);

		if (!drop) {
			// attributes
			List<List<Attribute>> keyList = Arrays.asList(firstKey, secondKey, thirdKey);
			List<Attribute> flatKeyList = flattenKeys(keyList);
			addAttributes(tableContent, flatKeyList);
			addAttributes(tableContent, relationship.getAttributes());
			
			// primary key
			addPrimaryKeys(tableContent, false, relationship.getName(), keyList);
	
			// foreign key
			addForeignKey(tableContent, secondKey == null && thirdKey == null, firstKey, firstEntity);
			addForeignKey(tableContent, thirdKey == null, secondKey, secondEntity);
			addForeignKey(tableContent, thirdKey, thirdEntity);
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
			addAttributes(tableContent, weak.getAttributes());
			addAttributes(tableContent, relationship.getAttributes());
	
			// primary key
			List<Attribute> primaryKey = this.effectivePrimaryKey(strong);
			addAttributes(tableContent, primaryKey);
			addPrimaryKeys(tableContent, false, weak.getName(), Arrays.asList(this.partialKey(weak), primaryKey));
	
			// foreign key
			addForeignKey(tableContent, primaryKey, strong);
		}
		
		endTable(tableContent, drop);
		return tableContent.toString();
	}

	private List<Attribute> primaryKey(final Entity entity) {
		List<Attribute> attributes = entity.getAttributes();
		List<Attribute> key = new ArrayList<>();
		for (final Attribute attribute : attributes) {
			if (attribute.getType() == AttributeType.KEY) {
				key.add(attribute);
			}
		}
		if (key.size() == 0) {
			key.add(attributes.get(0));
		}
		return key;
	}

	private List<Attribute> partialKey(final Entity entity) {
		List<Attribute> attributes = entity.getAttributes();
		List<Attribute> key = new ArrayList<>();
		for (final Attribute attribute : attributes) {
			if (attribute.getType() == AttributeType.PARTIAL_KEY) {
				key.add(attribute);
			}
		}
		if (key.size() == 0) {
			key.add(attributes.get(0));
		}
		return key;
	}

	protected String transformDataType(Attribute attribute, String mappedType, int size, StringBuilder comment) {
		if (size > 0) {
			return mappedType + "(" + size + ")";
		}
		return mappedType;
	}

	protected String mapDataType(String type) {
		return type;
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

	private void addAttributes(StringConcatenation tableContent, List<Attribute> attributes) {
		for (final Attribute attribute : attributes) {
			if (attribute.getType() != AttributeType.DERIVED) {
				tableContent.append("\t");
				tableContent.append(attribute.getName());
				StringBuilder comment = new StringBuilder();
				String originalType = "";
				int size;
				if (attribute.getDatatype() != null) {
					originalType = attribute.getDatatype().getType();
					size = attribute.getDatatype().getSize();
				} else {
					originalType = "VARCHAR";
					size = 255;
					addComment(comment, "added default type");
				}
				String mappedType = this.mapDataType(originalType);
				if (mappedType == null) {
					mappedType = originalType;
					addComment(comment, "unknown type");
				} else if (!mappedType.equals(originalType)) {
					addComment(comment, "type mapped from: " + originalType);
				}
				String transformedDataType = this.transformDataType(attribute, mappedType, size, comment);
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

	private void addPrimaryKeys(StringConcatenation tableContent, String entityName, List<List<Attribute>> keys) {
		addPrimaryKeys(tableContent, true, entityName, keys);
	}

	private void addPrimaryKeys(StringConcatenation tableContent, boolean isLastContent, String entityName, List<List<Attribute>> keys) {
		tableContent.append("\t");
		tableContent.append("PRIMARY KEY (");
		
		boolean isFirst = true;
		for (List<Attribute> key : keys) {
			if (key != null) {
				for (Attribute a : key) {
					if (!isFirst) {
						tableContent.append(", ");
					} else {
						isFirst = false;
					}
					tableContent.append(a.getName());
				}
			}
		}
		
		tableContent.append(")");
		if (!isLastContent) {
			tableContent.append(",");
		}
		tableContent.newLineIfNotEmpty();

		effectivePrimaryKeys.put(entityName, flattenKeys(keys));
	}

	private void addForeignKey(StringConcatenation tableContent, List<Attribute> key, Entity refEntity) {
		addForeignKey(tableContent, true, key, refEntity);
	}

	private void addForeignKey(StringConcatenation tableContent, boolean isLastContent, List<Attribute> key, Entity refEntity) {
		if (key != null && refEntity != null) {
			tableContent.append("\t");
			tableContent.append("FOREIGN KEY (");
			boolean isFirst = true;
			for (Attribute a : key) {
				if (!isFirst) {
					tableContent.append(", ");
				} else {
					isFirst = false;
				}
				tableContent.append(a.getName());
			}
			tableContent.append(") references ");
			tableContent.append(refEntity.getName());
			tableContent.append(" (");
			isFirst = true;
			for (Attribute a : key) {
				if (!isFirst) {
					tableContent.append(", ");
				} else {
					isFirst = false;
				}
				tableContent.append(a.getName());
			}
			tableContent.append(")");
			tableContent.append(" ON DELETE CASCADE");
			if (!isLastContent) {
				tableContent.append(",");
			}
			tableContent.newLineIfNotEmpty();
		}
	}
	
	private List<Attribute> flattenKeys(final List<List<Attribute>> keys) {
		List<Attribute> list = new ArrayList<>();
		for (List<Attribute> key : keys) {
			if (key != null) {
				for (Attribute a : key) {
					list.add(a);
				}
			}
		}
		return list;
	}

	private List<Attribute> effectivePrimaryKey(final Entity entity) {
		String name = entity.getName();
		if (!effectivePrimaryKeys.containsKey(name)) {
			throw new IllegalArgumentException("Entity" + name + " not yet processed.");
		}
		return effectivePrimaryKeys.get(name);
	}
}
