"use server"

import { db } from "~/server/db"

export async function processVideo(uploadFileId:string) {
    const uploadVideo = await db.uploadedFile.findUniqueOrThrow({
        where: { id: uploadFileId },
        select: {
            uploaded: true,
            id: true,
            userId: true,
        }
    })
}