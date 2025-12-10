# Creating clips


## basic flow
* user upload full podcast to s3 => video processing is queued => a backend endpoint is called with the s3 key to the original upload => backend download video from s3 => clips are created from video and upload to s3 => frontend scan s3 folder for new clips, and shows user the new clips


## s3 bucket policy

[{
    "AllowedHeaders": [
        "Content-Type",
        "Content-Length",
        "Authorization"
    ],
    "AllowedMethods": [
        "PUT",
    ],
    "AllowedOrigins": [
        "*"
    ],
    "ExposeHeaders": [
        "ETag"
    ],
    "MaxAgeSeconds": 3600
}]

## policy for aws iam user 
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [s3:ListBucket],
			"Resource": ["arn:aws:s3:::ai-podcast-clipper-dukem"]
		}, 
		{
		    "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            "Resource": ["arn:aws:s3:::ai-podcast-clipper-dukem/*"]
		}
	]
}

## steps to cctreat a vertical short
* 1 . Looping hrough tracks
* tracks, sequence if detechtion of the same face across consecutive frames
* each track contaain: 
  * which frame the face appear in, 
  * the position  (x,y) size (s) and 
  * and other porperties of the face in each frame
  * score indicatiing how liekly it ism that this face is speacking in each frame
* wehn looping over tracks : avg the sspeackerscore over a window of 30 frames for smoothes
- by avg the score, you get the more stabe, less jittery score for each frame

* 2: wrote a new video:
* * create a new cv2 video writer . a viode consist of frames so we will create a new video by looping through frames, and cropping the shit out of each frame the face most likely speaking in that frame.