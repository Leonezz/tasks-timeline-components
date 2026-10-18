import React from "react";
import type { LucideIconName } from "../types";
import { ICONS } from "./icon-registry";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: LucideIconName;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className,
  size = 16,
  ...props
}) => {
  // an own-key check keeps inherited keys such as "toString" from resolving
  if (!Object.prototype.hasOwnProperty.call(ICONS, name)) {
    throw new Error(
      `Unknown icon "${String(name)}". <Icon> only renders the icons listed in LucideIconName. ` +
        `For any other Lucide icon, import it from "lucide-react" and render it directly.`,
    );
  }
  const LucideIcon = ICONS[name];

  return <LucideIcon size={size} className={className} {...props} />;
};
