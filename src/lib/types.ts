export interface Roadmap {
  id: string;
  title: string;
  major: string;
  version: string;
  track: string;
  courseIds: string[];
  dualStudies: boolean;
}
export interface Course {
  id: string;
  name: string;
  creditHours:number;
  prerequisites: string[];
  corequisites: string[];
  category: string;
  year: number;
}
