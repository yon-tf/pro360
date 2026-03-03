"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { professionalProfiles } from "@/lib/mock/professionalProfiles";
import { getMergedProfessionalProfiles } from "@/lib/mock/professionalProfileStore";
import { ProfessionalForm } from "../../../ProfessionalForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "@/components/ui/solar-icons";
import { useBreadcrumb } from "@/components/BreadcrumbContext";

export default function EditProfessionalPage() {
  const { id } = useParams<{ id: string }>();
  const [profiles, setProfiles] = useState(professionalProfiles);
  const [profilesReady, setProfilesReady] = useState(false);
  const profile = profiles.find((p) => p.id === id);
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setProfiles(getMergedProfessionalProfiles(professionalProfiles));
    setProfilesReady(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    setItems([
      { label: "Professionals", href: "/professionals" },
      { label: `${profile.firstName} ${profile.lastName} (${profile.id})`, href: `/professionals/${profile.id}/profile` },
      { label: "Edit Profile" },
    ]);
  }, [profile, setItems]);

  if (!profile && !profilesReady) {
    return <div className="text-sm text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/professionals"><ChevronLeft className="h-4 w-4" />Back to list</Link>
        </Button>
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return <ProfessionalForm profile={profile} mode="edit" />;
}
