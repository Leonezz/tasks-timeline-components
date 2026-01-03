import React from "react";
import * as Lucide from "lucide-react";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: keyof typeof Lucide;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className,
  size = 16,
  ...props
}) => {
  const LucideIcon = Lucide[name] as React.ElementType;

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon size={size} className={className} {...props} />;
};
