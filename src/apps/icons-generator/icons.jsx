import React from "react";
import * as Phosphor from "phosphor-react";
import * as Tabler from "@tabler/icons-react";
import { Icon as MdiIcon } from "@mdi/react";
import * as mdi from "@mdi/js";
import * as LucideIcons from "lucide-react";
import * as HeroIconsSolid from "@heroicons/react/24/solid";
import * as HeroIconsOutline from "@heroicons/react/24/outline";
import * as ReactIcons from "react-icons/fa";
import * as ReactIconsFi from "react-icons/fi";
import * as ReactIconsAi from "react-icons/ai";
import * as ReactIconsBs from "react-icons/bs";
import * as ReactIconsBi from "react-icons/bi";
import * as ReactIconsGo from "react-icons/go";
import * as ReactIconsHi from "react-icons/hi";
import * as ReactIconsIo from "react-icons/io5";
import * as ReactIconsMd from "react-icons/md";
import * as ReactIconsRi from "react-icons/ri";
import * as ReactIconsSi from "react-icons/si";
import * as ReactIconsTb from "react-icons/tb";
import * as ReactIconsVsc from "react-icons/vsc";
import * as ReactIconsCg from "react-icons/cg";
import * as ReactIconsGi from "react-icons/gi";

/*
  Normalize all icons to SAME size system (px)
  Each library exports icons with metadata for filtering
*/

// Phosphor Icons
const phosphorIcons = Object.fromEntries(
  Object.entries(Phosphor)
    .filter(([k, v]) => typeof v === "function" && k !== "IconContext")
    .map(([key, Comp]) => [
      `ph_${key}`,
      Object.assign(
        ({ size = 128, color = "#000", weight = "regular" }) => (
          <Comp size={size} color={color} weight={weight} />
        ),
        { library: "Phosphor", originalName: key }
      )
    ])
);

// Tabler Icons
const tablerIcons = Object.fromEntries(
  Object.entries(Tabler)
    .filter(([k]) => k.startsWith("Icon") && k !== "Icon")
    .map(([key, Comp]) => [
      `tb_${key.replace("Icon", "")}`,
      Object.assign(
        ({ size = 128, color = "#000" }) => (
          <Comp size={size} color={color} stroke={1.5} />
        ),
        { library: "Tabler", originalName: key.replace("Icon", "") }
      )
    ])
);

// MDI Icons
const mdiIcons = Object.fromEntries(
  Object.entries(mdi)
    .filter(([key]) => key.startsWith("mdi"))
    .map(([key, path]) => [
      `mdi_${key.replace("mdi", "")}`,
      Object.assign(
        ({ size = 128, color = "#000" }) => (
          <MdiIcon path={path} size={size / 24} color={color} />
        ),
        { library: "Material Design", originalName: key.replace("mdi", "") }
      )
    ])
);

// Lucide Icons
const lucideIcons = Object.fromEntries(
  Object.entries(LucideIcons)
    .filter(([k, v]) => typeof v === "function" && k !== "createLucideIcon" && !k.includes("Icon"))
    .map(([key, Comp]) => [
      `lu_${key}`,
      Object.assign(
        ({ size = 128, color = "#000" }) => (
          <Comp size={size} color={color} strokeWidth={1.5} />
        ),
        { library: "Lucide", originalName: key }
      )
    ])
);

// Heroicons Solid
const heroIconsSolid = Object.fromEntries(
  Object.entries(HeroIconsSolid)
    .filter(([k, v]) => typeof v === "function")
    .map(([key, Comp]) => [
      `hi_${key}Solid`,
      Object.assign(
        ({ size = 128, color = "#000" }) => (
          <Comp style={{ width: size, height: size, color }} />
        ),
        { library: "Heroicons", originalName: `${key} (Solid)` }
      )
    ])
);

