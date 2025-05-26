# How to write content for Course Resources

Go to `src/content/courses/` and find the course you want to write content for.

## File Structure

Each generated course file follows this structure:

```md
---
id: CS117
name: Object-Oriented Programming
creditHours: 3
prerequisites: [CS116] 
corequisites: []
category: Prog Req
---

# Object-Oriented Programming

## Course Description
<Description>

---

## Course Content

### Notes
- [Link Title](https://link.com)

### Past Papers
- [Link Title](https://link.com)

### External Resources
- [Video Title](https://link.com)
```

## Team Instructions

### 1. Course Description
Replace `<Description>` with a comprehensive course description including:
- **What the course covers** (main topics)
- **Learning objectives** (what students will learn)
- **Prerequisites knowledge** (what students should know before taking this course)
- **Course format** (lectures, labs, projects, etc.)

**Example:**
```md
## Course Description
This course introduces the concepts of object-oriented programming (OOP) using Java. Students will learn to design and implement classes, understand inheritance and polymorphism, and develop applications using OOP principles. The course includes both theoretical concepts and practical programming exercises.

```

### 2. Course Content Sections

#### Notes Section
Add links to course notes, lecture slides, and study materials:
```md
### Notes
- [Chapter 1: Introduction to OOP](https://drive.google.com/...)
- [Lecture Slides - Week 1-4](https://drive.google.com/...)
- [Java Syntax Reference](https://docs.oracle.com/javase/tutorial/)
- [Class Design Guidelines](https://drive.google.com/...)
```

#### Past Papers Section
Add links to previous exams, quizzes, and sample questions:
```md
### Past Papers
- [Midterm Exam 2023](https://drive.google.com/...)
- [Final Exam 2023](https://drive.google.com/...)
- [Quiz Collection](https://drive.google.com/...)
- [Sample Programming Problems](https://drive.google.com/...)
```

#### External Resources Section
Add helpful external links like videos, tutorials, and documentation:
```md
### External Resources
- [Java OOP Tutorial - Oracle](https://docs.oracle.com/javase/tutorial/java/concepts/)
- [OOP Concepts Explained - YouTube](https://youtube.com/...)
- [JavaFX Tutorial Series](https://youtube.com/...)
- [Design Patterns in Java](https://refactoring.guru/design-patterns/java)
```

## Content Guidelines

### Link Formatting
- Use descriptive link titles
- Prefer official documentation when available
- Include video duration for video links: `[OOP Basics (15 min)](https://youtube.com/...)`
- Group similar resources together

### Content Organization
- Keep descriptions concise but informative
- Use bullet points for learning objectives
- Order resources by importance/relevance
- Include both beginner and advanced resources when applicable

### Quality Checklist
- [ ] Course description is comprehensive and accurate
- [ ] Learning objectives are specific and measurable
- [ ] All links are working and accessible
- [ ] Content is relevant to the course level (year 1-4)
- [ ] Resources cover different learning styles (visual, reading, practice)

## Categories Explanation

- **Uni Req**: University Requirements (Arabic, English, Military Science, etc.)
- **School Req**: School of Engineering Requirements (Math, Physics, etc.)
- **Prog Req**: Program Requirements (Core CS courses)
- **Track Req**: Track-specific Requirements (specialization courses)
- **School Elective**: School-level elective courses
- **Elective**: General elective courses
- **Language**: Foreign language courses

## Support

If you encounter any issues:
1. Check that the course exists in `courses-metadata.json`
2. Verify the file wasn't already created
3. Contact the development team for script issues
4. Refer to existing course files (CS116, CS117, CS1160) as examples