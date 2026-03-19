export interface Notification {
  id: string;
  type: "profile_update" | "on_leave" | "learn_activity" | "upcoming_event";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

const now = new Date();
function hoursAgo(h: number) {
  return new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
}
function minsAgo(m: number) {
  return new Date(now.getTime() - m * 60 * 1000).toISOString();
}

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "upcoming_event",
    title: "Townhall starting soon",
    body: "Monthly Townhall starts in 30 minutes. 12 professionals expected.",
    timestamp: minsAgo(5),
    read: false,
    href: "/appointments",
  },
  {
    id: "n2",
    type: "profile_update",
    title: "Profile updated",
    body: "Benjamin Kow Meng Ah updated their biography and specialisations.",
    timestamp: minsAgo(42),
    read: false,
    href: "/professionals/1/profile",
  },
  {
    id: "n3",
    type: "on_leave",
    title: "TFP on leave",
    body: "Dr. Rachel Tan is on leave from 28 Feb – 5 Mar (Personal).",
    timestamp: hoursAgo(1),
    read: false,
    href: "/professionals/3/profile",
  },
  {
    id: "n4",
    type: "learn_activity",
    title: "Module completed",
    body: "Sarah Lim completed \"CBT Fundamentals\" with a score of 92%.",
    timestamp: hoursAgo(2),
    read: true,
    href: "/lms",
  },
  {
    id: "n5",
    type: "learn_activity",
    title: "Module started",
    body: "James Wong started \"Trauma-Informed Care Essentials\".",
    timestamp: hoursAgo(3),
    read: true,
    href: "/lms",
  },
  {
    id: "n6",
    type: "profile_update",
    title: "Profile updated",
    body: "Sarah Lim updated their check-in times and languages.",
    timestamp: hoursAgo(5),
    read: true,
    href: "/professionals/2/profile",
  },
  {
    id: "n7",
    type: "upcoming_event",
    title: "Pod Workshop tomorrow",
    body: "Team A Workshop scheduled for tomorrow at 10:00 AM.",
    timestamp: hoursAgo(6),
    read: true,
    href: "/appointments",
  },
  {
    id: "n8",
    type: "on_leave",
    title: "TFP returning from leave",
    body: "James Wong returns from leave today.",
    timestamp: hoursAgo(8),
    read: true,
    href: "/professionals/4/profile",
  },
];

export function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
