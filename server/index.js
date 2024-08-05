import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process"; //watch out
import { stderr, stdout } from "process";
const app = express();

//multer middleware
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
  },
});

//multer configuaration

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Hello Server from home" });
});

// app.post("/upload", upload.single("file"), function (req, res) {
//   // convert video in HLS format
//   const lessionId = uuidv4();
//   const videoPath = req.file.path;
//   const outputPath = `./uploads/course/${lessionId}`;
//   const hlsPath = `${outputPath}/index.m3u8`;
//   console.log("hlsPath", hlsPath);

//   // if the output directory doesn't exist, create it
//   if (!fs.existsSync(outputPath)) {
//     fs.mkdirSync(outputPath, { recursive: true });
//   }

//   // command to convert video to HLS format using ffmpeg

//   const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

//   // run the ffmpeg command; usually done in a separate process (queued)
//   exec(ffmpegCommand, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`exec error: ${error}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.log(`stderr: ${stderr}`);
//     const videoUrl = `http://localhost:3000/uploads/course/${lessionId}/index.m3u8`;
//     res.json({
//       message: "Video converted to HLS format",
//       videoUrl: videoUrl,
//       lessonId: lessionId,
//     });
//   });
// });
app.post("/upload", upload.single("file"), function (req, res) {
  const lessionId = uuidv4();
  const videoPath = req.file.path;
  const outputPath = `./uploads/course/${lessionId}`;
  const hlsPath = `${outputPath}/index.m3u8`;

  console.log("hlsPath", hlsPath);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const resolutions = [
    { name: "240p", height: 240, bitrate: "400k" },
    { name: "360p", height: 360, bitrate: "800k" },
    { name: "480p", height: 480, bitrate: "1400k" },
    { name: "720p", height: 720, bitrate: "2800k" },
    { name: "1080p", height: 1080, bitrate: "5000k" },
  ];

  const ffmpegCommands = resolutions.map((res) => {
    const { name, height, bitrate } = res;
    return `ffmpeg -i ${videoPath} -vf "scale=-2:${height}" -c:a aac -b:a 128k -c:v h264 -b:v ${bitrate} -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/${name}_%03d.ts" ${outputPath}/${name}.m3u8`;
  });

  const masterPlaylistContent = resolutions
    .map((res) => {
      const { name, height, bitrate } = res;
      return `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate.replace(
        "k",
        "000"
      )},RESOLUTION=1920x${height}\n${name}.m3u8`;
    })
    .join("\n");

  fs.writeFileSync(`${outputPath}/index.m3u8`, masterPlaylistContent);

  const execCommands = ffmpegCommands.join(" && ");

  exec(execCommands, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: error.message });
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    const videoUrl = `http://localhost:4000/uploads/course/${lessionId}/index.m3u8`;
    res.json({
      message: "Video converted to HLS format",
      videoUrl: videoUrl,
      lessonId: lessionId,
    });
  });
});

app.listen(4000, () => {
  console.log("Server Running at 4000");
});
