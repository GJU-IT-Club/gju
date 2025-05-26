"use professor"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { type Column } from "@tanstack/react-table"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Professor = {
  name: string
  email: string
  office: string
  phone: string
  department: string
  pageLink: string
}

type SortHeaderProps<TData> = {
  column: Column<TData, unknown>
  children: React.ReactNode
}

function SortHeader<TData>({ column, children }: SortHeaderProps<TData>) {
  return (
    <div
      className="flex items-center justify-start gap-1 cursor-pointer p-0 m-0"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span className="text-sm font-medium">{children}</span>
      <ArrowUpDown className="h-4 w-4" />
    </div>
  )
}


export { SortHeader }

export const columns: ColumnDef<Professor>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <SortHeader column={column}>Name</SortHeader>
      )
    },
    cell: ({ row }) => (
    <div className="text-start block">{row.getValue("name")}</div>
  ),
  },    
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <SortHeader column={column}>Email</SortHeader>
      )
    },
    cell: ({ row }) => (
      <div className="text-start">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "office",
    header: ({ column }) => {
      return (
        <SortHeader column={column}>Office</SortHeader>
      )
    },
    cell: ({ row }) => (
      <div className="text-start">{row.getValue("office")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <SortHeader column={column}>Phone</SortHeader>
      )
    },
    cell: ({ row }) => (
      <div className="text-start">{row.getValue("phone")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <SortHeader column={column}>Department</SortHeader>
      )
    },
    cell: ({ row }) => (
      <div className="text-start">{row.getValue("department")}</div>
    ),
  },
  {
    accessorKey: "pageLink",
    header: ({ column }) => {
      return (
        <div className="">Page Link</div>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        <a
          href={row.getValue("pageLink")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          <ExternalLink className="inline h-4 w-4" />
        </a>
      </div>
    ),

  },
]
