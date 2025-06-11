"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

// Other UI components  
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Dropdown components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Alert Dialog components
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
// Mock data for demonstration
const mockCourses = [
  {
    id: 1,
    title: "Introduction to React",
    category: { title: "Programming" },
    user: { name: "John Doe" },
    active: true,
    rating: 4.5,
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    category: { title: "Programming" },
    user: { name: "Jane Smith" },
    active: false,
    rating: 4.8,
  },
  {
    id: 3,
    title: "Data Structures and Algorithms",
    category: { title: "Computer Science" },
    user: { name: "Bob Johnson" },
    active: true,
    rating: 4.2,
  },
  {
    id: 4,
    title: "Web Design Fundamentals",
    category: { title: "Design" },
    user: { name: "Alice Brown" },
    active: true,
    rating: 4.6,
  },
  {
    id: 5,
    title: "Machine Learning Basics",
    category: { title: "AI/ML" },
    user: { name: "Charlie Wilson" },
    active: false,
    rating: 4.3,
  },
  {
    id: 6,
    title: "Database Management",
    category: { title: "Database" },
    user: { name: "Diana Davis" },
    active: true,
    rating: 4.7,
  },
  {
    id: 7,
    title: "Python for Beginners",
    category: { title: "Programming" },
    user: { name: "Edward Miller" },
    active: false,
    rating: 4.4,
  },
  {
    id: 8,
    title: "UX/UI Design",
    category: { title: "Design" },
    user: { name: "Fiona Taylor" },
    active: true,
    rating: 4.9,
  },
  {
    id: 9,
    title: "Cloud Computing",
    category: { title: "Cloud" },
    user: { name: "George Clark" },
    active: true,
    rating: 4.1,
  },
  {
    id: 10,
    title: "Cybersecurity Fundamentals",
    category: { title: "Security" },
    user: { name: "Helen White" },
    active: false,
    rating: 4.5,
  },
  {
    id: 11,
    title: "Mobile App Development",
    category: { title: "Programming" },
    user: { name: "Ian Green" },
    active: true,
    rating: 4.3,
  },
  {
    id: 12,
    title: "Digital Marketing",
    category: { title: "Marketing" },
    user: { name: "Julia Blue" },
    active: true,
    rating: 4.2,
  }
];

export default function CourseTable({ courses = mockCourses }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filteredCache, setFilteredCache] = useState({})
  const [courseData, setCourseData] = useState(courses)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Generate cache key for memoization
  const getCacheKey = useCallback((searchTerm, filterCategory) => {
    return `${searchTerm}_${filterCategory}`;
  }, []);

  // Dynamically get unique categories from the courses data
  const categories = useMemo(() => 
    ["all", ...new Set(courseData.map(course => course.category.title))], 
    [courseData]
  );

  // Filter courses with caching
  const filteredCourses = useMemo(() => {
    const cacheKey = getCacheKey(debouncedSearchTerm, filterCategory);
    
    if (filteredCache[cacheKey]) {
      return filteredCache[cacheKey];
    }

    const filtered = courseData.filter((course) => {
      // Condition for search term
      const matchesSearch =
        course.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        course.user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        course.category.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      // Condition for category filter
      const matchesCategory = filterCategory === "all" || course.category.title === filterCategory;

      return matchesSearch && matchesCategory;
    });

    // Cache the result
    setFilteredCache(prev => ({
      ...prev,
      [cacheKey]: filtered
    }));

    return filtered;
  }, [courseData, debouncedSearchTerm, filterCategory, filteredCache, getCacheKey]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Clear cache when filter changes
  useEffect(() => {
    setFilteredCache({});
  }, [filterCategory]);

  const handleToggleCourseVisibility = (courseId) => {
    setCourseData(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, active: !course.active }
          : course
      )
    );
    setFilteredCache({}); // Clear cache after data change
    console.log("Toggling course visibility:", courseId);
  };

  const handleApproveCourse = (courseId) => {
    setCourseData(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, active: true }
          : course
      )
    );
    setFilteredCache({}); // Clear cache after data change
    console.log("Approving course:", courseId);
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      setCourseData(prev => prev.filter(course => course.id !== itemToDelete.id));
      setFilteredCache({}); // Clear cache after data change
      console.log("Deleting item:", itemToDelete);
    }
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

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
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Manage course visibility and approval status ({filteredCourses.length} total)
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[300px]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Filter</span>
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
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="min-w-[200px] text-left p-4 font-medium">Course</th>
                  <th className="min-w-[150px] text-left p-4 font-medium">Instructor</th>
                  <th className="min-w-[100px] text-left p-4 font-medium">Status</th>
                  <th className="min-w-[100px] text-left p-4 font-medium">Visibility</th>
                  <th className="min-w-[80px] text-left p-4 font-medium hidden sm:table-cell">Rating</th>
                  <th className="text-right min-w-[120px] p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No courses found matching your criteria
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course) => (
                    <tr key={course.id} className={`border-b  ${!course.active ? "opacity-70" : ""}`}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-sm sm:text-base">{course.title}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{course.category.title}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{course.user.name}</div>
                      </td>
                      <td className="p-4">{getCourseStatusBadge(course.active)}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {course.active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{course.rating}</span>
                          <span className="text-yellow-400 ml-1">★</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleCourseVisibility(course.id)}
                          >
                            {course.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          {!course.active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveCourse(course.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setItemToDelete({ id: course.id, name: course.title, type: 'course' });
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCourses.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pt-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses.length)} of{" "}
                  {filteredCourses.length} entries
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">Rows per page:</p>
                  <select 
                    value={pageSize.toString()} 
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="w-16 h-8 px-2 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const showPage = page === 1 || 
                                       page === totalPages || 
                                       Math.abs(page - currentPage) <= 1;
                        return showPage;
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>
                        </div>
                      ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
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