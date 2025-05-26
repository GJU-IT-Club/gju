import fs from 'fs';
import path from 'path';

interface Course {
  id: string;
  name: string;
  creditHours: number;
  prerequisites: string[];
  corequisites: string[];
  category: string;
  year: number;
}

interface CoursesData {
  courses: Record<string, Partial<Course>>;
}

/**
 * Generates a markdown template for a course
 */
function generateCourseMarkdown(course: Course): string {
  const prereqArray = course.prerequisites && course.prerequisites.length > 0 
    ? `[${course.prerequisites.join(', ')}]`
    : '[]';
  
  const coreqArray = course.corequisites && course.corequisites.length > 0
    ? `[${course.corequisites.join(', ')}]`
    : '[]';

  return `---
id: ${course.id}
name: ${course.name}
creditHours: ${course.creditHours}
prerequisites: ${prereqArray}
corequisites: ${coreqArray}
category: ${course.category}
---

# ${course.name}

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
`;
}

/**
 * Main function to generate course markdown files
 */
async function generateCourseFiles() {
  try {
    // Read the courses metadata
    const coursesDataPath = path.join(process.cwd(), 'src', 'data', 'courses', 'courses-metadata.json');
    const coursesDataRaw = fs.readFileSync(coursesDataPath, 'utf-8');
    const coursesData: CoursesData = JSON.parse(coursesDataRaw);

    // Create courses directory if it doesn't exist
    const coursesDir = path.join(process.cwd(), 'src', 'content', 'courses');
    if (!fs.existsSync(coursesDir)) {
      fs.mkdirSync(coursesDir, { recursive: true });
    }

    let createdCount = 0;
    let skippedCount = 0;

    // Process each course
    for (const [courseId, courseData] of Object.entries(coursesData.courses)) {
      // Skip courses with incomplete data
      if (!courseData.name || !courseData.creditHours) {
        console.log(`⚠️  Skipping ${courseId} - missing required fields (name or creditHours)`);
        skippedCount++;
        continue;
      }

      // Create complete course object with defaults
      const course: Course = {
        id: courseId,
        name: courseData.name,
        creditHours: courseData.creditHours,
        prerequisites: courseData.prerequisites || [],
        corequisites: courseData.corequisites || [],
        category: courseData.category || 'Elective',
        year: courseData.year || 1
      };

      const filePath = path.join(coursesDir, `${courseId}.md`);

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`📄 File already exists: ${courseId}.md - skipping`);
        skippedCount++;
        continue;
      }

      // Generate and write the markdown content
      const markdownContent = generateCourseMarkdown(course);
      fs.writeFileSync(filePath, markdownContent, 'utf-8');
      
      console.log(`✅ Created: ${courseId}.md`);
      createdCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${createdCount} files`);
    console.log(`⏭️  Skipped: ${skippedCount} files`);
    console.log('\n🎉 Course markdown generation completed!');

  } catch (error) {
    console.error('❌ Error generating course files:', error);
    process.exit(1);
  }
}

// Run the script
generateCourseFiles();

export { generateCourseFiles };