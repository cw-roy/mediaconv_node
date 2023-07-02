// server.mjs

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

const ffmpegInstance = createFFmpeg({ log: true });
let ffmpegLoadingPromise = ffmpegInstance.load();

async function getFFmpeg() {
    if (ffmpegLoadingPromise) {
        await ffmpegLoadingPromise;
        ffmpegLoadingPromise = undefined;
    }
    return ffmpegInstance;
}

const app = express();
const port = 3002;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
});

app.use(cors());

app.post('/thumbnail', upload.single('video'), async (req, res) => {
    try {
        const videoData = req.file.buffer;

        // this is where the magic starts to happen
        const ffmpeg = await getFFmpeg();

        const inputFileName = `input-video`;
        const outputFileName = `output-image.png`;
        let outputData = null;

        ffmpeg.FS('writeFile', inputFileName, videoData);

        /* this is where you specify the FFMpeg commands.
        these will change when I build the conversion operation */

        await ffmpeg.run(
            '-ss', '00:00:01.000', // seek to specfied time
            '-i', inputFileName,
            '-frames:v', '1', // number of frames to capture
            outputFileName
        );

        outputData = ffmpeg.FS('readFile', outputFileName);
        ffmpeg.FS('unlink', inputFileName);
        ffmpeg.FS('unlink', outputFileName);

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment;filename=${outputFileName}`,
            'Content-Length': outputData.length
        });
        res.end(Buffer.from(outputData, 'binary'));
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.listen(port, () => {
    console.log(`[info] ffmpeg-api listening at http://localhost:${port}`)
});