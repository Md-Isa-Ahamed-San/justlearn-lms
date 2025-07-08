"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {User, Mail, Phone, Calendar, BookOpen, FileText} from "lucide-react";

// Student Details Modal Component
function StudentDetailsModal({student, trigger}) {
    const {studentDetails} = student;

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5"/>
                        Student Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-sm font-medium">{student.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                                    <p className="text-sm font-medium">{studentDetails?.idNumber}</p>
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-4 w-4"/>
                                        Email
                                    </label>
                                    <p className="text-sm">{student.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-4 w-4"/>
                                        Phone
                                    </label>
                                    <p className="text-sm">{studentDetails?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Academic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <BookOpen className="h-4 w-4"/>
                                        Department
                                    </label>
                                    <p className="text-sm">{studentDetails?.department}</p>
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-4 w-4"/>
                                        Session
                                    </label>
                                    <p className="text-sm">{studentDetails?.session}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Course
                                        Participation</label>
                                    <p className="text-sm">{student.participationData}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio Section */}
                    {studentDetails?.bio && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5"/>
                                    Bio
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {studentDetails.bio}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Social Media */}
                    {studentDetails?.socialMedia && Object.keys(studentDetails.socialMedia).some(key => studentDetails.socialMedia[key]) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Social Media</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(studentDetails.socialMedia)
                                        .filter(([platform, url]) => url && url.trim() !== '')
                                        .map(([platform, url]) => (
                                            <div key={platform} className="flex items-center justify-between">
                                                <span className="text-sm font-medium capitalize">{platform}</span>
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    View Profile
                                                </a>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timestamps */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Registration Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                                <strong>Joined:</strong> {new Date(studentDetails?.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <strong>Last
                                    Updated:</strong> {new Date(studentDetails?.updatedAt).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function DataTable({columns, data}) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);

    // React Table instance
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div>
            {/* !MARK: Filter Input */}
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter by Student ID..."
                    value={(table.getColumn("idNumber")?.getFilterValue() ?? "")}
                    onChange={(event) =>
                        table.getColumn("idNumber")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm bg-input border-border text-foreground"
                />
            </div>
            {/*MARK: TABLE CONTENT*/}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* !MARK: Pagination controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

// Export the modal component for use in columns
export {StudentDetailsModal};