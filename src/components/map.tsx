import * as d3 from "d3";
import type { FeatureCollection } from "geojson";
import { useEffect, useRef } from "react";
import geo from "../geo.json";
import type { Launchpad } from "../api/spacex";

interface MapProps {
    launchpads: Launchpad[];
    highlightedLaunchpadId: number | null;
}

type PadWithCoordinates = Launchpad & {
    latitude: number;
    longitude: number;
};

const width = 1000;
const height = 600;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

const countries = geo as unknown as FeatureCollection;

function hasCoordinates(pad: Launchpad): pad is PadWithCoordinates {
    return (
        typeof pad.latitude === "number" &&
        Number.isFinite(pad.latitude) &&
        typeof pad.longitude === "number" &&
        Number.isFinite(pad.longitude)
    );
}

function Map({ launchpads, highlightedLaunchpadId }: MapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const circleLayerRef = useRef<SVGGElement | null>(null);
    const projectionRef = useRef<d3.GeoProjection | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const svg = d3
            .select(container)
            .append("svg")
            .attr(
                "viewBox",
                `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
            )
            .attr("width", "100%")
            .attr("role", "img")
            .attr("aria-label", "World map with SpaceX launchpads");

        const root = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        const zoomLayer = root.append("g");
        const mapLayer = zoomLayer.append("g");
        const circleLayer = zoomLayer.append("g").attr("class", "launchpadLayer");

        circleLayerRef.current = circleLayer.node();

        const projection = d3
            .geoMercator()
            .scale(70)
            .center([0, 20])
            .translate([width / 2, height / 2]);

        projectionRef.current = projection;

        mapLayer
            .selectAll<SVGPathElement, (typeof countries.features)[number]>("path")
            .data(countries.features)
            .join("path")
            .attr("class", "topo")
            .attr("d", d3.geoPath(projection))
            .style("opacity", 0.7);

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 8])
            .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
                zoomLayer.attr("transform", event.transform.toString());
            });

        svg.call(zoom);

        return () => {
            svg.remove();
            circleLayerRef.current = null;
            projectionRef.current = null;
        };
    }, []);

    useEffect(() => {
        const layer = circleLayerRef.current;
        const projection = projectionRef.current;
        if (!layer || !projection) return;

        const pads = launchpads.filter(hasCoordinates);

        const circles = d3
            .select(layer)
            .selectAll<SVGCircleElement, PadWithCoordinates>("circle.launchpad")
            .data(pads, (pad) => pad.id);

        circles.exit().remove();

        const entered = circles
            .enter()
            .append("circle")
            .attr("class", "launchpad");

        entered.append("title");

        const merged = entered.merge(circles);

        merged
            .attr("cx", (pad) => projection([pad.longitude, pad.latitude])?.[0] ?? 0)
            .attr("cy", (pad) => projection([pad.longitude, pad.latitude])?.[1] ?? 0)
            .attr("r", (pad) => (pad.id === highlightedLaunchpadId ? 9 : 5))
            .attr("fill", (pad) => (pad.id === highlightedLaunchpadId ? "#ff4d4f" : "#1f6feb"))
            .attr("stroke", "#ffffff")
            .attr("stroke-width", (pad) => (pad.id === highlightedLaunchpadId ? 2.5 : 1))
            .style("opacity", (pad) =>
                highlightedLaunchpadId !== null && pad.id !== highlightedLaunchpadId
                    ? 0.35
                    : 0.9,
            )
            .classed("launchpad--highlighted", (pad) => pad.id === highlightedLaunchpadId);

        merged
            .select("title")
            .text((pad) => `${pad.name} (${pad.location?.name ?? "Unknown location"})`);
    }, [launchpads, highlightedLaunchpadId]);

    return <div className="mapContainer map" ref={containerRef} />;
}

export { Map };
