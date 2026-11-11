import type { Launch } from "../api/spacex";

interface LaunchListProps {
    launches: Launch[];
    isLoading: boolean;
    error: Error | null;
    onHoverLaunchpad: (launchpadId: number | null) => void;
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getStatus(launch: Launch): string {
    if (!launch.status) return "Unknown";
    return launch.status.abbrev || launch.status.name;
}

function getVehicle(launch: Launch): string | null {
    return launch.rocket?.configuration?.full_name ?? launch.rocket?.configuration?.name ?? null;
}

function LaunchList({ launches, isLoading, error, onHoverLaunchpad }: LaunchListProps) {
    return (
        <aside className="aside" id="launchesContainer">
            <h3>Launches</h3>
            <div id="listContainer">
                {isLoading && <p className="listMessage">Loading launches…</p>}
                {error && (
                    <p className="listMessage listMessage--error">
                        Failed to load launches: {error.message}
                    </p>
                )}
                {!isLoading && !error && (
                    <ul className="launchList">
                        {launches.map((launch) => (
                            <li
                                key={launch.id}
                                className="launch-item"
                                tabIndex={0}
                                onMouseEnter={() => onHoverLaunchpad(launch.pad?.id ?? null)}
                                onMouseLeave={() => onHoverLaunchpad(null)}
                                onFocus={() => onHoverLaunchpad(launch.pad?.id ?? null)}
                                onBlur={() => onHoverLaunchpad(null)}
                            >
                                <span className="launch-name">{launch.name}</span>
                                <span className="launch-meta">
                                    {formatDate(launch.net)} · {getStatus(launch)}
                                    {getVehicle(launch) ? ` · ${getVehicle(launch)}` : ""}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export { LaunchList };
