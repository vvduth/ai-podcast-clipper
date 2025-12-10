from pytubefix import YouTube
from pytubefix.cli import on_progress

url = "https://www.youtube.com/watch?v=Pqir-oyD8PY"
url2 = "https://www.youtube.com/watch?v=n0UGSskwGrM"

yt = YouTube(url2, on_progress_callback=on_progress)
print(f"Title: {yt.title}")

ys = yt.streams.get_highest_resolution()
ys.download()