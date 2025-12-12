"use server"

import { revalidatePath } from "next/cache"
import { inngest } from "~/inngest/client"
import { db } from "~/server/db"

export async function processVideo(uploadedFileId:string) {
    const uploadVideo = await db.uploadedFile.findUniqueOrThrow({
        where: { id: uploadedFileId },
        select: {
            uploaded: true,
            id: true,
            userId: true,
        }
    })

    if (uploadVideo.uploaded) {
        return 
    }

    await inngest.send({
        name: "process-video-events",
        data: {
            uploadedFileId: uploadVideo.id,
            userId: uploadVideo.userId,
        }
    })

    await db.uploadedFile.update({
        where: { id: uploadVideo.id },
        data: {
            uploaded: true,
        }
    })
    
    revalidatePath("/dashboard")
}