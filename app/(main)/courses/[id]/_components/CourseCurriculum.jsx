import React from 'react';
import { TabsContent} from "@/components/ui/tabs";

import {
  BookCheck,
  
  Clock,
  FileText,

  Video,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const CourseCurriculum = ({courseDetails,getTotalLessons,getTotalDuration}) => {
  

    return (
        <TabsContent value="curriculum" className="mt-6">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold">Course Curriculum</h3>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <BookCheck className="h-4 w-4" />
                      <span>{courseDetails?.weeks?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{getTotalDuration()}+ Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>{getTotalLessons()} Lessons</span>
                    </div>
                  </div>
                </div>

                <Accordion
                  type="multiple"
                  defaultValue={courseDetails?.weeks?.map((m) => m.id) || []}
                  className="w-full"
                >
                  {courseDetails?.weeks?.map((week) => (
                    <AccordionItem key={week.id} value={week.id} className="border-b border-gray-200 px-0">
                      <AccordionTrigger className="py-4 text-lg font-medium hover:no-underline">
                        {week.title}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 p-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Video className="h-4 w-4" />
                            {week.lessonIds?.length || 0} Lessons
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {Math.ceil(week.duration / 60)} Hours
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            {week.description}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Placeholder for lessons since we don't have actual lesson data */}
                          {Array(week.lessonIds?.length || 0)
                            .fill(0)
                            .map((_, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <Video className="h-4 w-4" />
                                  <span className="text-gray-700">
                                    Lesson {idx + 1}: {week.title} - Part {idx + 1}
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                  Preview
                                </Button>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
    );
};

export default CourseCurriculum;