import glob
import json
import pathlib
import pickle
import shutil
import subprocess
import time
import uuid
import boto3
import cv2
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import ffmpegcv
import modal
import numpy as np
from pydantic import BaseModel
import os
from google import genai

import pysubs2
from tqdm import tqdm
import whisperx



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

auth_scheme = HTTPBearer()

def process_clip(base_dir: str, original_video_path: str,
                 s3_key: str, start_time: float,
                 end_time: float, clip_index: int,
                 transcript_segments: list):
    clip_name = f"clip_{clip_index}"
    s3_key_dir = os.path.dirname(s3_key)
    output_s3_key = f"{s3_key_dir}/{clip_name}.mp4"
    print(f"Output S3 Key: {output_s3_key}")

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

        print("Creating GenAI client...")
        self.gemini_client = genai.Client(api_key=os.environ("GENAI_API_KEY"))
        print("GenAI client initialized.")

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

        segments = []

        if "word_segments" in result:
            for word_segment in result["word_segments"]:
                segments.append({
                    "start": word_segment["start"],
                    "end": word_segment["end"],
                    "word": word_segment["word"],
                })

        return json.dumps(segments)

    def identify_moments(self, transcript: dict):
        response = self.gemini_client.models.generate_content(model="gemini-2.5-flash-preview-04-17", contents="""
    This is a podcast video transcript consisting of word, along with each words's start and end time. I am looking to create clips between a minimum of 30 and maximum of 60 seconds long. The clip should never exceed 60 seconds.

    Your task is to find and extract stories, or question and their corresponding answers from the transcript.
    Each clip should begin with the question and conclude with the answer.
    It is acceptable for the clip to include a few additional sentences before a question if it aids in contextualizing the question.

    Please adhere to the following rules:
    - Ensure that clips do not overlap with one another.
    - Start and end timestamps of the clips should align perfectly with the sentence boundaries in the transcript.
    - Only use the start and end timestamps provided in the input. modifying timestamps is not allowed.
    - Format the output as a list of JSON objects, each representing a clip with 'start' and 'end' timestamps: [{"start": seconds, "end": seconds}, ...clip2, clip3]. The output should always be readable by the python json.loads function.
    - Aim to generate longer clips between 40-60 seconds, and ensure to include as much content from the context as viable.

    Avoid including:
    - Moments of greeting, thanking, or saying goodbye.
    - Non-question and answer interactions.

    If there are no valid clips to extract, the output should be an empty list [], in JSON format. Also readable by json.loads() in Python.

    The transcript is as follows:\n\n""" + str(transcript))
        print(f"Identified moments response: ${response.text}")
        return response.text
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

        # 1. Transcribe video
        transcript_segments_json = self.transcribe_video(base_dir, video_path)
        transcript_segments = json.loads(transcript_segments_json)

        # 2. identity key moments using GenAI
        print("Identifying key moments using GenAI...")
        identified_moments_raw = self.identify_moments(transcript_segments)

        cleaned_json_string = identified_moments_raw.strip()
        if cleaned_json_string.startswith("```json"):
            cleaned_json_string = cleaned_json_string[len("```json"):].strip()
        if cleaned_json_string.endswith("```"):
            cleaned_json_string = cleaned_json_string[:-len("```")].strip()

        clip_moments = json.loads(cleaned_json_string)
        if not clip_moments or not isinstance(clip_moments, list):
            raise ValueError("Invalid response format from GenAI. Expected a list of clip moments.")
            clip_moments = []
        print(clip_moments)

        # 3. loop through clip moment and extract clips
        for index, moment in enumerate(clip_moments[:3]):
            if "start" in moment and "end" in moment:
                print("processing moment:" + str(index) + " start:" + str(moment["start"]) + " end:" + str(moment["end"]))
                process_clip[base_dir, video_path, s3_key, moment["start"], moment["end"], index, transcript_segments]
        if base_dir.exists():
            print("Cleaning up temporary files " + str(base_dir))
            shutil.rmtree(base_dir,ignore_errors=True)


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