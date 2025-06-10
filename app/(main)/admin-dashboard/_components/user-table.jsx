"use client"

import { useState } from "react"
import {
  Search, Filter, Download, MoreHorizontal, Edit, Trash2, CheckCircle,
  XCircle, UserX, UserCheck
} from "lucide-react"

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"

import {
  Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"

export default function UserTable({ users }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const handleApproveUser = (userId) => {
    console.log("Approving user:", userId)
  }

  const handleRejectUser = (userId) => {
    console.log("Rejecting user:", userId)
  }

  const handleToggleUserStatus = (userId) => {
    console.log("Toggling user status:", userId)
  }

  const handleDeleteItem = () => {
    console.log("Deleting item:", itemToDelete)
    setShowDeleteDialog(false)
    setItemToDelete(null)
  }

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  const filteredUsers = users.filter((user) => {
    const department = user.student?.department || user.instructor?.department || user.admin?.department || ""
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  const getUserStatusBadge = (user) => {
    if (!user.isActive) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactive</Badge>
    }
    if (user.role === "instructor" && user.createdAt === user.updatedAt) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage all platform users and their permissions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[300px]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterRole("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole("student")}>Student</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole("instructor")}>Instructor</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRole("admin")}>Admin</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">User</TableHead>
                  <TableHead className="min-w-[100px]">Role</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Department</TableHead>
                  <TableHead className="min-w-[150px]">Status</TableHead>
                  <TableHead className="min-w-[100px] hidden md:table-cell">Join Date</TableHead>
                  <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                          <AvatarImage src={user.image || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{user.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        {user.student?.department || user.instructor?.department || user.admin?.department || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">{getUserStatusBadge(user)}</div>
                        {(user.instructor?.designation || user.admin?.designation) && (
                          <div className="text-xs text-muted-foreground">
                            {user.instructor?.designation || user.admin?.designation}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          ID: {user.student?.idNumber || user.instructor?.idNumber || user.admin?.idNumber || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">{formatDate(user.createdAt)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {user.status === "pending" && user.role === "instructor" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveUser(user.id)}
                              className="text-green-600 hover:text-green-700 p-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectUser(user.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`p-2 ${user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}`}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setItemToDelete({ type: "user", id: user.id, name: user.name })
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type} "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