// Heroicons Outline
const heroIconsOutline = Object.fromEntries(
  Object.entries(HeroIconsOutline)
    .filter(([k, v]) => typeof v === "function")
    .map(([key, Comp]) => [
      `hi_${key}Outline`,
      Object.assign(
        ({ size = 128, color = "#000" }) => (
          <Comp style={{ width: size, height: size, color }} />
        ),
        { library: "Heroicons", originalName: `${key} (Outline)` }
      )
    ])
);

// Helper for react-icons
const createReactIconSet = (icons, prefix, libraryName) =>
  Object.fromEntries(
    Object.entries(icons)
      .filter(([k, v]) => typeof v === "function")
      .map(([key, Comp]) => [
        `${prefix}_${key}`,
        Object.assign(
          ({ size = 128, color = "#000" }) => (
            <Comp size={size} color={color} />
          ),
          { library: libraryName, originalName: key }
        )
      ])
  );

// Font Awesome
const fontAwesomeIcons = createReactIconSet(ReactIcons, "fa", "Font Awesome");

// Feather Icons
const featherIcons = createReactIconSet(ReactIconsFi, "fi", "Feather");

// Ant Design Icons
const antDesignIcons = createReactIconSet(ReactIconsAi, "ai", "Ant Design");

// Bootstrap Icons
const bootstrapIcons = createReactIconSet(ReactIconsBs, "bs", "Bootstrap");

// BoxIcons
const boxIcons = createReactIconSet(ReactIconsBi, "bi", "BoxIcons");

// Github Octicons
const octiconsIcons = createReactIconSet(ReactIconsGo, "go", "Octicons");

// Heroicons (via react-icons)
const heroicons2 = createReactIconSet(ReactIconsHi, "hi2", "Heroicons");

// Ionicons
const ionicons = createReactIconSet(ReactIconsIo, "io", "Ionicons");

// Material Design Icons (via react-icons)
const materialIcons = createReactIconSet(ReactIconsMd, "md", "Material");

// Remix Icons
const remixIcons = createReactIconSet(ReactIconsRi, "ri", "Remix");

// Simple Icons (Brand logos)
const simpleIcons = createReactIconSet(ReactIconsSi, "si", "Simple Icons");

// Tabler Icons (via react-icons)
const tablerIcons2 = createReactIconSet(ReactIconsTb, "tb2", "Tabler");

// VS Code Icons
const vscodeIcons = createReactIconSet(ReactIconsVsc, "vsc", "VS Code");

// CSS.gg Icons
const cssggIcons = createReactIconSet(ReactIconsCg, "cg", "CSS.gg");

// Game Icons
const gameIcons = createReactIconSet(ReactIconsGi, "gi", "Game Icons");

// Combine all icons
const allIcons = {
  ...phosphorIcons,
  ...tablerIcons,
  ...mdiIcons,
  ...lucideIcons,
  ...heroIconsSolid,
  ...heroIconsOutline,
  ...fontAwesomeIcons,
  ...featherIcons,
  ...antDesignIcons,
  ...bootstrapIcons,
  ...boxIcons,
  ...octiconsIcons,
  ...heroicons2,
  ...ionicons,
  ...materialIcons,
  ...remixIcons,
  ...simpleIcons,
  ...tablerIcons2,
  ...vscodeIcons,
  ...cssggIcons,
  ...gameIcons,
};

// Export library list for filtering
export const ICON_LIBRARIES = [
  "All Libraries",
  "Phosphor",
  "Tabler",
  "Material Design",
  "Lucide",
  "Heroicons",
  "Font Awesome",
  "Feather",
  "Ant Design",
  "Bootstrap",
  "BoxIcons",
  "Octicons",
  "Ionicons",
  "Material",
  "Remix",
  "Simple Icons",
  "VS Code",
  "CSS.gg",
  "Game Icons",
];

// Get icon count by library
export const getIconCountByLibrary = () => {
  const counts = {};
  Object.values(allIcons).forEach(icon => {
    const lib = icon.library || "Unknown";
    counts[lib] = (counts[lib] || 0) + 1;
  });
  return counts;
};

// Get total icon count
export const getTotalIconCount = () => Object.keys(allIcons).length;

export default allIcons;