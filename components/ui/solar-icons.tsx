"use client";

import type { SVGProps } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

function createSolarIcon(icon: string) {
  return function SolarIcon({ className, ...props }: IconProps) {
    return (
      <IconifyIcon
        icon={icon}
        aria-hidden="true"
        className={cn("inline-block", className)}
        {...(props as Record<string, unknown>)}
      />
    );
  };
}

export const Archive = createSolarIcon("solar:archive-minimalistic-linear");
export const ArrowLeft = createSolarIcon("solar:arrow-left-linear");
export const AlertTriangle = createSolarIcon("solar:danger-triangle-linear");
export const AlertTriangleBold = createSolarIcon("solar:danger-triangle-bold");
export const BarChart3 = createSolarIcon("solar:chart-2-linear");
export const BarChart3Bold = createSolarIcon("solar:chart-2-bold");
export const Bell = createSolarIcon("solar:bell-linear");
export const BookOpen = createSolarIcon("solar:book-2-linear");
export const BookOpenBold = createSolarIcon("solar:book-2-bold");
export const Briefcase = createSolarIcon("solar:case-linear");
export const BriefcaseBold = createSolarIcon("solar:case-bold");
export const Building2 = createSolarIcon("solar:buildings-2-linear");
export const Building2Bold = createSolarIcon("solar:buildings-2-bold");
export const Calendar = createSolarIcon("solar:calendar-linear");
export const CalendarBold = createSolarIcon("solar:calendar-bold");
export const Check = createSolarIcon("solar:check-circle-linear");
export const CheckCircle = createSolarIcon("solar:check-circle-linear");
export const CheckCircleBold = createSolarIcon("solar:check-circle-bold");
export const CheckCircle2 = createSolarIcon("solar:check-circle-linear");
export const ChevronDown = createSolarIcon("solar:alt-arrow-down-linear");
export const ChevronLeft = createSolarIcon("solar:alt-arrow-left-linear");
export const ChevronRight = createSolarIcon("solar:alt-arrow-right-linear");
export const ChevronUp = createSolarIcon("solar:alt-arrow-up-linear");
export const Clock = createSolarIcon("solar:clock-circle-linear");
export const ClockBold = createSolarIcon("solar:clock-circle-bold");
export const Cloud = createSolarIcon("solar:cloud-linear");
export const CloudBold = createSolarIcon("solar:cloud-bold");
export const Circle = createSolarIcon("solar:record-circle-linear");
export const CircleFilled = createSolarIcon("solar:record-circle-bold");
export const ChevronsUpDown = createSolarIcon("solar:sort-linear");
export const Contact = createSolarIcon("solar:user-id-linear");
export const Copy = createSolarIcon("solar:copy-linear");
export const Crown = createSolarIcon("solar:crown-linear");
export const CrownBold = createSolarIcon("solar:crown-bold");
export const DollarSign = createSolarIcon("solar:dollar-linear");
export const DollarSignBold = createSolarIcon("solar:dollar-bold");
export const Download = createSolarIcon("solar:download-linear");
export const FileText = createSolarIcon("solar:document-text-linear");
export const FileTextBold = createSolarIcon("solar:document-text-bold");
export const HelpCircle = createSolarIcon("solar:question-circle-linear");
export const History = createSolarIcon("solar:history-linear");
export const ImagePlus = createSolarIcon("solar:gallery-add-linear");
export const Info = createSolarIcon("solar:info-circle-linear");
export const LayoutDashboard = createSolarIcon("solar:widget-2-linear");
export const LayoutGrid = createSolarIcon("solar:widget-3-linear");
export const List = createSolarIcon("solar:list-linear");
export const Loader2 = createSolarIcon("solar:refresh-circle-linear");
export const Lock = createSolarIcon("solar:lock-linear");
export const LogOut = createSolarIcon("solar:logout-2-linear");
export const MapPin = createSolarIcon("solar:map-point-linear");
export const Megaphone = createSolarIcon("solar:megaphone-linear");
export const Menu = createSolarIcon("solar:hamburger-menu-linear");
export const MenuDotsCircle = createSolarIcon("solar:menu-dots-circle-linear");
export const MessageSquare = createSolarIcon("solar:chat-round-linear");
export const MessageSquareBold = createSolarIcon("solar:chat-round-bold");
export const Mic = createSolarIcon("solar:microphone-3-linear");
export const Monitor = createSolarIcon("solar:monitor-linear");
export const Moon = createSolarIcon("solar:moon-linear");
export const MoreHorizontal = createSolarIcon("solar:menu-dots-linear");
export const Paperclip = createSolarIcon("solar:paperclip-linear");
export const Pencil = createSolarIcon("solar:pen-linear");
export const Play = createSolarIcon("solar:play-linear");
export const Plus = createSolarIcon("solar:add-circle-linear");
export const PlusCircle = createSolarIcon("solar:add-circle-linear");
export const AddSquareBold = createSolarIcon("solar:add-square-bold");
export const Presentation = createSolarIcon("solar:presentation-graph-linear");
export const RefreshCw = createSolarIcon("solar:refresh-linear");
export const RotateCcw = createSolarIcon("solar:refresh-circle-linear");
export const Save = createSolarIcon("solar:diskette-linear");
export const Search = createSolarIcon("solar:magnifer-linear");
export const Send = createSolarIcon("solar:plain-2-linear");
export const Settings = createSolarIcon("solar:settings-linear");
export const Sparkles = createSolarIcon("solar:stars-linear");
export const SparklesBold = createSolarIcon("solar:stars-bold");
export const Star = createSolarIcon("solar:star-linear");
export const StarBold = createSolarIcon("solar:star-bold");
export const Sun = createSolarIcon("solar:sun-2-linear");
export const Trash2 = createSolarIcon("solar:trash-bin-trash-linear");
export const ExternalLink = createSolarIcon("solar:square-top-down-linear");
export const SlidersHorizontal = createSolarIcon("solar:tuning-2-linear");
export const Upload = createSolarIcon("solar:upload-linear");
export const User = createSolarIcon("solar:user-linear");
export const UserBold = createSolarIcon("solar:user-bold");
export const UserMinus = createSolarIcon("solar:user-minus-linear");
export const UserPlus = createSolarIcon("solar:user-plus-linear");
export const UserX = createSolarIcon("solar:user-cross-linear");
export const Users = createSolarIcon("solar:users-group-rounded-linear");
export const UsersBold = createSolarIcon("solar:users-group-rounded-bold");
export const UsersRound = createSolarIcon("solar:users-group-rounded-linear");
export const X = createSolarIcon("solar:close-circle-linear");
export const XCircle = createSolarIcon("solar:close-circle-linear");
export const ThumbsUpDuotone = createSolarIcon("solar:like-bold-duotone");
export const CalendarMinimalisticDuotone = createSolarIcon("solar:calendar-minimalistic-bold-duotone");
export const Zap = createSolarIcon("solar:bolt-linear");
export const ZapBold = createSolarIcon("solar:bolt-bold");
