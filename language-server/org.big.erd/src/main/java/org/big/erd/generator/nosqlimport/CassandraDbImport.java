package org.big.erd.generator.nosqlimport;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CassandraDbImport{

    private static final Pattern ENTITY_PATTERN = Pattern.compile("CREATE TABLE (\\w+)\\(");
    private static final Pattern FIELD_PATTERN = Pattern.compile("(\\w+)\\s+(\\w+)(?:,|\\)|\\s)");
    private static final Pattern PRIMARYKEYS_PATTERN = Pattern.compile("PRIMARY KEY \\(([^)]+)\\)");
    private static final Pattern WITHCOMMENTRELATIONSHIP_PATTERN = Pattern.compile("WITH\\s*comment\\s*=\\s*'relationship'");


    public static void main(String[] args) {
        if (args.length != 1) {
            System.out.println("Usage: java CassandraInterpreter <file_path>");
            return;
        }

        StringBuilder output = new StringBuilder();
        String filePath = args[0];
        Map<String, Map<String, Tuple<String, Boolean>>> entities = new LinkedHashMap<>();
        Map<String, Map<String, Tuple<String, Boolean>>> relationships = new LinkedHashMap<>();
        var primary_keys = new ArrayList<String>();
        Map<String, String> keys_from_entities = new HashMap<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
                sb.append(" ");
            }

            String content = sb.toString();
            String[] parts = content.split("CREATE TABLE");

            for (String part : parts) {
                if (part.isEmpty()) {
                    continue;
                }

                Matcher entityMatcher = ENTITY_PATTERN.matcher("CREATE TABLE" + part);
                if (entityMatcher.find()) {
                    String entityName = entityMatcher.group(1);
                    Matcher fieldMatcher = FIELD_PATTERN.matcher(part);

                    // Regular expression to detect primary key definition
                    Matcher primkMatcher = PRIMARYKEYS_PATTERN.matcher(part);
                    while (primkMatcher.find()) {
                        var f = primkMatcher.group(1).split(",");
                        for(int i = 0; i < f.length; i++) {
                            primary_keys.add(f[i]);
                        }
                    }

                    Map<String, Tuple<String, Boolean>> fields = new HashMap<>();
                    while (fieldMatcher.find()) {
                        if (!(fieldMatcher.group(1).toUpperCase().equals("PRIMARY") 
                        && fieldMatcher.group(2).toUpperCase().equals("KEY"))){
                            if (primary_keys.contains(fieldMatcher.group(1))) {
                                fields.put(fieldMatcher.group(1), new Tuple<>(fieldMatcher.group(2), true));
                            } else {
                                fields.put(fieldMatcher.group(1), new Tuple<>(fieldMatcher.group(2), false));
                            }
                        }
                    }

                    Matcher commentsFieldsMatcher = WITHCOMMENTRELATIONSHIP_PATTERN.matcher(part);
                    if (commentsFieldsMatcher.find()) {
                        relationships.put(entityName, fields);
                    }else {
                        entities.put(entityName, fields);
                        for (var f : fields.entrySet()) {
                            if (f.getValue().getSecond()) {
                                keys_from_entities.put(f.getKey(), entityName);
                            }
                        }
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Print tables and their fields
        for (Map.Entry<String, Map<String, Tuple<String, Boolean>>> entry : entities.entrySet()) {
            output.append("entity " + entry.getKey() + " {\n");
            for (Map.Entry<String, Tuple<String, Boolean>> field : entry.getValue().entrySet()) {
                if (primary_keys.contains((field.getKey()))) {
                    output.append("\t" + field.getKey() + ": " + translateDataType(field.getValue().getFirst()) + " key" + "\n");
                } else {
                    output.append("\t" + field.getKey() + ": " + translateDataType(field.getValue().getFirst()) + "\n");
                }
            }
            output.append("}\n");
        }
        // Print tables and their fields
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
                if (!field.getValue().getSecond()) {
                    output.append("\t" + field.getKey() + ": " + translateDataType(field.getValue().getFirst().toLowerCase()) + "\n");   
                }
            }
            output.append("}\n");
        }

        System.out.println(output);
    }

    private static String translateDataType(String Datatype) {
        switch(Datatype.toUpperCase()) {
            case "TEXT":
                return "VARCHAR(255)";
            case "VARINT":
                return "INT";
        }
        return Datatype;
    }

}

