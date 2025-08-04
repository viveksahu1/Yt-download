const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const { spawn } = require('child_process');

app.post('/prepare', (req, res) => {
  const videoUrl = req.body.url;
  const filename = `video-${Date.now()}.mp4`;
  const filepath = path.join(__dirname, filename);

  console.log(`Starting download: ${videoUrl}`);

  const ytdlpPath = './bin/yt-dlp';
  const ytdlp = spawn(ytdlpPath, ['-f', 'b', '-o', filepath, videoUrl]);

  ytdlp.stdout.on('data', (data) => {
    console.log(`[yt-dlp stdout]: ${data}`);
  });

  ytdlp.stderr.on('data', (data) => {
    console.error(`[yt-dlp stderr]: ${data}`);
  });

  ytdlp.on('error', (err) => {
    console.error('yt-dlp spawn error:', err);
    res.status(500).json({ error: 'yt-dlp spawn failed' });
  });

  ytdlp.on('close', (code) => {
    if (code === 0) {
      console.log('Download completed:', filename);
      res.json({ file: filename });
    } else {
      console.error('yt-dlp failed with code:', code);
      res.status(500).json({ error: 'Download failed' });
    }
  });
});


app.get('/download', (req, res) => {
  const filename = req.query.file;
  const filepath = path.join(__dirname, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).send("File not found");
  }

  res.download(filepath, filename, (err) => {
    if (err) {
      console.error("Error sending file:", err);
    }
    fs.unlink(filepath, () => {}); // Cleanup after download
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
