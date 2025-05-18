import type { Course, Roadmap } from "@/lib/types";
import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import PlansFlow from "./PlansFlow";

interface PlansViewProps {
  roadmaps: Roadmap[];
  courses: { [key: string]: Course };
}

const PlansView: React.FC<PlansViewProps> = ({ roadmaps, courses }) => {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>("cs-general-2022-2023");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(
      (roadmap) =>
        searchTerm === "" ||
        roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roadmap.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roadmap.track.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roadmap.version.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roadmaps, searchTerm]);

  const selectedRoadmap = useMemo(
    () => roadmaps.find((r) => r.id === selectedRoadmapId) || null,
    [roadmaps, selectedRoadmapId]
  );
    console.log("Selected Roadmap ID:", selectedRoadmap);

  return (
    <div className="container mx-auto pt-8 max-w-full">
      <div className="mb-6 mt-8 px-6 py-3 bg-sidebar border-b border-border  ">

        {/* Selection Control - Search moved inside */}
        <div className="w-full  md:w-[350px] ">
          <Select
            value={selectedRoadmapId}
            onValueChange={setSelectedRoadmapId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a roadmap" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by major, track, or version..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {filteredRoadmaps.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">
                  No roadmaps found
                </div>
              ) : (
                filteredRoadmaps.map((roadmap) => (
                  <SelectItem key={roadmap.id} value={roadmap.id}>
                    {roadmap.title} ({roadmap.version})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Display selected roadmap */}
      {selectedRoadmap ? 
      // (
      //   <div className="bg-white p-6 rounded-lg border shadow-sm">
      //     <div className="mb-6">
      //       <h2 className="text-2xl font-bold">{selectedRoadmap.title}</h2>
      //       <div className="flex flex-wrap gap-2 mt-2">
      //         <Badge variant="outline">{selectedRoadmap.major}</Badge>
      //         <Badge variant="outline">{selectedRoadmap.version}</Badge>
      //         <Badge variant="outline">{selectedRoadmap.track}</Badge>
      //         <Badge
      //           variant={
      //             selectedRoadmap.dualStudies ? "default" : "secondary"
      //           }
      //         >
      //           {selectedRoadmap.dualStudies ? "Dual Studies" : "Regular"}
      //         </Badge>
      //       </div>
      //     </div>

      //     <h3 className="text-xl font-semibold mb-3">Courses:</h3>
      //     <div className="grid gap-3 md:grid-cols-2">
      //       {selectedRoadmap.courseIds.map((courseId) => {
      //         const course = courses[courseId];
      //         return (
      //           <Card key={courseId} className="overflow-hidden">
      //             <CardContent className="p-4">
      //               <div className="flex justify-between items-start">
      //                 <div>
      //                   <h4 className="font-bold">
      //                     {course?.name || "Unknown Course"}
      //                   </h4>
      //                   <p className="text-sm text-muted-foreground">
      //                     {courseId}
      //                   </p>
      //                 </div>
      //                 {course && <Badge>{course.creditHours} Credits</Badge>}
      //               </div>
      //               {course && (
      //                 <div className="mt-2 text-sm">
      //                   <p>
      //                     <span className="font-medium">Category:</span>{" "}
      //                     {course.category}
      //                   </p>
      //                   {course.prerequisites.length > 0 && (
      //                     <p>
      //                       <span className="font-medium">Prerequisites:</span>{" "}
      //                       {course.prerequisites.join(", ")}
      //                     </p>
      //                   )}
      //                   {course.corequisites.length > 0 && (
      //                     <p>
      //                       <span className="font-medium">Corequisites:</span>{" "}
      //                       {course.corequisites.join(", ")}
      //                     </p>
      //                   )}
      //                 </div>
      //               )}
      //             </CardContent>
      //           </Card>
      //         );
      //       })}
      //     </div>
      //   </div>
      // )
       (

        <PlansFlow/>
      )
      : (
        <div className="text-center p-8 bg-slate-50 rounded-lg border">
          {filteredRoadmaps.length > 0
            ? "Select a roadmap to view details"
            : "No roadmaps match your search criteria"}
        </div>
      )}
    </div>
  );
};

export default PlansView;
