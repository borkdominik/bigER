# bigER VS Code Extension

Entity-Relationship (ER) modeling tool supporting hybrid, textual- and graphical editing, multiple notations, and SQL code generation.


<p align="center">
  <img src="https://raw.githubusercontent.com/borkdominik/bigER/main/docs/img/tool-screenshot.png" alt="Demo" width="800" />
</p>

**Features:**

- 📝 **Textual Language** for ER modeling with rich-text editing support through the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/).
- 📊 **Diagram View** that is fully synchronized with the textual model, including automatic layout, multi-notation support and an interactive toolbar.
- 🖨️ **Code Generation** for generating SQL tables from the specified ER model and integrate with existing databases.


## Getting Started

After installation, new ER models can be created in `.erd` files. Refer to the example below to specify a basic ER Model consisting of two entities and a one-to-many relationship.

```java
erdiagram Example
generate=sql

entity Customer {
    id: int key
    name: string
}

entity Order {
    order_number: int key
    price: double
}

relationship Places {
    Customer[1] -> Order[N]
}
```

The diagram can be opened through the button in the editor or right-clicking on the .erd file. See the file at `/src-gen/Example.sql` for the generated SQL code.


## Learn more

See the [GitHub Repository](https://github.com/borkdominik/bigER) and documentation in the [bigER Wiki](https://github.com/borkdominik/bigER/wiki/) to learn more. 
