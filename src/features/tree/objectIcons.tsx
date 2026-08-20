import { type ReactNode } from "react";

import {
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

const RULES: Array<[RegExp, ReactNode]> = [
  [/world|universe|realm|cosmos/i, <Castle className="h-4 w-4" />],
  [/quest|adventure|mission/i, <Swords className="h-4 w-4" />],
  [/city|town|village|settlement|port|harbor|gate/i, <Building2 className="h-4 w-4" />],
  [/bazaar|market|shop|store|inn|tavern/i, <Store className="h-4 w-4" />],
  [/house|home|residence|manor/i, <House className="h-4 w-4" />],
  [/citadel|fortress|castle|keep|tower|stronghold/i, <TowerControl className="h-4 w-4" />],
  [/temple|shrine|church|cathedral|monastery/i, <Landmark className="h-4 w-4" />],
  [/mountain|peak|ridge|crag|cavern|cave/i, <Mountain className="h-4 w-4" />],
  [/forest|grove|wood|tree/i, <TreePine className="h-4 w-4" />],
  [/person|people|faction|guild|clan|npc|character|guard|priest|king|queen/i, <Users className="h-4 w-4" />],
  [/scroll|journal|book|record|letter|document|prophecy/i, <ScrollText className="h-4 w-4" />],
  [/artifact|relic|item|weapon|armor|gear/i, <Package className="h-4 w-4" />],
  [/crown|royal|throne/i, <Crown className="h-4 w-4" />],
  [/gem|jewel|crystal|ore/i, <Gem className="h-4 w-4" />],
  [/potion|alchemy|magic|spell|ritual/i, <FlaskConical className="h-4 w-4" />],
  [/region|area|district|land|island|continent/i, <MapPin className="h-4 w-4" />],
];

/** Best-effort icon for a GameObject based on its name (spec §5 requires distinct icons). */
export function objectIcon(name: string): ReactNode {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(name)) return icon;
  }
  return <CircleDot className="h-4 w-4" />;
}