# bigER - VS Code Extension

Tool to conceptualize Entity-Relationship (ER) models and create diagrams in VS Code with a textual language. 

<!-- GIF OF DEMO -->
<img src="https://raw.githubusercontent.com/borkdominik/bigER/main/extension/media/exampleComplete.png" />


**Features**

- 📝 **Textual Language** to specify model elements and apply ER concepts 
- 🧠 **Smart Editing** features for the language such as Syntax Highlighting or Auto Complete
- 📊 **Diagram View** synchronized with textual changes and elements are laid out automatically
- 🎨 **Graphical Interactions** to customize the diagram or modify the underlying model
- 🖨️ **Code Generation** to generate SQL statements

[Download the extension from the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram)


**Details**

The tool is built based on web technologies and is realized in a client-server architecture. The server
side is implemented with [Xtext](https://www.eclipse.org/Xtext/), providing a language server that communicates with VS Code through the [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/). The client side contains the webview with a [Sprotty](https://github.com/eclipse/sprotty) diagram and the extension code based on [Sprotty for VS Code](https://github.com/eclipse/sprotty-vscode).

**Repository Structure**

[Example](#example)  
[Getting started](#getting-started)  
[Build Instructions](#build-instructions)    
[Known Issues](#known-issues)   
[Planned Features](#planned-features)      
[Contributers](#contributors) 


**Wiki**

[🏷️ Feature Overview](https://github.com/borkdominik/bigER/wiki/%F0%9F%8F%B7%EF%B8%8F-Feature-Overview)  
[📖 Language Documentation](https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation) 


----


## Example 

### Textual

```
erdiagram University
generateSql

entity Person {
    full_name: string key
    birthday: datetime
    age: int derived
}

entity Student extends Person {
    matr_nr: int key
    undergraduate: boolean
}

entity Course {
    course_id: int key
    title: string
}

weak entity Lecture {
    lect_nr: int partial-key
}

weak relationship contains {
    Course[1] -> Lecture[N]
}

entity Professor extends Person {
    pers_nr: int key
}

entity Publication {
    pub_id: int key
    title: string
    research_area: string optional
}

relationship takes_exam {
    Course[N] -> Professor[1] -> Student[N]
    points: double
}

relationship publishes {
    Publication[N] -> Professor[N]
}
```

### Diagram

<img src="https://user-images.githubusercontent.com/39776671/129263384-6f14718f-efc2-40d8-a398-d9586f033b64.png" style="zoom:450%;" />

### Generated SQL Code

```sql
CREATE TABLE Person (
	full_name varchar(255) NOT NULL, 		
	birthday datetime NOT NULL		
	
	PRIMARY KEY (full_name)
);

CREATE TABLE Student (
	undergraduate bit NOT NULL, 		
	matr_nr int NOT NULL		
	full_name varchar(255)
	
	PRIMARY KEY (matr_nr)
	FOREIGN KEY (full_name) REFERENCES Person(full_name)
);

CREATE TABLE Course (
	title varchar(255) NOT NULL, 		
	course_id int NOT NULL		
	
	PRIMARY KEY (course_id)
);

CREATE TABLE Professor (
	pers_nr int NOT NULL		
	full_name varchar(255)
	
	PRIMARY KEY (pers_nr)
	FOREIGN KEY (full_name) REFERENCES Person(full_name)
);

CREATE TABLE Publication (
	title varchar(255) NOT NULL, 		
	research_area varchar(255),  		
	pub_id int NOT NULL		
	
	PRIMARY KEY (pub_id)
);

CREATE TABLE Lecture ( 
	lect_nr int NOT NULL		
	course_id int NOT NULL
	
	PRIMARY KEY (lect_nr, course_id)
	FOREIGN KEY (course_id) REFERENCES Course(course_id) 
		ON DELETE CASCADE
);

CREATE TABLE takes_exam (
	course_id int,
	CONSTRAINT fk_course_id FOREIGN KEY (course_id)
		REFERENCES Course(course_id),
	pers_nr int,
	CONSTRAINT fk_pers_nr FOREIGN KEY (pers_nr)
		REFERENCES Professor(pers_nr)
	matr_nr int,
	CONSTRAINT fk_matr_nr FOREIGN KEY (matr_nr)
		REFERENCES Student(matr_nr)
);

CREATE TABLE publishes (
	pub_id int,
	CONSTRAINT fk_pub_id FOREIGN KEY (pub_id)
		REFERENCES Publication(pub_id),
	pers_nr int,
	CONSTRAINT fk_pers_nr FOREIGN KEY (pers_nr)
		REFERENCES Professor(pers_nr)
);
```

## Getting Started

To start using the tool, download the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram) or clone this repository, see [Build Instructions](#build-locally). 

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
<!-- GIF opening file, pasting example and opening diagram -->

## Build Instructions

Download or clone the repository and in the root folder of the project execute the following commands:

```bash
language-server/gradlew -p language-server/ build   
yarn --cwd webview  
yarn --cwd extension
```

This builds the code for the language server, the webview and the extension. To run the extension press `F5` or click on `Run -> Start Debugging` within VS Code.

## Known Issues

- generateSql sometimes crashes the language server
- Weak Entity Code Generation contains bugs

## Planned Features

- [ ] Support Partial/Full Participation
- [ ] Improved Layout
- [ ] Delete Entities/Relationships in Diagram
- [ ] Rename Attributes in Diagram

## Contributors

[Philipp-Lorenz Glaser](https://github.com/plglaser) (Main developer),   
[Dominik Bork](https://github.com/borkdominik)

[All Contributors](https://github.com/borkdominik/bigER/graphs/contributors)
