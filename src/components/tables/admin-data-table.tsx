import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

export function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  data
}: {
  columns: DataTableColumn<T>[];
  data: T[];
}) {
  return <DataTable columns={columns} data={data} />;
}
