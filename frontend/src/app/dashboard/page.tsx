"use server"
import { redirect } from 'next/navigation'
import React from 'react'
import DashboardClient from '~/components/dashboard-client'
import { auth } from '~/server/auth'
import { db } from '~/server/db'

const DashboardPage = async() => {
  const session = await auth()

  if (!session || !session?.user?.id) {
    // redirect to login
    redirect("/login");
  }
  

  const userData = await db.user.findUniqueOrThrow({
    where: {
      id: session.user.id,
    },
    select: {
      uploadedFiles: {
        where: {
          uploaded: true
        },
        select: {
          id: true,
          s3Key: true,
          displayName: true,
          status: true,
          created: true,
          _count: {
            select : {
              clips: true
            }
          }
        }
      },
      clips: {
        orderBy: {
          createdAt: 'desc'
        },
      }
    }
  })

  if (!userData) {
    return <div>No user data found</div>
  }
  const formattedFiles = userData?.uploadedFiles.map(file => ({
    id: file.id,
    s3Key: file.s3Key,
    filename : file.displayName || 'Unnamed file',
    status: file.status,
    clipsCount: file._count.clips,
    createdAt: file.created,
  }))
  return (
    <DashboardClient 
      uploadedFiles={formattedFiles}
      clips={userData.clips}
    />
  )
}

export default DashboardPage
