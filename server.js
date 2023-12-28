const express = require('express');
const youtubedl = require('youtube-dl-exec');
const app = express();
const port = 4000;
const cors  = require("cors")

app.use(cors())
app.get("/", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: "Invalid request. Please provide a 'url' parameter." });
    }

    try {
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ["referer:youtube.com", "user-agent:googlebot"],
            format: "best",
        });

        if (output && output.requested_downloads && output.requested_downloads.length > 0) {
            const videoUrl = output.requested_downloads[0].url;
            res.send(videoUrl);
        } else {
            res.status(500).json({ error: 'Unable to retrieve video URL' });
        }
    } catch (error) {
        if (error.message.includes('no video formats found')) {
            res.status(404).json({ error: 'Video not found or URL is invalid' });
        } else {
            res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


module.exports = app