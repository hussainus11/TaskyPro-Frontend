import { Inbox } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

interface TableSkeletonRowsProps {
  columnCount: number;
  rowCount?: number;
}

export function TableSkeletonRows({ columnCount, rowCount = 5 }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columnCount }).map((_, cellIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
              <Skeleton className="h-5 w-full max-w-40" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface TableEmptyRowProps {
  colSpan: number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function TableEmptyRow({
  colSpan,
  title = "No results found",
  description = "There's nothing to show here yet.",
  icon,
  action
}: TableEmptyRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-48 text-center">
        <Empty className="border-0 p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">{icon ?? <Inbox />}</EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          {action}
        </Empty>
      </TableCell>
    </TableRow>
  );
}
