"use client"

import { useState } from "react"
import { Search, Filter, Download, MoreHorizontal, Edit, Trash2, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CourseTable({ courses }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all") // State for the category filter
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const handleToggleCourseVisibility = (courseId) => {
    console.log("Toggling course visibility:", courseId)
    // Implement visibility toggle logic here
  }

  const handleApproveCourse = (courseId) => {
    console.log("Approving course:", courseId)
    // Implement course approval logic here
  }

  const handleDeleteItem = () => {
    console.log("Deleting item:", itemToDelete)
    // Implement delete logic here
    setShowDeleteDialog(false)
    setItemToDelete(null)
  }
  
  // Dynamically get unique categories from the courses data
  const categories = ["all", ...new Set(courses.map(course => course.category.title))];

  const getCourseStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Published
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Draft
      </Badge>
    )
  }

  const filteredCourses = courses.filter((course) => {
      // Condition for search term
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Condition for category filter
      const matchesCategory = filterCategory === "all" || course.category.title === filterCategory;

      return matchesSearch && matchesCategory;
    }
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Manage course visibility and approval status</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full md:w-[300px]"
                />
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map((category) => (
                         <DropdownMenuItem 
                            key={category} 
                            onClick={() => setFilterCategory(category)}
                            className="capitalize"
                        >
                            {category}
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-muted-foreground">{course.category.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>{course.user.name}</TableCell>
                  <TableCell>{getCourseStatusBadge(course.active)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {course.active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Eye className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>⭐ {course.rating}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {!course.active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveCourse(course.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleCourseVisibility(course.id)}
                        className={
                          course.active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                        }
                      >
                        {course.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setItemToDelete({ type: "course", id: course.id, name: course.title })
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Course
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type} "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}