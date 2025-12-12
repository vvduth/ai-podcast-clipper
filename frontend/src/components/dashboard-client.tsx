"use client";

import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import React, { useState } from "react";
import type { Clip } from "generated/prisma";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, UploadCloud } from "lucide-react";
import { generateUploadUrl } from "~/actions/s3";
import { set } from "zod";
import { toast } from "sonner";
const DashboardClient = ({
  uploadedFiles,
  clips,
}: {
  uploadedFiles: {
    id: string;
    s3Key: string;
    filename: string;
    status: string;
    clipsCount: number;
    createdAt: Date;
  }[];
  clips: Clip[];
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    const file = files[0]!;

    setUploading(true);
    try {
      // client => bucket
      // client => next js backend => s3 bucket
      const {
        signedUrl,
        success,

        uploadedFileId,
      } = await generateUploadUrl({
        filename: file.name,
        contentType: file.type,
      });

      if (!success) {
        throw new Error("Failed to generate upload URL");
      }
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3 " + uploadResponse.status);
      }
      setFiles([]);
      toast.success("File uploaded successfully.", {
        description: "Processing will begin shortly. Check the status below",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dukem short</h1>
          <p className="text-muted-foreground">
            Upload your podcast and get AI-generated clips instantly.
          </p>
        </div>
        <Link href={"/dashboard/billing"}>
          <Button>Manage Subscription</Button>
        </Link>
      </div>
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">
            Uploads ({uploadedFiles.length})
          </TabsTrigger>
          <TabsTrigger value="my-clips">Clips ({clips.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload podcast</CardTitle>
              <CardDescription>
                Upload your podcast audio files to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={handleDrop}
                accept={{ "video/mp4": [".mp4"] }}
                maxSize={500 * 1024 * 1024} // 500MB
                disabled={uploading}
                maxFiles={1}
              >
                {(dropzone: DropzoneState) => (
                  <>
                    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg p-10 text-center">
                      <UploadCloud className="text-muted-foreground h-12 w-12" />
                      <p className="font-medium">
                        Drag and drop your files here, or click to select files
                      </p>
                      <p className="text-muted-foreground text-sm">
                        or click to browse(mp4 up to 500MB)
                      </p>
                      <Button
                        variant={"default"}
                        size={"sm"}
                        disabled={uploading}
                      >
                        Browse files
                      </Button>
                    </div>
                  </>
                )}
              </Dropzone>
              <div className="flex items-start justify-between">
                <div>
                  {files.length > 0 && (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Selected files:</p>
                      {files.map((file) => (
                        <p key={file.name} className="text-muted-foreground">
                          {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  className=""
                  disabled={files.length === 0 || uploading}
                  onClick={handleUpload}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Start Upload"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardClient;
