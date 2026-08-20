import { useQuery } from "@tanstack/react-query";

import { listGameObjects, listGameObjectTags } from "@/api/endpoints";

/** Map gameObjectId -> tag names, loaded lazily for #tag tree filtering. */
export function useObjectTagMap(projectId: string | undefined) {
  return useQuery({
    queryKey: ["object-tags-map", projectId ?? ""],
    queryFn: async () => {
      const map = new Map<string, string[]>();
      const objects = await listGameObjects(projectId!);
      for (const object of objects) {
        const tags = await listGameObjectTags(projectId!, object.id);
        map.set(object.id, tags.map((tag) => tag.name.toLowerCase()));
      }
      return map;
    },
    enabled: Boolean(projectId),
  });
}