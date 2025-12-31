const cameraModel = require("../models/cameraModel");
const venueModel = require("../models/venueModel");
const httpStreamHandler = require("../utils/httpStreamHandler");
const rtspStreamHandler = require("../utils/rtspStreamHandler");


const registerCamera = async (req, res) => {
    try {
        const { name, rtspUrl, type, venueId } = req.body;

        if (!name || !rtspUrl || !type || !venueId) {
            return res.status(400).json({ message: "All Fields Are Required" });
        }

        if (type !== "box" && type !== "number plate") {
            return res.status(400).json({ message: "Type Must Be Either 'box' or 'number plate'" })
        }


        const venue = await venueModel.findById(venueId);
        if (!venue) return res.status(404).json({ message: "Venue Not Found" });

        const rtspRegex = /^rtsp:\/\/.+/;
        if (!rtspRegex.test(rtspUrl)) {
            return res.status(400).json({ msg: "Invalid RTSP URL format" });
        }


        const newCamera = await cameraModel.create({
            name,
            rtspUrl,
            type,
            venueId
        })


        return res.status(201).json({ message: "New Camera Created Successfully", Camera: newCamera });
    } catch (error) {
        console.log(error, "error while creating the camera");
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const listCameraByVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const venue = await venueModel.findById(id);

        if (!venue) return res.status(404).json({ message: "Venue Not Found" });

        const cameras = await cameraModel.find({ venueId: id });

        if (!cameras) {
            return res.status(404).json({ message: "No Camera Found In This Venue" });
        }

        return res.status(200).json({ message: "Cameras Fetched Successfully", cameras });
    } catch (error) {
        console.log(error, " error while fetching cameras");
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// not required now

// const getAllCameras = async (req, res) => {
//     try {
//         const cameras = await cameraModel.find().populate("venueId", "name");
//         return res.status(200).json({
//             count: cameras.length,
//             cameras,
//         });
//     } catch (error) {
//         console.log(error, "error while fetching cameras");
//         return res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

// not required now

// const getCameraById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const camera = await cameraModel.findById(id).populate("venueId", "name");

//         if (!camera) return res.status(404).json({ message: "Camera Not Found" });

//         return res.status(200).json({ message: "Camera fetched successfully", camera });
//     } catch (error) {
//         console.log(error, "error while fetching single camera");
//         return res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };

const updateCamera = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rtspUrl, type, venueId } = req.body;

        const camera = await cameraModel.findById(id);
        if (!camera) return res.status(404).json({ message: "Camera Not Found" });

        if (name) camera.name = name;
        if (rtspUrl) {
            const rtspRegex = /^rtsp:\/\/.+/;
            if (!rtspRegex.test(rtspUrl)) {
                return res.status(400).json({ message: "Invalid RTSP URL format" });
            }
            camera.rtspUrl = rtspUrl;
        }
        if (type) {
            if (type !== "box" && type !== "number plate") {
                return res.status(400).json({ message: "Type Must Be Either 'box' or 'number plate'" });
            }
            camera.type = type;
        }

        if (venueId) {
            const venue = await venueModel.findById(venueId);
            if (!venue) return res.status(404).json({ message: "Venue Not Found" });
            camera.venueId = venueId;
        }

        const updatedCamera = await camera.save();

        return res.status(200).json({
            message: "Camera updated successfully",
            camera: updatedCamera,
        });
    } catch (error) {
        console.log(error, "error while updating camera");
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const deleteCamera = async (req, res) => {
    try {
        const { id } = req.params;
        const camera = await cameraModel.findById(id);
        if (!camera) return res.status(404).json({ message: "Camera Not Found" });

        await camera.deleteOne();

        return res.status(200).json({ message: "Camera deleted successfully" });
    } catch (error) {
        console.log(error, "error while deleting camera");
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const streamCamera = async (req, res) => {
    try {
        const { id } = req.params;
        // const { interval = 3, crop = "center", width = 200, height = 200 } = req.query;

        const camera = await cameraModel.findById(id);
        if (!camera) return res.status(404).json({ message: "Camera not found" });

        const rtspUrl = camera.rtspUrl;
        console.log(`Streaming camera: ${camera.name} (${camera._id})`);

        if (rtspUrl.startsWith("http")) {
            return await httpStreamHandler(rtspUrl, res, req);
        } else {
            // { id, interval, crop, width, height }
            return rtspStreamHandler(rtspUrl, res, req);
        }
    } catch (err) {
        console.error("Error streaming camera:", err);
        if (!res.headersSent)
            res.status(500).json({ message: "Server error", error: err.message });
    }
};



module.exports = { registerCamera, listCameraByVenue, streamCamera, updateCamera, deleteCamera };