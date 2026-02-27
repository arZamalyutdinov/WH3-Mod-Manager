// Optimized icon imports with tree-shaking
// Import only the specific icons needed to reduce bundle size

// React Icons - import specific icons only
import { HiOutlineCollection } from "react-icons/hi";
import { GoGear } from "react-icons/go";
import { FaXmark } from "react-icons/fa6";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { BiSolidRightArrow, BiSolidDownArrow } from "react-icons/bi";
import { MdDragIndicator } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { GiSettingsKnobs } from "react-icons/gi";

// Create lazy-loaded icon components for heavy icons
import React, { Suspense } from "react";

// Icon loading fallback
const IconFallback = ({ size = 16 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="bg-gray-300 rounded animate-pulse" />
);

// Lazy load heavy icon sets (removed unused LazyReactIcon)

type IconModule = Record<string, unknown>;

const iconSetImporters: Record<string, () => Promise<IconModule>> = {
  ai: () => import("react-icons/ai"),
  bi: () => import("react-icons/bi"),
  bs: () => import("react-icons/bs"),
  fa: () => import("react-icons/fa"),
  fa6: () => import("react-icons/fa6"),
  fi: () => import("react-icons/fi"),
  gi: () => import("react-icons/gi"),
  go: () => import("react-icons/go"),
  hi: () => import("react-icons/hi"),
  io: () => import("react-icons/io"),
  io5: () => import("react-icons/io5"),
  lu: () => import("react-icons/lu"),
  md: () => import("react-icons/md"),
  pi: () => import("react-icons/pi"),
  ri: () => import("react-icons/ri"),
  tb: () => import("react-icons/tb"),
  ti: () => import("react-icons/ti"),
};

// Helper component for lazy-loaded icons
export const LazyIcon = ({
  iconName,
  iconSet,
  size = 16,
  className = "",
}: {
  iconName: string;
  iconSet: string;
  size?: number;
  className?: string;
}) => {
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    const loadIcon = async () => {
      try {
        const loadIconSet = iconSetImporters[iconSet];
        if (!loadIconSet) {
          console.warn(`Unsupported icon set "${iconSet}" for icon "${iconName}"`);
          return;
        }

        const iconModule = await loadIconSet();
        const Icon = iconModule[iconName];
        if (typeof Icon === "function") {
          setIconComponent(() => Icon as React.ComponentType);
        }
      } catch (error) {
        console.warn(`Failed to load icon ${iconName} from ${iconSet}:`, error);
      }
    };

    loadIcon();
  }, [iconName, iconSet]);

  if (!IconComponent) {
    return <IconFallback size={size} />;
  }

  return React.createElement(IconComponent as any, { size, className });
};

// Pre-define commonly used icons for better performance
export const Icons = {
  Collection: HiOutlineCollection,
  Gear: GoGear,
  Close: FaXmark,
  EyeOpen: BsEyeFill,
  EyeClosed: BsEyeSlashFill,
  ArrowRight: BiSolidRightArrow,
  ArrowDown: BiSolidDownArrow,
  Drag: MdDragIndicator,
  Settings: FiSettings,
  Help: AiOutlineQuestionCircle,
  SettingsKnobs: GiSettingsKnobs,
} as const;

export type IconName = keyof typeof Icons;
