// server.mjs
// Begin Step 4 of tutorial at https://www.digitalocean.com/community/tutorials/how-to-build-a-media-processing-api-in-node-js-with-express-and-ffmpeg-wasm

import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const port = 3002;

const upload = multer( {
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024}
});

app.use(cors());

app.post('/thumbnail', upload.single('video'), async (req, res) => {
    const videoData = req.file.buffer;

    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`[info] ffmpeg-api listening at http://localhost:${port}`)
});