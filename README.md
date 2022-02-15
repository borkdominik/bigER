# bigER Modeling Tool

>### *VS Code Extension to create Entity-Relationship (ER) diagrams and generate SQL code with a textual language*

<p align="center">
 <img src="https://raw.githubusercontent.com/borkdominik/bigER/main/extension/media/example.gif" width="75%"/>
</p>


### Features

📝 **Textual Language** to specify model elements and apply ER concepts  
🧠 **Smart Editing** features for the language such as Syntax Highlighting or Auto Complete  
📊 **Diagram View** synchronized with textual changes and elements are laid out automatically  
🎨 **Graphical Interactions** to customize the diagram or modify the underlying model  
🖨️ **Code Generation** to generate SQL statements  

The tool is built based on web technologies and language features are communicated with the [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/). This makes bigER highly reusable and simplifies implementation for other editors that also use the LSP. The language and editor features are realized as a language server with [Xtext](https://www.eclipse.org/Xtext/). [Sprotty](https://github.com/eclipse/sprotty) together with [Sprotty Server](https://github.com/eclipse/sprotty-server) is used to create the diagrams and both connect to VS Code by using [Sprotty VS Code](https://github.com/eclipse/sprotty-vscode). 

[**Download the extension from the VS Code Marketplace**](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram)

---

### Sections

➜ [Quick Example](#quick-example)  
➜ [Getting Started](#getting-started)  
➜ [Build Instructions](#build-instructions)    
➜ [Known Issues](#known-issues)      
➜ [Contributers](#contributors) 

### Wiki

[🏷️ Feature Overview](https://github.com/borkdominik/bigER/wiki/%F0%9F%8F%B7%EF%B8%8F-Feature-Overview)  
[📖 Language Documentation](https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation) 

> ⚠️ The wiki pages are still in progress

</br>   


## Quick Example 

**Textual**

<details>
	<summary><i>university.erd</i> (click to expand)</summary>

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
</details>

**Diagram**

<p align="left">
	<img src="https://user-images.githubusercontent.com/39776671/129263384-6f14718f-efc2-40d8-a398-d9586f033b64.png" width="70%" height="100%"/>
</p>

**Generated SQL Code**

<details>
	<summary><i>university.sql</i> (click to expand)</summary>

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
</details>

## Getting Started

To start using the tool, download the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=BIGModelingTools.erdiagram) or clone this repository (see [Build Instructions](#build-instructions)). 

Open a file ending in `.erd` and refer to the minimal example below to specify a new ER model. The diagram view can then be opened with the button in the editor or from the context menu of the file. 

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

<!-- GIF opening file, pasting example and opening diagram -->

## Build Instructions

The minimum requirements to to build and run the project are:

- [Node.js](https://nodejs.org/en/) runtime
- [yarn](https://yarnpkg.com/) package manager
- [Java](http://jdk.java.net/) (11+)
- [VS Code](https://code.visualstudio.com/) (v1.50+)


Download or clone the repository and in the root folder of the project execute the following commands:

```bash
language-server/gradlew -p language-server/ build   
yarn --cwd webview  
yarn --cwd extension
```

This builds the code for the language server, the webview and the extension. The fastest way to run the extension is to press <kbd>F5</kbd> (or in the menu: <kbd>Run -> Start Debugging</kbd>). This starts a new extension host with the launch configuration provided in `.vscode/launch.json`.

The code is split into a **client side** (extension with webview) and a **server side** (language with LSP and diagram server). It is recommended to use  **VS Code** for the client code, written in *TypeScript* and **Eclipse** for the server side, based on *Java*. Eclipse must be compatible with Xtext and Xtend (e.g. [Eclipse IDE for Java and DSL Developers](https://www.eclipse.org/downloads/packages/release/juno/sr2/eclipse-ide-java-and-dsl-developers)) and create a new workspace to avoid configuration issues. Import the language server as a Gradle project (<kbd>File -> Import -> Existing Gradle Project</kbd>) and override the workspace settings.

## Known Issues

**Fix**
- Code Generator can cause the language server to crash (e.g. weak entities)

**Next steps**

- [ ] New ER concepts - partial/full participation, min-max Notation
- [ ] New Diagram Features - Delete button, Support also renaming attributes and multiplicity
- [ ] Improve Code Generator - Include all ER concepts, button in Diagram, multiple SQL dialects, fix crashes/bugs
- [ ] Improve Layout and Styling (Light/Dark Theme)
- [ ] Improve LSP features

## Contributors

[Philipp-Lorenz Glaser](https://github.com/plglaser) (Main developer)   
[Georg Hammerschmied](https://github.com/SchmiedHammer)  
[Dominik Bork](https://github.com/borkdominik)

[All Contributors](https://github.com/borkdominik/bigER/graphs/contributors)
