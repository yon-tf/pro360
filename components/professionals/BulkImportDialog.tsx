"use client";

import type { RefObject } from "react";
import { Download, Upload } from "@/components/ui/solar-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BulkImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importFileInputRef: RefObject<HTMLInputElement | null>;
  onDownloadTemplateCsv: () => void;
  onDropUpload: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
};

export function BulkImportDialog({
  open,
  onOpenChange,
  importFileInputRef,
  onDownloadTemplateCsv,
  onDropUpload,
  onFileInputChange,
  onCancel,
}: BulkImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk import professionals (CSV)</DialogTitle>
          <DialogDescription>
            Upload a CSV file to continue to review on a separate page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onDownloadTemplateCsv}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Download className="h-4 w-4" />
            Download CSV template
          </button>
          <div
            className="rounded-lg border-2 border-dashed border-primary/40 bg-muted/10 p-8 text-center cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => importFileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropUpload}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                importFileInputRef.current?.click();
              }
            }}
            aria-label="Upload CSV by drag and drop or file picker"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drag and drop your CSV here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse files
            </p>
            <input
              ref={importFileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileInputChange}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Mock interaction: after upload, you will be redirected to a review page.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
