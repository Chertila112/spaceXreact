import { useState } from "react";
import { LaunchList } from "./launchList";
import { Map } from "./map";
import { useLaunches, useLaunchpads } from "../api/queries";

function App() {
    const launchesQuery = useLaunches();
    const launchpadsQuery = useLaunchpads();
    const [highlightedLaunchpadId, setHighlightedLaunchpadId] = useState<number | null>(null);

    const launches = launchesQuery.data ?? [];
    const allLaunchpads = launchpadsQuery.data ?? [];

    const usedLaunchpadIds = new Set(
        launches
            .map((launch) => launch.pad?.id)
            .filter((id): id is number => typeof id === "number"),
    );

    const launchpads = allLaunchpads.filter((pad) => usedLaunchpadIds.has(pad.id));

    return (
        <main className="main">
            <LaunchList
                launches={launches}
                isLoading={launchesQuery.isLoading}
                error={launchesQuery.error}
                onHoverLaunchpad={setHighlightedLaunchpadId}
            />
            <Map
                launchpads={launchpads}
                highlightedLaunchpadId={highlightedLaunchpadId}
            />
        </main>
    );
}

export { App };
