# bigER - VS Code Extension

Tool to conceptualize Entity-Relationship (ER) models and create diagrams in VS Code with a textual language. 

<!-- DEMO GIF -->


## Features

- 📝 **Textual Language** to specify model elements and apply ER concepts 
- 🧠 **Smart Editing** features for the language such as Syntax Highlighting or Auto Complete
- 📊 **Diagram View** synchronized with textual changes and elements are laid out automatically
- 🎨 **Graphical Interactions** to customize the diagram or modify the underlying model
- 🖨️ **Code Generation** to generate SQL statements


## Getting Started

Open a file ending in `.erd` and refer to the basic example below to specify a new ER model. The diagram view can then be opened with the button in the editor or from the context menu of the file. 

*example.erd*
```
erdiagram Example
generateSql

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

> The first line always has to include the `erdiagram` keyword followed by a name.

The `generateSql` keyword in line 2 is optional and can be used to generate SQL statements. The ER model has to be valid and a *src-gen* folder will be created containing the generated code. 

A more complete example can be found [here](https://github.com/borkdominik/bigER/blob/main/examples/university.erd).

## Learn more

See the [GitHub repository](https://github.com/borkdominik/bigER) for more information.


The [Wiki](https://github.com/borkdominik/bigER/wiki) includes the following topics:

- [🏷️ Feature Overview](https://github.com/borkdominik/bigER/wiki/%F0%9F%8F%B7%EF%B8%8F-Feature-Overview)
- [📖 Language Documentation](https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation) 
