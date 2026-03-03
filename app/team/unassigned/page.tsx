"use client";

import { useMemo } from "react";
import Link from "next/link";
import { pods } from "@/lib/mock/pods";
import { professionals } from "@/lib/mock/professionals";
import { tfpIdToProId } from "@/lib/mock/professionalProfiles";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/TablePagination";
import { useState } from "react";
import { ChevronLeft } from "@/components/ui/solar-icons";

const PAGE_SIZE = 10;

export default function UnassignedTfpPage() {
  const [page, setPage] = useState(1);

  const unassigned = useMemo(() => {
    const assignedIds = new Set<string>();
    pods.forEach((pod) => pod.members.forEach((m) => assignedIds.add(m.tfpId)));
    return professionals.filter(
      (p) => p.status === "Active" && !assignedIds.has(p.id)
    );
  }, []);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return unassigned.slice(start, start + PAGE_SIZE);
  }, [unassigned, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/team">
            <ChevronLeft className="h-4 w-4" />
            Back to pod list
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Unassigned ThoughtFull Professionals
        </h2>
        <p className="text-sm text-muted-foreground">
          Active TFPs who are not currently assigned to any pod. Assign them from a pod&apos;s detail page (Add members).
        </p>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/pro360/${tfpIdToProId(p.id)}`}
                        className="text-primary hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{p.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {"phone" in p ? String(p.phone ?? "—") : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {"email" in p ? String(p.email ?? "—") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === "Active" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              total={unassigned.length}
              pageSize={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              onPageSizeChange={() => {}}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
