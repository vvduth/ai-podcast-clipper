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