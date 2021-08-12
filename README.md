# bigER Tool

The bigER Tool is an extension for VS Code to display ER Diagrams with the help of a textual syntax. The textual syntax supports entities, relationships and attributes, together with additional concepts. The corresponding diagram is laid out automatically and includes various user interactions. There is also an option to generate SQL Code out of a textual model.

## Build locally

Download or clone the repository and in the root folder of the project execute the following commands:

```bash
language-server/gradlew -p language-server/ build   
yarn --cwd webview  
yarn --cwd extension
```

To start running the extension press `F5` or `Run -> Start Debugging` inside VS Code.



## Features

\-



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



## SQL Code Generation

The bigER Tool allows to generate SQL Code out of the specified ER model. To enable code generation use the `generateSql` option in the textual model, this also adds additional [constraints and validation](###Constraints and Validation) to the model. Once the option is set a new folder `src-gen` is created, including the file with the generated SQL tables. 

### Constraints and Validation

- Strong entities require a primary key attribute 
- Weak entities require a partial key attribute and the relationship to the strong entity also has to be specified as a `weak relationship`
- Derived attributes are not included in the created tables
- If no datatype is set for an attribute, `varchar(255)` is being used as the default datatype. 

## Planned Features

- [ ] Support Partial/Full Participation
- [ ] Improved Layout
- [ ] Delete Entities/Relationships in Diagram
- [ ] Rename Attributes in Diagram

## Known Issues

- Weak Entity Code Generation contains bugs