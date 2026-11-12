import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { spacexApi } from "./spacex";

const spaceXKeys = {
    all: ["spacex"] as const,
    launches: () => [...spaceXKeys.all, "launches"] as const,
    launchpads: () => [...spaceXKeys.all, "launchpads"] as const,
};

function useLaunches() {
    return useInfiniteQuery({
        queryKey: spaceXKeys.launches(),
        queryFn: ({ signal, pageParam }) => spacexApi.launches(pageParam, signal),
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) =>
            lastPage.next && lastPage.results.length > 0
                ? lastPageParam + lastPage.results.length
                : undefined,
        staleTime: 5 * 60 * 1000,
    });
}

function useLaunchpads() {
    return useQuery({
        queryKey: spaceXKeys.launchpads(),
        queryFn: ({ signal }) => spacexApi.launchpads(signal),
        staleTime: 5 * 60 * 1000,
    });
}

export { spaceXKeys, useLaunches, useLaunchpads };
