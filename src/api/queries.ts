import { useQuery } from "@tanstack/react-query";
import { spacexApi } from "./spacex";

const spaceXKeys = {
    all: ["spacex"] as const,
    launches: () => [...spaceXKeys.all, "launches"] as const,
    launchpads: () => [...spaceXKeys.all, "launchpads"] as const,
};

function useLaunches() {
    return useQuery({
        queryKey: spaceXKeys.launches(),
        queryFn: ({ signal }) => spacexApi.launches(signal),
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
