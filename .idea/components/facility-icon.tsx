import { Droplets, Users, Dumbbell, LucideIcon } from "lucide-react";
import { FacilityIconType } from "@/data/facilities";

interface FacilityIconProps {
  iconType: FacilityIconType;
  className?: string;
}

const iconMap: Record<FacilityIconType, LucideIcon> = {
  droplets: Droplets,
  users: Users,
  dumbbell: Dumbbell,
};

export function FacilityIcon({ iconType, className = "h-5 w-5" }: FacilityIconProps) {
  const IconComponent = iconMap[iconType];
  return <IconComponent className={className} />;
}