export interface Roadmap {
  id: string;
  title: string;
  major: string;
  version: string;
  track: string;
  courseIds: string[];
  dualStudies: boolean;
}
export type Course = {
  id: string;
  name: string;
  creditHours: number;
  prerequisites: string[];
  corequisites: string[];
  category:
    | "Uni Req"
    | "School Req"
    | "Prog Req"
    | "Track Req"
    | "School Elective"
    | "Elective"
    | "Language";
  year: number;
};
