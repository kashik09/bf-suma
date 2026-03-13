import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  className
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-slate-200 bg-white", className)}>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
                key={String(column.key)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, index) => (
            <tr className="text-sm text-slate-700" key={index}>
              {columns.map((column) => (
                <td className="px-4 py-3" key={String(column.key)}>
                  {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
