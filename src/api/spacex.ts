export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface LaunchStatus {
    id: number;
    name: string;
    abbrev: string;
    description: string;
}

export interface LaunchPadSummary {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    location: { id: number; name: string } | null;
    country: { id: number; name: string; alpha_2_code: string } | null;
}

export interface LaunchServiceProvider {
    id: number;
    name: string;
    abbrev: string;
}

export interface Launch {
    id: string;
    name: string;
    net: string;
    status: LaunchStatus | null;
    pad: LaunchPadSummary | null;
    launch_service_provider: LaunchServiceProvider | null;
    rocket: {
        configuration: {
            id: number;
            name: string;
            full_name: string;
        } | null;
    } | null;
}

export interface Launchpad {
    id: number;
    name: string;
    latitude: number | null;
    longitude: number | null;
    active: boolean;
    total_launch_count: number;
    orbital_launch_attempt_count: number;
    location: { id: number; name: string } | null;
    country: { id: number; name: string; alpha_2_code: string } | null;
}

const defaultBaseUrl = import.meta.env.DEV
    ? "/api/launch-library/2.3.0/"
    : "https://lldev.thespacedevs.com/2.3.0/";

// The dev API streams large responses very slowly (and sometimes stalls), so
// each page stays small (~10 launches ≈ 130 KB of JSON).
const launchPageSize = 10;
const requestTimeoutMs = 20_000;

class SpaceX {
    private readonly baseUrl: string;

    constructor(baseUrl = defaultBaseUrl) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(path: string, signal?: AbortSignal): Promise<T> {
        const url = /^https?:\/\//.test(path) ? path : `${this.baseUrl}${path}`;
        const controller = new AbortController();
        let timedOut = false;

        const abort = () => controller.abort(signal?.reason);
        signal?.addEventListener("abort", abort, { once: true });

        const timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, requestTimeoutMs);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { Accept: "application/json" },
            });

            if (!response.ok) {
                throw new Error(
                    `Launch Library API request failed (${response.status} ${response.statusText}): ${url}`,
                );
            }

            return (await response.json()) as T;
        } catch (error) {
            if (timedOut) {
                throw new Error(
                    `Launch Library API request timed out after ${requestTimeoutMs} ms: ${url}`,
                );
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
            signal?.removeEventListener("abort", abort);
        }
    }

    private async requestAll<T>(path: string, signal?: AbortSignal): Promise<T[]> {
        const items: T[] = [];
        const limit = 100;
        let offset = 0;

        while (true) {
            const page = await this.request<PaginatedResponse<T>>(
                `${path}?limit=${limit}&offset=${offset}`,
                signal,
            );
            items.push(...page.results);

            if (!page.next || page.results.length === 0) {
                break;
            }

            offset += page.results.length;
        }

        return items;
    }

    async launches(offset = 0, signal?: AbortSignal): Promise<PaginatedResponse<Launch>> {
        return this.request<PaginatedResponse<Launch>>(
            `launches/?limit=${launchPageSize}&offset=${offset}`,
            signal,
        );
    }

    launchpads(signal?: AbortSignal): Promise<Launchpad[]> {
        return this.requestAll<Launchpad>("pads/", signal);
    }

    launchpad(id: number | string, signal?: AbortSignal): Promise<Launchpad> {
        return this.request<Launchpad>(`pads/${id}/`, signal);
    }
}

const spacexApi = new SpaceX();

export { SpaceX, spacexApi };
