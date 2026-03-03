"use client";

import Link from "next/link";
import { LayoutDashboard, MoreHorizontal, Pencil, User } from "@/components/ui/solar-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfessionalRowActions({ professionalId }: { professionalId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          aria-label="Open actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/professionals/${professionalId}/profile`}
            onClick={(e) => e.stopPropagation()}
          >
            <User className="h-4 w-4" />
            View Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/pro360/${professionalId}`}
            onClick={(e) => e.stopPropagation()}
          >
            <LayoutDashboard className="h-4 w-4" />
            View Pro360
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/professionals/${professionalId}/profile/edit`}
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
