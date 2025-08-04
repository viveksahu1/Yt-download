echo "Downloading yt-dlp to ./bin directory..."

mkdir -p bin
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o bin/yt-dlp
chmod +x bin/yt-dlp

echo "yt-dlp installed in bin/"