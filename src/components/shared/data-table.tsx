"use client";

import {
  createColumnHelper,
  tableFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableColumnMeta = {
  /** Kelas Tailwind untuk header dan sel kolom (mis. `text-right`). */
  className?: string;
};

// Hanya fitur inti: paginasi, filter, dan pencarian dikerjakan server lewat URL
// (lihat PaginationControls), jadi tabel cukup membangun kolom dan baris.
// Harus berada di module scope agar referensinya stabil antar render.
const features = tableFeatures({ columnMeta: {} as DataTableColumnMeta });

type Features = typeof features;

/** Column helper bertipe untuk DataTable; gunakan di file definisi kolom. */
export function createDataTableColumnHelper<TData extends object>() {
  return createColumnHelper<Features, TData>();
}

export type DataTableColumnDef<TData extends object> = ColumnDef<
  Features,
  TData
>;

type DataTableProps<TData extends object> = {
  /** Harus stabil antar render (module scope atau useMemo). */
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  getRowId: (row: TData) => string;
  className?: string;
};

export function DataTable<TData extends object>({
  columns,
  data,
  getRowId,
  className,
}: DataTableProps<TData>) {
  const table = useTable({ features, columns, data, getRowId });

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.className}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Tidak ada data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
