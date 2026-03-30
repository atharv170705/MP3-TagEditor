import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import NodeID3 from "node-id3";
import fs from "fs";

const app = express();

dotenv.config({
    path: "./.env",
});

const port = process.env.PORT;

app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(","),
        credentials: true,
        methods: ["GET", "POST", "PUSH", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/uploads", express.static("uploads"));

app.get('/', (req, res) => {
    res.send("Running just fine");
})

const __dirname = path.resolve();
// const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}
const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = crypto.randomUUID();
        cb(null, `${name}${ext}`);
    }
})

const upload = multer({
    storage: storage,
    limits: {fileSize: 20 * 1024 * 1024},
})

app.post("/api/upload", upload.single("audio"), (req, res) => {
    const audioPath = req.file.path;
    const tags = NodeID3.read(audioPath);
    res.json({
        fileId: req.file.filename,
        tags: tags,
    });
})

app.post("/api/update/:fileId", upload.single("cover"), (req, res) => {
    const audioPath = path.join(UPLOADS_DIR, req.params.fileId);
    const fields = req.body;
    NodeID3.update({
        title: fields.title,
        artist: fields.artist,
        performerInfo: fields.albumArtist,
        album: fields.album,
        year: fields.year,
        trackNumber: fields.track,
        image: req.file && {
            mime: req.file.mimetype,
            imageBuffer: fs.readFileSync(req.file.path)
        }
    }, audioPath);

    res.json({message: "Updated successfully", success: true, title: fields.title});

    const imagePath = req.file.path;
    const cleanup = () => {
        fs.unlink(imagePath, (err) => {
            if(err) console.error("Cleanup failed:", err);
        })
    }
    res.on("finish", cleanup);
})


app.get("/api/download/:fileId", (req, res) => {
    const audioPath = path.join(UPLOADS_DIR, req.params.fileId);

    if(!fs.existsSync(audioPath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const tags = NodeID3.read(audioPath);
    let title = tags?.title || "edited-audio";
    title = title.replace(/[\/\\?%*:|"<>]/g, "").trim();
    
    res.download(audioPath, `${title}.mp3`);

    let cleanedUp = false;
    const cleanup = () => {
        if(cleanedUp) return;

        cleanedUp = true;
        fs.unlink(audioPath, (err) => {
            if(err) console.error("Cleanup failed:", err);
        })
    }

    res.on("finish", cleanup);
    res.on("close", cleanup);
})


app.post("/api/cleanup", (req, res) => {
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if(err) {
            console.error("Cleanup read failed:", err);
            return res.status(500).json({ success: false });
        }

        files.forEach((file) => {
            const filePath = path.join(UPLOADS_DIR, file);
            fs.unlink(filePath, (err) => {
                if(err) console.error("Cleanup failed for:", filePath, err);
            })
        });
        
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port : ${port}`);
})