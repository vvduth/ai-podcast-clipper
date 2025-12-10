import pathlib
import time
import uuid

import boto3
import modal
from fastapi import HTTPException,status
from fastapi.openapi.models import HTTPBearer
from fastapi.params import Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
import whisperx
import subprocess
import os
import json

from torch.cuda import device


class ProcessVideoRequest():
    s3_key: str

# build a custom Docker image with CUDA and Python 3.13
# the image includes ffmpeg, OpenCV dependencies, cuDNN, required Python packages,
image = (modal.Image.from_registry(
    "nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.12")
    .apt_install(["ffmpeg", "libgl1-mesa-glx", "wget", "libcudnn8", "libcudnn8-dev"])
    .pip_install_from_requirements("requirements.txt")
    # install custom font
    .run_commands(["mkdir -p /usr/share/fonts/truetype/custom",
                   "wget -O /usr/share/fonts/truetype/custom/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
                   "fc-cache -f -v"])
    # add local code
    .add_local_dir("asd", "/asd", copy=True))

app = modal.App("ai-podcast-clipper", image=image)

volume = modal.Volume.from_name(
    "ai-podcast-clipper-model-cache", create_if_missing=True
)

# Mount path for torch cache
# torch cache is for storing pre-trained models and datasets
mount_path = "/root/.cache/torch"

auth_scheme = HTTPBearer


# Define the Modal class with GPU and FastAPI endpoint
@app.cls(gpu="H100", timeout=900, retries=0, scaledown_window=20,
secrets=[modal.Secret.from_name("ai-podcast-clipper")]
,volumes={mount_path: volume})
class AiPodcastClipper:
    @modal.enter()
    def load_model(self):
        print("loading models")
        self.whisperx_model = whisperx.load_model("large-v2",
                                                  device="cuda", compute_type="float16")
        self.alignment_model, self.metadata = whisperx.load_align_model(
            language_code="en", device="cuda"
        )

        print("Transcription model and alignment model loaded...")

    def transcribe_video(self, base_dir:str, video_path: str) -> str:
        audio_path = base_dir / "audio.wav"
        extract_cmd = f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
        subprocess.run(extract_cmd, shell=True, check=True, capture_output=True )

        print("Starting transcription with whisperX...")
        start_time = time.time()

        audio = whisperx.load_audio(str(audio_path))
        result = self.whisperx_model.transcribe(audio, batch_size=16)

        result = whisperx.align(
            result["segments"],
            self.alignment_model,
            self.metadata,
            audio,
            device="cuda",
            return_char_alignments=False,
        )

        duration = time.time() - start_time
        print("Transcription completed in {:.2f} seconds".format(duration))

        print(json.dumps(result, indent=2))
    @modal.fastapi_endpoint(method="POST")
    def process_video(self, request: ProcessVideoRequest, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        s3_key = request.s3_key
        if token.credentials != os.environ["AUTH_TOKEN"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token",
                                headers={"WWW-Authenticate": "Bearer"})
        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)

        # download video file
        video_path = base_dir / "input.mp4"
        s3_client = boto3.client("s3")
        s3_client.download_file("ai-podcast-clipper-dukem", s3_key, str(video_path))

        print(os.listdir(base_dir))

# define a local entrypoint for testing
@app.local_entrypoint()
def main():
    import requests

    ai_podcast_clipper = AiPodcastClipper()

    url = ai_podcast_clipper.process_video.web_url

    payload = {
        "s3_key": "test1/mma5mins.mp4"
    }

    headers = {
        "Content-Type": "application/json",
        # the one that you set in modal
        "Authorization": "Bearer 123123"
    }

    response = requests.post(url, json=payload, headers=headers)

    response.raise_for_status()
    result = response.json()
    print(result)