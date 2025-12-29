const streamResponseHeaders = (res) => {
    res.writeHead(200, {
        "Content-Type": "multipart/x-mixed-replace; boundary=frame",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Connection": "keep-alive",
    });
};


// module.exports = streamResponseHeaders;

// src/utils/streamResponseHeaders.js

// const streamResponseHeaders = (res) => {
//     if (typeof res.writeHead === "function") {
//         res.writeHead(200, {
//             "Content-Type": "multipart/x-mixed-replace; boundary=frame",
//             "Cache-Control": "no-cache, no-store, must-revalidate",
//             "Pragma": "no-cache",
//             "Expires": "0",
//             "Connection": "keep-alive",
//         });
//     } else if (typeof res.setHeader === "function") {
//         res.statusCode = 200;
//         res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");
//         res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//         res.setHeader("Pragma", "no-cache");
//         res.setHeader("Expires", "0");
//         res.setHeader("Connection", "keep-alive");
//     } else {
//         console.warn("Unknown response object. Streaming may not work.");
//     }
// };

module.exports = streamResponseHeaders;


