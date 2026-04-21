import { getDesignLanguageColorTokenGroups } from "@/features/docs/design-token-introspection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function PreviewSwatch({ tokenExpr }: { tokenExpr: string }) {
  return (
    <div className="flex items-center justify-end">
      <div
        className="h-6 w-10 rounded-md border border-border"
        style={{ backgroundColor: tokenExpr }}
        aria-label="Token preview"
      />
    </div>
  );
}

export function DesignLanguageTokenTable() {
  const groups = getDesignLanguageColorTokenGroups();
  if (!groups.length) return null;

  return (
    <section className="my-4 space-y-4">
      {groups.map((group) => (
        <Card key={group.groupKey} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{group.label} tokens</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semantic token</TableHead>
                  <TableHead>CSS var</TableHead>
                  <TableHead>Light</TableHead>
                  <TableHead>Dark</TableHead>
                  <TableHead className="text-right">Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.rows.map((row) => (
                  <TableRow key={row.semanticKey}>
                    <TableCell className="font-mono text-xs text-foreground">{row.semanticKey}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.cssVar ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.lightValue ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.darkValue ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <PreviewSwatch tokenExpr={row.tokenExpr} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

