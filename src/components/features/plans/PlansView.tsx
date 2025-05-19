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
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(
    "cs-general-2022-2023"
  );
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

  // Filter courses based on the selected roadmap
  const filteredCourses = useMemo(() => {
    if (!selectedRoadmap || !selectedRoadmap.courseIds) {
      return {};
    }

    // Create a new object containing only courses from the selected roadmap
    return Object.fromEntries(
      Object.entries(courses).filter(([courseId]) =>
        selectedRoadmap.courseIds.includes(courseId)
      )
    );
  }, [selectedRoadmap, courses]);

  console.log("Selected Roadmap ID:", selectedRoadmap);
  console.warn("Selected Roadmap Courses:", filteredCourses);

  return (
    <div className="container flex flex-col mx-auto max-w-full  ">
      <div className="flex px-6 py-3 bg-sidebar border-b border-border">
        {/* Selection Control */}
        <div className="w-full md:w-[350px]">
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

      {selectedRoadmap ? (
        <div className=" flex flex-col  h-[calc(100vh-120px)]">
          <PlansFlow roadmap={selectedRoadmap} courses={filteredCourses} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-background rounded-lg border">
            {filteredRoadmaps.length > 0
              ? "Select a roadmap to view details"
              : "No roadmaps match your search criteria"}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansView;
