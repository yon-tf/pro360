"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "@/components/ui/solar-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROFESSIONAL_IMPORT_COLUMNS,
  PROFESSIONAL_IMPORT_MOCK_ROWS,
  type ProfessionalImportRow,
} from "@/features/professionals/mock/professionalImport";
import { systemToast } from "@/lib/systemToast";

type ColumnKey = keyof ProfessionalImportRow;

function validateRow(row: ProfessionalImportRow) {
  const errors: Partial<Record<ColumnKey, string>> = {};
  if (!row.firstName.trim()) errors.firstName = "Required";
  if (!row.lastName.trim()) errors.lastName = "Required";
  if (!row.email.trim()) errors.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) errors.email = "Invalid email";
  if (!row.country.trim()) errors.country = "Required";
  if (!row.dialCode.trim()) errors.dialCode = "Required";
  if (!row.phoneNumber.trim()) errors.phoneNumber = "Required";
  if (!row.profession.trim()) errors.profession = "Required";
  if (!row.maximumClients.trim() || Number.isNaN(Number(row.maximumClients))) {
    errors.maximumClients = "Must be a number";
  }
  return errors;
}

function ProfessionalImportReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source");

  const [rows, setRows] = useState<ProfessionalImportRow[]>(() => {
    if (source === "mock") return PROFESSIONAL_IMPORT_MOCK_ROWS;
    return [];
  });
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [rowFilter, setRowFilter] = useState<"all" | "errors" | "clean">("all");

  const errorsByRow = useMemo(
    () =>
      rows.map((row) => {
        return validateRow(row);
      }),
    [rows]
  );

  const hasErrors = useMemo(
    () => errorsByRow.some((rowErrors) => Object.keys(rowErrors).length > 0),
    [errorsByRow]
  );

  const rowErrorCount = useMemo(
    () => errorsByRow.filter((rowErrors) => Object.keys(rowErrors).length > 0).length,
    [errorsByRow]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .map((row, index) => ({
        row,
        rowIndex: index,
        rowErrors: errorsByRow[index] ?? {},
      }))
      .filter(({ row, rowErrors }) => {
        const hasRowErrors = Object.keys(rowErrors).length > 0;
        const filterMatch =
          rowFilter === "all" ||
          (rowFilter === "errors" && hasRowErrors) ||
          (rowFilter === "clean" && !hasRowErrors);
        if (!filterMatch) return false;
        if (!q) return true;
        const content = PROFESSIONAL_IMPORT_COLUMNS.map((col) => String(row[col] ?? "").toLowerCase()).join(" ");
        return content.includes(q);
      });
  }, [rows, errorsByRow, rowFilter, search]);

  function updateCell(rowIndex: number, field: ColumnKey, value: string) {
    setTouched(true);
    setRows((prev) => prev.map((row, idx) => (idx === rowIndex ? { ...row, [field]: value } : row)));
  }

  function handleCancel() {
    router.push("/professionals");
  }

  function handleImport() {
    setTouched(true);
    if (rows.length === 0) {
      systemToast.warning("No rows available to import", "Upload a CSV file before importing.");
      return;
    }
    if (hasErrors) {
      systemToast.error("Import blocked by validation errors", "Fix highlighted rows and try again.");
      return;
    }
    const professionalLabel = rows.length === 1 ? "professional" : "professionals";
    systemToast.success(
      `${rows.length} ${professionalLabel} successfully created`,
      "This action is currently running in mock mode."
    );
    router.push("/professionals");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/professionals">
            <ChevronLeft className="h-4 w-4" />
            Back to professionals
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleImport} disabled={rows.length === 0 || hasErrors}>
            Import to directory
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CSV review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Review and edit uploaded rows before import. This table includes all fields used in the professionals module.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="search"
              placeholder="Search uploaded rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={rowFilter} onValueChange={(v) => setRowFilter(v as "all" | "errors" | "clean")}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rows</SelectItem>
                <SelectItem value="errors">Rows with errors</SelectItem>
                <SelectItem value="clean">Rows without errors</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {rowErrorCount}/{rows.length} rows with errors
            </p>
          </div>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {PROFESSIONAL_IMPORT_COLUMNS.map((column) => (
                    <TableHead key={column} className="whitespace-nowrap">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={PROFESSIONAL_IMPORT_COLUMNS.length} className="py-10 text-center text-sm text-muted-foreground">
                      No uploaded file detected. Use Bulk import CSV from professionals list.
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={PROFESSIONAL_IMPORT_COLUMNS.length} className="py-10 text-center text-sm text-muted-foreground">
                      No rows match the current search/filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map(({ row, rowIndex, rowErrors }) => {
                    return (
                      <TableRow key={`${row.email || "row"}-${rowIndex}`}>
                        {PROFESSIONAL_IMPORT_COLUMNS.map((column) => (
                          <TableCell key={`${rowIndex}-${column}`} className="min-w-[220px] align-top">
                            <Input
                              value={row[column]}
                              onChange={(e) => updateCell(rowIndex, column, e.target.value)}
                              className={rowErrors[column] ? "border-destructive focus-visible:ring-destructive/30" : ""}
                            />
                            {touched && rowErrors[column] && (
                              <p className="mt-1 text-xs text-destructive">{rowErrors[column]}</p>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfessionalImportReviewPage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">Loading review...</div>}>
      <ProfessionalImportReviewContent />
    </Suspense>
  );
}
