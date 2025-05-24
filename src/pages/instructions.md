gju.app, a platform that solves many solutions students face, one of those solution is calculating gpa, you're tasked with creating the only gpa calculator that they'll ever need, because you're a senior frontend engineer.

Techstack includes:
- Astro with React
- Tailwind for styling and Shadcn
- phosphor Icons for Astro stuff, and lucide for Icons in react components

The project has local-first approach, and uses local Storage.

## GPA Feature Description
This feature consists of 3 sub-features:
1. Semester GPA calculator
2. Cumulative GPA
3. GPA Increase

Our Uni uses a GPA on scale of hundred for both semester and CUmulative GPA.

- Users should be able to calculate Semester GPA and see the result of theirs.
- Users can create new Semesters to add courses to them and their Credit Hours & grades
- Users should be able to modify semsesters and their values, and the Cumulative GPA should update based on that.
- Users should be able to see the cumulative result as they calculate new Semester GPA.
- Users should be able to see what new Semester GPA they should get based on the GPA increase they want.
- Users should be able to refresh the page and still get their data back.

All requirements should fit one page.
- The page should have all semster GPA sub-feature components.
- the Cumulative GPA, and grade (good, excellent, ...) should be visible always on the top of feature view.
- the GPA increase should be a button that opens a modal with all of its content.

IMPORTANT: 
- USE ONLY SHADCN components for UI. Don't play with any CSS, use only SHADCN AS I WILL CHANGE THE STYLING OF EVERYTHING LATER.
- FOR ANYTHING THAT SOMEHOW NEEDS STYLING, USE ONLY THE CSS VARIABLES OF SHADCN.
- Implement this in react.

## GPA Grades Categories
- Excellent: 84 and above.
- Very Good: 74-83
- Good: 64-73
- Poor: Below 64

## Example User Journey
1. User goes to the GPA Calculator page from the Sidebar.
2. User adds a new Semester, and names it "First 2025/2026".
3. User starts adding his courses & his GPA.
	1. Calculus I, 3 Cr. hrs, 88
	2. Data Structures, 3 Cr. hrs, 90
	3. OOP, 3 Cr. hrs, 70
	4. OOP Lab, 1 Cr. hrs, 100
4. User clicks calculate, then he sees his Semester GPA, and his Cumulative GPA gets updated with the grade.
5. User tries to refresh the page, all of his data stay the same
6. User clicks on the button that says GPA Increase, he sees his current cumulative GPA, inputs his desired Cumulative GPA, then clicks calculate, and he gets the Semester GPA that he should get in the next semester.