package org.big.erd.generator.nosqlimport;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.HashMap;

public class Neo4jImport {

    private static final Pattern ENTITY_PATTERN = Pattern.compile("CREATE \\((\\w+):(\\w+)\\s*\\{(.*?)\\}");
    private static final Pattern FIELDS_ARRAY_PATTERN = Pattern.compile("\\{(.*?)\\}");
    private static final Pattern FIELD_PATTERN = Pattern.compile("(?:\\s*(\\w+):\\s*\"([^\"]*)\")");
    private static final Pattern RELATIONSHIP_PATTERN = Pattern.compile("CREATE \\((\\w+)\\)-\\[(\\w+):(\\w+)\\s*\\{([^}]*)\\}\\]->\\((\\w+)\\)");


    public static void main(String[] args) {
        if (args.length != 1) {
            System.out.println("Usage: java Neo4jInterpreter <file_path>");
            return;
        }

        StringBuilder output = new StringBuilder();
        String filePath = args[0];
        Map<String, Map<String, String>> entities = new LinkedHashMap<>();
        Map<String, String[]> relationships = new LinkedHashMap<>();

        // Counter for Entities in relationships (for ternary relationships)
        Map<String, Integer> entityRelationshipCounter = new HashMap<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Matcher entityMatcher = ENTITY_PATTERN.matcher(line);
                if (entityMatcher.find()) {
                    String entityName = entityMatcher.group(1);
                    String entityType = entityMatcher.group(2);

                    Map<String, String> fields = new LinkedHashMap<>();
                    Matcher fieldMatcher = FIELD_PATTERN.matcher(entityMatcher.group(3));
                    while (fieldMatcher.find()) {
                        fields.put(fieldMatcher.group(1), fieldMatcher.group(2));
                    }

                    entities.put(entityName, fields);
                }

                Matcher relationshipMatcher = RELATIONSHIP_PATTERN.matcher(line);
                if (relationshipMatcher.find()) {
                    String relationshipName = relationshipMatcher.group(2);
                    String[] entitiesInRelationship = {relationshipMatcher.group(1), relationshipMatcher.group(5)};
                    // counting entity accurances in releationships
                    entityRelationshipCounter.put(entitiesInRelationship[0], entityRelationshipCounter.getOrDefault(entitiesInRelationship[0], 0) + 1);

                    String relationshipProperties = relationshipMatcher.group(4);
                    Matcher fieldMatcher = FIELD_PATTERN.matcher(relationshipProperties);
                    Map<String, String> fields = new LinkedHashMap<>();
                    while (fieldMatcher.find()) {
                        fields.put(fieldMatcher.group(1), fieldMatcher.group(2));
                    }
                    relationships.put(relationshipName, entitiesInRelationship);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Print entities and their fields
        for (Map.Entry<String, Map<String, String>> entry : entities.entrySet()) {
          if (entityRelationshipCounter.getOrDefault(entry.getKey(), 0) != 3) {
            output.append("entity " + entry.getKey() + " {\n");
            for (Map.Entry<String, String> field : entry.getValue().entrySet()) {
                // if fields datatype is the same as entity name, skip as
                // this is most likely just the Vertex label for neo4j graph
                if (!field.getValue().equals(entry.getKey())) {
                    output.append("\t" + field.getKey() + ": " + field.getValue() + "\n");
                }
            }
            output.append("}\n");
          }
        }

        // Print relationships
        for (Map.Entry<String, String[]> entry : relationships.entrySet()) {
            if (entityRelationshipCounter.getOrDefault(entry.getValue()[0], 0) == 3) {
                output.append("relationship " + entry.getValue()[0] + " {");
                ArrayList<String> acc = new ArrayList<>();
                relationships.entrySet().forEach(x -> {
                    if (x.getValue()[0].equals(entry.getValue()[0])) {
                        acc.add(x.getValue()[1]);
                    }
                });
                var triad = acc.toArray();
                output.append("\t" +  triad[0] + " -> " + triad[1] + " -> " + triad[2] + "\n");
                entities.entrySet().stream()
                    .filter(x -> x.getKey().equals(entry.getValue()[0]))
                    .findFirst()
                    .ifPresent( e ->
                        e.getValue().entrySet().forEach(field -> {
                            output.append("\t" + field.getKey() + ": " + field.getValue() + "\n");
                        })
                    );
            } else if (entityRelationshipCounter.getOrDefault(entry.getValue()[0], 0) != 0) {
                output.append("relationship " + entry.getKey() + " {\n");
                output.append("\t" + entry.getValue()[0] + " -> " + entry.getValue()[1] + "\n");
            }
            Map<String, String> relationshipFields = entities.get(entry.getKey());
            if (relationshipFields != null) {
                for (Map.Entry<String, String> field : relationshipFields.entrySet()) {
                    // if fields datatype is the same as entity name, skip as
                    // this is most likely just the Vertex label for neo4j graph
                    if (!field.getValue().equals(entry.getKey())) {
                        output.append("\t" + field.getKey() + ": " + field.getValue() + "\n");
                    }
                }
            }
            if (entityRelationshipCounter.getOrDefault(entry.getValue()[0], 0) == 3) {
                entityRelationshipCounter.put(entry.getValue()[0], 0);
                output.append("}\n");
            } else if (entityRelationshipCounter.getOrDefault(entry.getValue()[0], 0) != 0){
                output.append("}\n");
            }
        }

        System.out.println(output);
    }
}

