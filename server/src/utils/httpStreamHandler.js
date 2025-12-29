const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const sharp = require("sharp");
const jsQR = require("jsqr");
const streamResponseHeaders = require("./streamResponseHeaders");
const qrDataModel = require("../models/qrDataModel");

const httpStreamHandler = (rtspUrl, res, req) => {
    streamResponseHeaders(res);

    let restarting = false;
    let frameBuffer = Buffer.alloc(0);
    let frameCount = 0;

    const startFFmpeg = () => {
        console.log("Starting IP camera stream:", rtspUrl);

        const ffmpegArgs = [
            "-reconnect", "1",
            "-reconnect_streamed", "1",
            "-reconnect_delay_max", "2",
            "-i", rtspUrl,
            "-f", "mjpeg",
            "-q:v", "5",
            "-vf", "scale=640:360",
            "pipe:1",
        ];

        const ffmpeg = spawn(ffmpegPath, ffmpegArgs, {
            stdio: ["ignore", "pipe", "pipe"],
        });

        if (!ffmpeg || !ffmpeg.stdout) {
            console.error("Failed to spawn FFmpeg process.");
            return;
        }

        ffmpeg.stdout.on("data", async (chunk) => {
            frameBuffer = Buffer.concat([frameBuffer, chunk]);

            const start = frameBuffer.indexOf(Buffer.from([0xff, 0xd8]));
            const end = frameBuffer.indexOf(Buffer.from([0xff, 0xd9]));

            if (start !== -1 && end !== -1 && end > start) {
                const frame = frameBuffer.slice(start, end + 2);
                frameBuffer = frameBuffer.slice(end + 2);
                frameCount++;

                // Decode QR every 5th frame
                if (frameCount % 5 === 0 && frame.length > 0) {
                    try {
                        // Convert MJPEG frame to raw RGBA using sharp
                        const { data, info } = await sharp(frame)
                            .raw()
                            .ensureAlpha()
                            .toBuffer({ resolveWithObject: true });

                        const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
                        if (code) {
                            console.log("QR Detected Successfully:", code.data);
                            try {
                                const parsedData = JSON.parse(code.data)
                                await qrDataModel.create(parsedData);
                                console.log("data inserted into database");
                            } catch (error) {
                                console.error("Invalid QR JSON:", code.data);
                            }

                        }
                    } catch (err) {
                        console.error("QR decode error:", err.message);
                    }
                }

                // Stream frame to client
                try {
                    res.write(`--frame\r\n`);
                    res.write("Content-Type: image/jpeg\r\n\r\n");
                    res.write(frame);
                    res.write("\r\n");
                } catch (err) {
                    console.error("Error sending frame:", err.message);
                }
            }
        });

        ffmpeg.stderr.on("data", (data) => {
            const msg = data.toString();
            if (msg.toLowerCase().includes("error")) console.error("FFmpeg:", msg.trim());
        });

        ffmpeg.on("close", () => restartStream());

        if (req && req.on) {
            req.on("close", () => {
                restarting = true;
                ffmpeg.kill("SIGINT");
            });
        }

        const restartStream = () => {
            if (!restarting && !res.writableEnded) {
                restarting = true;
                console.log("Restarting FFmpeg in 2s...");
                setTimeout(() => {
                    restarting = false;
                    startFFmpeg();
                }, 2000);
            }
        };
    };

    startFFmpeg();
};

module.exports = httpStreamHandler;