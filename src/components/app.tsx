import { useMemo, useState } from "react";
import { LaunchList } from "./launchList";
import { Map as LaunchMap } from "./map";
import { useLaunches } from "../api/queries";
import type { Launch, LaunchPadSummary } from "../api/spacex";

const emptyLaunches: Launch[] = [];

function App() {
    const launchesQuery = useLaunches();
    const [highlightedLaunchpadId, setHighlightedLaunchpadId] = useState<number | null>(null);

    const launches = useMemo(
        () => launchesQuery.data?.pages.flatMap((page) => page.results) ?? emptyLaunches,
        [launchesQuery.data],
    );

    // Launches already embed their pad (with coordinates), so there is no need
    // to download the whole /pads/ collection just to draw circles.
    const launchpads = useMemo(() => {
        const pads = new Map<number, LaunchPadSummary>();

        for (const launch of launches) {
            if (launch.pad) {
                pads.set(launch.pad.id, launch.pad);
            }
        }

        return [...pads.values()];
    }, [launches]);

    return (
        <main className="main">
            <LaunchList
                launches={launches}
                isLoading={launchesQuery.isLoading}
                error={launchesQuery.error}
                hasNextPage={launchesQuery.hasNextPage}
                isFetchingNextPage={launchesQuery.isFetchingNextPage}
                onLoadMore={() => {
                    void launchesQuery.fetchNextPage();
                }}
                onHoverLaunchpad={setHighlightedLaunchpadId}
            />
            <LaunchMap
                launchpads={launchpads}
                highlightedLaunchpadId={highlightedLaunchpadId}
            />
        </main>
    );
}

export { App };
