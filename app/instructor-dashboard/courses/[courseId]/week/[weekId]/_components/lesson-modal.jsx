"use client"
import {IconBadge} from "@/components/icon-badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {LayoutDashboard} from "lucide-react";
import {Eye} from "lucide-react";
import {Video} from "lucide-react";
import {ArrowLeft} from "lucide-react";
import {FileText} from "lucide-react";
import {Settings} from "lucide-react";
import Link from "next/link";
import {LessonTitleForm} from "./lesson-title-form";
import {LessonDescriptionForm} from "./lesson-description-form";
import {LessonAccessForm} from "./lesson-access-form";
import {VideoUrlForm} from "./video-url-form";
import {CourseActions} from "../../../_components/course-action";
import {LessonAttachmentsForm} from "./lesson-attachments-form";
import {LessonOrderForm} from "./lesson-order-form";
import {LessonActiveForm} from "./lesson-active-form";
import {LessonDurationForm} from "./lesson-duration-form";

export const LessonModal = ({
                                open, setOpen, lessonData,
                                onSave,
                                courseId,
                                weekId
                            }) => {
    console.log("init data in lesson modal: ",lessonData)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="sm:max-w-[1200px] w-[95%] max-w-[95vw] overflow-y-auto max-h-[90vh] p-0"
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader className="p-4 sm:p-6 border-b">
                    <DialogTitle className="text-lg sm:text-xl">Edit Lesson</DialogTitle>
                    <DialogDescription className="text-sm">
                        Configure your lesson settings and content.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 sm:p-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <Link
                            href={`/dashboard/courses/${courseId}`}
                            className="flex items-center text-sm hover:opacity-75 transition"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2"/>
                            Back to course setup
                        </Link>
                        <div className="flex justify-end">
                            {/*<CourseActions isActive={lessonData?.active}*/}
                            {/*               courseId={courseId}*/}
                            {/*               weekId={weekId}*/}
                            {/*               lessonId={lessonData?.id}/>*/}
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Basic Settings Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={LayoutDashboard} size="sm"/>
                                    <h2 className="text-lg sm:text-xl font-semibold">Basic Settings</h2>
                                </div>
                                <div className="space-y-4 pl-0 sm:pl-2">
                                    <LessonTitleForm
                                        initialData={lessonData?.title}
                                        courseId={courseId}
                                        weekId={weekId}
                                        lessonId={lessonData?.id}

                                    />
                                    <LessonDescriptionForm
                                        descriptionData={lessonData?.description}
                                        courseId={courseId}
                                        weekId={weekId}
                                        lessonId={lessonData?.id}
                                    />
                                </div>
                            </div>


                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Video Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={Video} size="sm"/>
                                    <h2 className="text-lg sm:text-xl font-semibold">Video Content</h2>
                                </div>
                                <div className="pl-0 sm:pl-2">
                                    <VideoUrlForm
                                        initialData={lessonData?.videoUrl}
                                        courseId={courseId}
                                        weekId={weekId}
                                        lessonId={lessonData?.id}
                                    />
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={FileText} size="sm"/>
                                    <h2 className="text-lg sm:text-xl font-semibold">Lesson Attachments</h2>
                                </div>
                                <div className="pl-0 sm:pl-2">
                                    <LessonAttachmentsForm
                                        initialData={lessonData?.attachments}
                                        courseId={courseId}
                                        lessonId={lessonData?.id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};