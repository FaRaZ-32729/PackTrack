const { InfluxDB, Point } = require("@influxdata/influxdb-client");
require("dotenv").config();

// --- Load environment variables ---
const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

// --- Check env values first ---
if (!url || !token || !org || !bucket) {
    console.error("Missing InfluxDB environment variables. Please check your .env file");
    process.exit(1);
}

console.log(" Connecting to InfluxDB...");
console.log(" URL:", url);
console.log(" Org:", org);
console.log(" Bucket:", bucket);

// --- Create InfluxDB instance and Write API ---
const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket, "ns"); // precision = ns

// --- Function to write random data ---
async function writeDummyData() {
    const organizationId = "org001";
    const venues = ["venue001", "venue002", "venue003"];

    for (const venueId of venues) {
        const randomCount = Math.floor(Math.random() * 90) + 10;

        const point = new Point("box_count")
            .tag("orgId", organizationId)
            .tag("venueId", venueId)
            .floatField("count", randomCount)
            .timestamp(new Date());

        writeApi.writePoint(point);
        console.log(
            `Written dummy data | Org: ${organizationId} | ${venueId} | count=${randomCount}`
        );
    }

    try {
        await writeApi.flush();
        console.log(" Data flushed to InfluxDB buffer.\n");
    } catch (error) {
        console.error("Error flushing data:", error);
    }
}

// --- Run continuously every 10 seconds ---
console.log(" Starting continuous data write every 10 seconds...");
setInterval(writeDummyData, 10 * 1000);

// --- Handle exit cleanly ---
process.on("SIGINT", async () => {
    console.log("\n Stopping data writer...");
    await writeApi.close();
    console.log(" Connection closed. Goodbye!");
    process.exit(0);
});
