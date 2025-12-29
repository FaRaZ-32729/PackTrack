const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const sharp = require("sharp");
const jsQR = require("jsqr");
const streamResponseHeaders = require("./streamResponseHeaders");
const qrDataModel = require("../models/qrDataModel");

// rtsp stream without qr code detector and working properly
// const rtspStreamHandler = (rtspUrl, res, req) => {
//     streamResponseHeaders(res);

//     let restarting = false;

//     const ffmpegArgs = [
//         "-rtsp_transport", "tcp",
//         "-i", rtspUrl,
//         "-f", "mjpeg",
//         "-vf", "scale=640:360",
//         "-q:v", "5",
//         "pipe:1",
//     ];

//     const startFFmpeg = () => {
//         const ffmpeg = spawn(ffmpegPath, ffmpegArgs, { stdio: ["ignore", "pipe", "pipe"] });
//         let frameBuffer = Buffer.alloc(0);

//         ffmpeg.stdout.on("data", (chunk) => {
//             frameBuffer = Buffer.concat([frameBuffer, chunk]);
//             const start = frameBuffer.indexOf(Buffer.from([0xff, 0xd8]));
//             const end = frameBuffer.indexOf(Buffer.from([0xff, 0xd9]));

//             if (start !== -1 && end !== -1 && end > start) {
//                 const frame = frameBuffer.slice(start, end + 2);
//                 frameBuffer = frameBuffer.slice(end + 2);

//                 // Send live stream to client
//                 res.write(`--frame\r\n`);
//                 res.write("Content-Type: image/jpeg\r\n\r\n");
//                 res.write(frame);
//                 res.write("\r\n");
//             }
//         });

//         ffmpeg.stderr.on("data", (data) => {
//             console.log("FFmpeg log:", data.toString());
//         });

//         ffmpeg.on("close", (code) => {
//             console.log(`FFmpeg exited with code ${code}`);
//             if (!restarting && !res.writableEnded) {
//                 restarting = true;
//                 console.log("Restarting FFmpeg...");
//                 setTimeout(() => {
//                     restarting = false;
//                     startFFmpeg();
//                 }, 2000);
//             }
//         });

//         req.on("close", () => {
//             console.log("Client disconnected");
//             ffmpeg.kill("SIGINT");
//             restarting = true;
//         });
//     };

//     startFFmpeg();
// };

// new rtsp stream with qr code detector not checked yet 
const rtspStreamHandler = (rtspUrl, res, req) => {
    streamResponseHeaders(res);

    let restarting = false;
    let frameBuffer = Buffer.alloc(0);
    let latestFrame = null;
    let processingQR = false;
    let ffmpegProcess = null;

    const startFFmpeg = () => {
        console.log("Starting FFmpeg Stream:", rtspUrl);

        const ffmpegArgs = [
            "-rtsp_transport", "tcp",
            "-i", rtspUrl,
            "-f", "mjpeg",
            "-vf", "scale=640:360",
            "-q:v", "5",
            "pipe:1",
        ];

        ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        ffmpegProcess.stdout.on("data", (chunk) => {
            try {
                frameBuffer = Buffer.concat([frameBuffer, chunk]);
                const start = frameBuffer.indexOf(Buffer.from([0xff, 0xd8]));
                const end = frameBuffer.indexOf(Buffer.from([0xff, 0xd9]));

                if (start !== -1 && end !== -1 && end > start) {
                    const frame = frameBuffer.slice(start, end + 2);
                    frameBuffer = frameBuffer.slice(end + 2);
                    latestFrame = frame;

                    res.write(`--frame\r\n`);
                    res.write("Content-Type: image/jpeg\r\n\r\n");
                    res.write(frame);
                    res.write("\r\n");
                }
            } catch (err) {
                console.error("⚠️ Frame write error:", err.message);
            }
        });

        // 🔍 QR detection every 2 seconds
        const qrInterval = setInterval(async () => {
            if (!latestFrame || processingQR) return;
            processingQR = true;

            const frame = latestFrame;
            latestFrame = null;

            try {
                const { data, info } = await sharp(frame)
                    .raw()
                    .ensureAlpha()
                    .toBuffer({ resolveWithObject: true });

                const qrCode = jsQR(new Uint8ClampedArray(data), info.width, info.height);
                if (qrCode) {
                    console.log("QR Detected:", qrCode.data);
                    try {
                        const parsedData = JSON.parse(qrCode.data);
                        await qrDataModel.create(parsedData);
                        console.log("Saved QR to DB:", parsedData);
                    } catch {
                        console.warn(" Non-JSON QR:", qrCode.data);
                    }
                }
            } catch (err) {
                if (!err.message.includes("unsupported image format")) {
                    console.error("QR Decode Error:", err.message);
                }
            } finally {
                processingQR = false;
            }
        }, 2000);

        ffmpegProcess.stderr.on("data", (data) => {
            const msg = data.toString().trim();
            if (msg.toLowerCase().includes("error")) {
                console.error("FFmpeg error:", msg);
            }
        });

        ffmpegProcess.on("close", (code, signal) => {
            clearInterval(qrInterval);
            console.log(`FFmpeg exited (code: ${code}, signal: ${signal})`);
            restartStream();
        });

        // 🧹 Clean up on client disconnect
        req.on("close", () => {
            clearInterval(qrInterval);
            if (ffmpegProcess) ffmpegProcess.kill("SIGINT");
            restarting = true;
            console.log("Client disconnected, FFmpeg stopped.");
        });

        const restartStream = () => {
            if (!restarting && !res.writableEnded) {
                restarting = true;
                console.log("Restarting FFmpeg in 3s...");
                setTimeout(() => {
                    restarting = false;
                    startFFmpeg();
                }, 3000);
            }
        };

        // ⏱️ Auto restart if no data for too long
        let lastFrameTime = Date.now();
        ffmpegProcess.stdout.on("data", () => (lastFrameTime = Date.now()));

        const healthCheck = setInterval(() => {
            if (Date.now() - lastFrameTime > 10000) { // 10 seconds without frame
                console.warn("Stream inactive, restarting FFmpeg...");
                ffmpegProcess.kill("SIGKILL");
            }
        }, 5000);

        ffmpegProcess.on("exit", () => clearInterval(healthCheck));
    };

    startFFmpeg();
};

module.exports = rtspStreamHandler;