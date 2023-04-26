package org.big.erd.generator.nosqlimport;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.TooManyListenersException;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.swing.RowFilter.Entry;
import javax.swing.text.StyledEditorKit.BoldAction;

public class MongoDbImport {

    private static final Pattern ENTITY_PATTERN = Pattern.compile("db\\.createCollection\\(\"([^\"]+)\",");
    private static final Pattern FIELD_PATTERN = Pattern.compile("(?<!properties)([a-zA-Z_]+)(?<!jsonSchema):\\s*\\{\\s*bsonType:\\s*\"([^\"]+)\"");
    private static final Pattern REQUIRED_FIELDS_PATTERN = Pattern.compile("required:\\s*\\[([^\\]]+)\\]");
    private static final Pattern TITLE_FIELDS_PATTERN = Pattern.compile("title:\\s*\"([^\"]*\\brelationship\\b[^\"]*)\"");

    public static void main(String[] args) {
        if (args.length != 1) {
            System.out.println("Usage: java MongoDBInterpreter <file_path>");
            return;
        }

        StringBuilder output = new StringBuilder();
        String filePath = args[0];
        Map<String, Map<String, Tuple<String, Boolean>>> entities = new LinkedHashMap<>();
        Map<String, Map<String, Tuple<String, Boolean>>> relationships = new LinkedHashMap<>();

        Map<String, String> keys_from_entities = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
                sb.append(" ");
            }

            String content = sb.toString();

            Matcher entityMatcher = ENTITY_PATTERN.matcher(content);
            while (entityMatcher.find()) {
                String entityName = entityMatcher.group(1);
                int entityStart = entityMatcher.start();
                int entityEnd = content.indexOf("});", entityStart);
                if (entityEnd == -1) {
                    entityEnd = content.length();
                }

                String entityContent = content.substring(entityStart, entityEnd);
                Matcher fieldMatcher = FIELD_PATTERN.matcher(entityContent);

                Map<String, Tuple<String, Boolean>> fields = new HashMap<>();
                while (fieldMatcher.find()) {
                    fields.put(fieldMatcher.group(1), new Tuple<>(fieldMatcher.group(2), false));
                }

                Matcher requiredFieldsMatcher = REQUIRED_FIELDS_PATTERN.matcher(entityContent);
                if (requiredFieldsMatcher.find()) {
                    String[] requiredFields = requiredFieldsMatcher.group(1).replaceAll("\"", "").split(",");
                    for (String requiredField : requiredFields) {
                        requiredField = requiredField.trim();
                        if (fields.containsKey(requiredField)) {
                            fields.put(requiredField, new Tuple<>(fields.get(requiredField).getFirst(), true));
                        }
                    }
                }
                Matcher titleFieldsMatcher = TITLE_FIELDS_PATTERN.matcher(entityContent);
                if (titleFieldsMatcher.find()) {
                    relationships.put(entityName, fields);
                }else {
                    entities.put(entityName, fields);
                    keys_from_entities.put(fields.entrySet().stream().filter(x -> x.getValue().getSecond()).findFirst().get().getKey(), entityName);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Print entities and their fields
        for (Map.Entry<String, Map<String, Tuple<String, Boolean>>> entry : entities.entrySet()) {
            output.append("entity " + entry.getKey() + " {\n");
            for (Map.Entry<String, Tuple<String, Boolean>> field : entry.getValue().entrySet()) {
                output.append("\t" + field.getKey() + ": " + translateDataType(field.getValue().getFirst().toLowerCase()) + (field.getValue().getSecond() ? " key" : "") + "\n");
            }
            output.append("}\n");
        }
        // Print entities and their fields
        for (Map.Entry<String, Map<String, Tuple<String, Boolean>>> rel : relationships.entrySet()) {
            output.append("relationship " + rel.getKey() + " {\n");
            // keyed fields
            int field_counter = 0;
            for (Map.Entry<String, Tuple<String, Boolean>> field : rel.getValue().entrySet()) {
                if (field.getValue().getSecond()) {
                    output.append((field_counter++ > 0 ? " -> " : "\t")+ keys_from_entities.getOrDefault(field.getKey(), field.getKey()));
                }
            }
            output.append("\n");
            for (Map.Entry<String, Tuple<String, Boolean>> field : rel.getValue().entrySet()) {
                if (field.getValue().getSecond()) {
                    output.append("\t" + field.getKey() + ": " + translateDataType(field.getValue().getFirst().toLowerCase()) + "\n");
                }
            }
            output.append("}\n");
        }

        System.out.println(output);
    }

    private static String translateDataType(String Datatype) {
        switch(Datatype.toUpperCase()) {
            case "STRING":
                return "VARCHAR(255)";
            case "VARINT":
                return "INT";
            case "SMALLINT":
                return "INT";
        }
        return Datatype.toUpperCase();
    }

}

