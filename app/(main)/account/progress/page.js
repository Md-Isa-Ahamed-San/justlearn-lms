import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { db } from "@/lib/prisma";
import { ArrowRight, CheckCircle, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getUsersProgress(userId) {
    const courses = await db.course.findMany({
        where: {
            courseProgress: {
                some: {
                    userId: userId
                }
            }
        },
        include: {
            courseProgress: {
                where: { userId: userId }
            },
            weeks: {
                include: {
                    lessons: true,
                    quizzes: true
                }
            },
            instructor: {
                include: {
                    user: true
                }
            }
        }
    });
    return courses;
}

export default async function AccountProgressPage() {
    const user = await getLoggedInUser();

    if (!user) redirect("/login");

    const courses = await getUsersProgress(user.id);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Progress</h1>
                <p className="text-muted-foreground">
                    Track your learning journey across all courses.
                </p>
            </div>

            <div className="space-y-4">
                {courses.length > 0 ? (
                    courses.map(course => {
                        const progress = course.courseProgress[0];
                        
                        // Calculate stats
                        const totalLessons = course.weeks.reduce((acc, week) => acc + week.lessons.length, 0);
                        const totalQuizzes = course.weeks.reduce((acc, week) => acc + week.quizzes.length, 0);
                        const totalItems = totalLessons + totalQuizzes;
                        
                        const completedLessons = progress?.completedLessons || 0;
                        const completedQuizzes = progress?.completedQuizzes || 0;
                        const completedItems = completedLessons + completedQuizzes;
                        
                        const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                        const lastActivity = progress?.lastActivityDate ? new Date(progress.lastActivityDate).toLocaleDateString() : 'Never';

                        return (
                            <Card key={course.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Course Thumbnail */}
                                        <div className="w-full md:w-64 h-40 flex-shrink-0">
                                            <img 
                                                src={course.thumbnail || "/placeholder-course.jpg"} 
                                                alt={course.title}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Course Details */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-xl">{course.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Instructor: {course.instructor?.user?.name}
                                                    </p>
                                                </div>
                                                {progress?.status === 'completed' ? (
                                                    <Badge variant="success" className="bg-green-100 text-green-700">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        {progress?.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{percent}% Complete</span>
                                                    <span className="text-muted-foreground">{completedItems}/{totalItems} Items</span>
                                                </div>
                                                <Progress value={percent} className="h-2" />
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <PlayCircle className="w-4 h-4" />
                                                    {totalLessons} Lessons
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    Last active: {lastActivity}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Link href={`/courses/${course.id}`}>
                                                    <Button variant="default" className="gap-2">
                                                        {progress?.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                        <h3 className="text-lg font-medium">No courses found</h3>
                        <p className="text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet.</p>
                        <Link href="/courses">
                            <Button>Browse Courses</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
