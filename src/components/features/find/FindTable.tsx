import { type Professor, columns } from "./column"
import { DataTable } from "./data-table"
import data from "@/data/professors/professors.json"

export default async function DemoPage() {
  

  return (
    <div className=" container mx-auto pb-10 ">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
