# bigER

Modeling Tool to display ER Diagrams together with a textual editor.

## Contributors
[@Philip-Lorenz Glaser](https://github.com/plglaser)
[@Dominik Bork](https://github.com/borkdominik)

[contributors](https://github.com/borkdominik/bigER/graphs/contributors)

![example](https://raw.githubusercontent.com/borkdominik/bigER/main/extension/media/example.png)


## Features

- Textual Syntax
- Diagram View
- SQL Code Generation

## Example

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

