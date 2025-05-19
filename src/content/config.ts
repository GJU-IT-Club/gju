import { defineCollection, reference, z } from "astro:content";
import { glob, file } from "astro/loaders"; // Not available with legacy API


const courseContent = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/courses" }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    creditHours: z.number(),
    prerequisites: z.array(z.string()).optional(),
    corequisites: z.array(z.string()).optional(),
    category: z.enum(["Program", "Track", "Elective"]),
  }),
});

export const collections = { courseContent };
