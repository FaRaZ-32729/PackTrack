const { influxDB, org, bucket } = require("../config/influxDB");
const { QueryApi } = require("@influxdata/influxdb-client");

const queryApi = influxDB.getQueryApi(org);

const getBoxCountByVenue = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { range } = req.query;

        if (!venueId) return res.status(404).json({ message: "Venue Not Found" });

        // Default time range
        let timeRange = "-1h";
        if (range === "today") timeRange = "-24h";
        else if (range === "1w") timeRange = "-1w";
        else if (range === "1m") timeRange = "-30d";
        else if (range === "6m") timeRange = "-26w";
        else if (range === "1y") timeRange = "-52w";

        // Query for time-series data
        const fluxQueryData = `
            from(bucket: "${bucket}")
                |> range(start: ${timeRange})
                |> filter(fn: (r) => r._measurement == "box_count" and r.venueId == "${venueId}")
                |> keep(columns: ["_time", "_value", "venueId"])
                |> sort(columns: ["_time"], desc: false)
        `;

        // Query for total count in range
        const fluxQuerySum = `
            from(bucket: "${bucket}")
                |> range(start: ${timeRange})
                |> filter(fn: (r) => r._measurement == "box_count" and r.venueId == "${venueId}")
                |> group(columns: ["venueId"])
                |> sum(column: "_value")
        `;

        const rows = [];
        let totalBoxCount = 0;

        // First: fetch total box count
        await queryApi.queryRows(fluxQuerySum, {
            next(row, tableMeta) {
                const data = tableMeta.toObject(row);
                totalBoxCount = data._value || 0;
            },
            error(error) {
                console.error("InfluxDB Sum Query Error:", error);
            },
            complete() {
                // After total fetched, get detailed data
                queryApi.queryRows(fluxQueryData, {
                    next(row, tableMeta) {
                        const data = tableMeta.toObject(row);
                        const utcTime = new Date(data._time);
                        const localTime = utcTime.toLocaleString("en-PK", {
                            timeZone: "Asia/Karachi",
                            hour12: true,
                        });

                        rows.push({
                            count: data._value,
                            timestampUTC: data._time,
                            timestampLocal: localTime,
                        });
                    },
                    error(error) {
                        console.error("InfluxDB Data Query Error:", error);
                        return res.status(500).json({ message: "Error Fetching Data From InfluxDB" });
                    },
                    complete() {
                        if (rows.length > 0) {
                            return res.status(200).json({
                                range: range || "1h",
                                totalBoxCount,
                                // totalRecords: rows.length,
                                data: rows,
                            });
                        } else {
                            return res.status(404).json({ message: "No Data Found For This Venue" });
                        }
                    },
                });
            },
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const getBoxCountByOrganization = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { startDate, endDate } = req.query;

        if (!orgId)
            return res.status(400).json({ message: "Organization ID is required" });

        const venues = ["venue001", "venue002", "venue003"];
        console.log(`Organization ${orgId} has ${venues.length} venues.`);

        let start = startDate ? new Date(startDate) : new Date();
        let end = endDate ? new Date(endDate) : new Date();

        if (!startDate && !endDate) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }

        const startISO = start.toISOString();
        const endISO = end.toISOString();

        console.log(`Querying data from ${startISO} to ${endISO}`);

        const fluxQuery = `
            from(bucket: "${bucket}")
                |> range(start: time(v: "${startISO}"), stop: time(v: "${endISO}"))
                |> filter(fn: (r) => 
                    r._measurement == "box_count" and 
                    r.orgId == "${orgId}"
                )
                |> sum(column: "_value")
        `;

        let totalBoxCount = 0;

        await queryApi.queryRows(fluxQuery, {
            next(row, tableMeta) {
                const data = tableMeta.toObject(row);
                totalBoxCount += data._value || 0;
            },
            error(err) {
                console.error("InfluxDB Query Error:", err);
                return res.status(500).json({ message: "Error querying InfluxDB" });
            },
            complete() {
                const localStart = start.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
                const localEnd = end.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

                return res.status(200).json({
                    orgId,
                    totalBoxCount,
                    startDate: localStart,
                    endDate: localEnd,
                    totalVenues: venues.length,
                    venues,
                });
            },
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res
            .status(500)
            .json({ message: "Server Error", error: error.message });
    }
};


module.exports = { getBoxCountByVenue, getBoxCountByOrganization };