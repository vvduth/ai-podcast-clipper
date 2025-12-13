"use server";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";
import { env } from "~/env";
import { inngest } from "~/inngest/client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function processVideo(uploadedFileId: string) {
  const uploadVideo = await db.uploadedFile.findUniqueOrThrow({
    where: { id: uploadedFileId },
    select: {
      uploaded: true,
      id: true,
      userId: true,
    },
  });

  if (uploadVideo.uploaded) {
    return;
  }

  await inngest.send({
    name: "process-video-events",
    data: {
      uploadedFileId: uploadVideo.id,
      userId: uploadVideo.userId,
    },
  });

  await db.uploadedFile.update({
    where: { id: uploadVideo.id },
    data: {
      uploaded: true,
    },
  });

  revalidatePath("/dashboard");
}

export async function processSitcom(uploadedFileId:string) {
  const uploadVideo = await db.uploadedFile.findUniqueOrThrow({
    where: { id: uploadedFileId },
    select: {
      uploaded: true,
      id: true,
      userId: true,
    },
  });

  if (uploadVideo.uploaded) {
    return;
  }

  await inngest.send({
    name: "process-video-events",
    data: {
      uploadedFileId: uploadVideo.id,
      userId: uploadVideo.userId,
      type: "sitcom",
    },
  });

  await db.uploadedFile.update({
    where: { id: uploadVideo.id },
    data: {
      uploaded: true,
    },
  });

  revalidatePath("/dashboard");
}

export async function getClipPlayUrl(clipId: string): Promise<{
  sucess: boolean;
  url?: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { sucess: false, error: "Not authenticated" };
  }
  try {
    const clip = await db.clip.findUniqueOrThrow({
      where: {
        id: clipId,
        userId: session.user.id,
      },
    });

    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: clip.s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return { sucess: true, url: signedUrl };
  } catch (error) {
    return { sucess: false, error: "Failed to get clip play URL" };
  }
}
