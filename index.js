const express = require('express');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const { getFacebookVideo } = require('facebook-video-downloader');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'No URL provided' });
    }

    if (url.includes('youtube.com')) {
        try {
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
            res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
            ytdl(url, { format: format }).pipe(res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else if (url.includes('facebook.com')) {
        try {
            const video = await getFacebookVideo(url);
            res.setHeader('Content-Disposition', `attachment; filename="facebook_video.mp4"`);
            res.redirect(video.url);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: 'Unsupported video URL' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
