"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Pencil, GraduationCap } from "lucide-react";
import Link from "next/link";

// This is the definition for the columns in the data table.
// Each object in the array represents a column.
export const columns = [
  {
    // AccessorKey points to the key in the data object for this column.
    // The top-level object from your API has 'name' directly.
    accessorKey: "name",
    // The header is what's displayed in the table's header row.
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    // The email is also at the top level of the data object.
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    // Data from nested objects is accessed using dot notation.
    // This gets 'lessonsViewed' from the 'participationData' object.
    accessorKey: "participationData.lessonsViewed",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lessons Viewed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    // You can add a cell renderer to customize the output.
    // Here, we center the text.
    cell: ({ row }) => {
        const amount = row.getValue("participationData_lessonsViewed");
        return <div className="text-center font-medium">{amount}</div>
    }
  },
  {
    // This gets 'quizzesCompleted' from the 'participationData' object.
    accessorKey: "participationData.quizzesCompleted",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quizzes Completed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const amount = row.getValue("participationData_quizzesCompleted");
        return <div className="text-center font-medium">{amount}</div>
    }
  },
  {
    // This gets 'lastLogin' from the 'participationData' object.
    accessorKey: "participationData.lastLogin",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Login
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    // The 'cell' function allows for custom rendering of the cell's content.
    // Here, we format the ISO date string into a more readable local date.
    cell: ({ row }) => {
      const date = row.getValue("participationData_lastLogin");
      const formatted = new Date(date).toLocaleDateString();
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    // This column is for actions like editing or viewing details.
    id: "actions",
    cell: ({ row }) => {
      // 'original' contains the full data object for the row.
      const { userId } = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
                <Link href={`/teacher/students/${userId}`} className="w-full flex items-center">
                    <Pencil className="h-4 w-4 mr-2" />
                    View Details
                </Link>
            </DropdownMenuItem>
             <DropdownMenuItem>
                <Link href={`/teacher/students/${userId}/progress`} className="w-full flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    View Progress
                </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];