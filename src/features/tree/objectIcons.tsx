import { type ComponentType, type ReactNode } from "react";

import {
  Box,
  Building2,
  Castle,
  CircleDot,
  Crown,
  FlaskConical,
  Gem,
  House,
  Landmark,
  MapPin,
  Mountain,
  Package,
  ScrollText,
  Store,
  Swords,
  TowerControl,
  TreePine,
  Users,
} from "lucide-react";

import type { ObjectIconName } from "@/api/types";

const ICON_MAP: Record<ObjectIconName, ComponentType<{ className?: string }>> = {
  box: Box,
  "building-2": Building2,
  castle: Castle,
  "circle-dot": CircleDot,
  crown: Crown,
  flask: FlaskConical,
  gem: Gem,
  house: House,
  landmark: Landmark,
  "map-pin": MapPin,
  mountain: Mountain,
  package: Package,
  scroll: ScrollText,
  store: Store,
  swords: Swords,
  tower: TowerControl,
  "tree-pine": TreePine,
  users: Users,
};

/** Render a preset icon by name (falls back to the default cube). */
export function objectIconByName(name: ObjectIconName | string | null | undefined, size = "h-4 w-4"): ReactNode {
  const Icon = ICON_MAP[name as ObjectIconName] ?? ICON_MAP.box;
  return <Icon className={size} />;
}

const RULES: Array<[RegExp, ObjectIconName]> = [
  [/world|universe|realm|cosmos/i, "castle"],
  [/quest|adventure|mission/i, "swords"],
  [/city|town|village|settlement|port|harbor|gate/i, "building-2"],
  [/bazaar|market|shop|store|inn|tavern/i, "store"],
  [/house|home|residence|manor/i, "house"],
  [/citadel|fortress|castle|keep|tower|stronghold/i, "tower"],
  [/temple|shrine|church|cathedral|monastery/i, "landmark"],
  [/mountain|peak|ridge|crag|cavern|cave/i, "mountain"],
  [/forest|grove|wood|tree/i, "tree-pine"],
  [/person|people|faction|guild|clan|npc|character|guard|priest|king|queen/i, "users"],
  [/scroll|journal|book|record|letter|document|prophecy/i, "scroll"],
  [/artifact|relic|item|weapon|armor|gear/i, "package"],
  [/crown|royal|throne/i, "crown"],
  [/gem|jewel|crystal|ore/i, "gem"],
  [/potion|alchemy|magic|spell|ritual/i, "flask"],
  [/region|area|district|land|island|continent/i, "map-pin"],
];

/** Best-effort preset for a GameObject based on its name (spec §5 requires distinct icons). */
export function inferObjectIcon(name: string): ObjectIconName {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(name)) return icon;
  }
  return "box";
}

/** Icon for a GO: explicit preset when set (e.g. from the picker), otherwise name-based. */
export function objectIcon(name: string, icon?: string | null): ReactNode {
  return objectIconByName(icon ?? inferObjectIcon(name));
}