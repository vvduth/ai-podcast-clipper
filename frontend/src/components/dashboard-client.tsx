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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Loader2, UploadCloud } from "lucide-react";
import { generateUploadUrl } from "~/actions/s3";
import { toast } from "sonner";
import { processSitcom, processVideo } from "~/actions/generation";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import ClipDisplay from "./clip-display";
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
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter();
  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setRefreshing(false);
      router.refresh();
    }, 600);
  }
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

      await processVideo(uploadedFileId);
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

  const handleUploadSitcom = async () => {
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

      await processSitcom(uploadedFileId);
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
          <TabsTrigger value="upload-sitcom" className="border-2 border-gray-900">
            Upload Sitcom (Beta)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload-sitcom">
          <Card>
            <CardHeader>
              <CardTitle>Upload sitcoms</CardTitle>
              <CardDescription>
                Upload your movies or TV show episodes to get started.
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
              <div className="mt-2 flex items-start justify-between">
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
                  onClick={handleUploadSitcom}
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
              {uploadedFiles.length > 0 && (
                <div className="pt-6">
                  <div className="flex mb-2 items-center justify-between">
                    <h3 className="text-md mb-2 font-medium">Queue status</h3>
                    <Button variant={"outline"} 
                    size={"sm"}
                    onClick={handleRefresh} disabled={refreshing}>
                      {refreshing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         
                        </>
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Clips created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="max-w-xs truncate font-medium">{file.filename}</TableCell>
                            <TableCell>{file.createdAt.toLocaleDateString()}</TableCell>
                            <TableCell>
                               {file.status === "queued" && (
                                <Badge variant="outline">Queued</Badge>
                              )}
                              {file.status === "processing" && (
                                <Badge variant="secondary">Processing</Badge>
                              )}
                              {file.status === "processed" && (
                                <Badge variant="default">Processed</Badge>
                              )}
                              {file.status === "no credits" && (
                                <Badge variant="destructive">No credits</Badge>
                              )}
                              {file.status === "failed" && (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                                  {file.clipsCount > 0 ? (
                                <span>
                                  {file.clipsCount} clip
                                  {file.clipsCount !== 1 ? "s" : ""}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  No clips yet
                                </span>
                              )}
                            </TableCell>
                        </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
              <div className="mt-2 flex items-start justify-between">
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
              {uploadedFiles.length > 0 && (
                <div className="pt-6">
                  <div className="flex mb-2 items-center justify-between">
                    <h3 className="text-md mb-2 font-medium">Queue status</h3>
                    <Button variant={"outline"} 
                    size={"sm"}
                    onClick={handleRefresh} disabled={refreshing}>
                      {refreshing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         
                        </>
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Clips created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="max-w-xs truncate font-medium">{file.filename}</TableCell>
                            <TableCell>{file.createdAt.toLocaleDateString()}</TableCell>
                            <TableCell>
                               {file.status === "queued" && (
                                <Badge variant="outline">Queued</Badge>
                              )}
                              {file.status === "processing" && (
                                <Badge variant="outline">Processing</Badge>
                              )}
                              {file.status === "processed" && (
                                <Badge variant="outline">Processed</Badge>
                              )}
                              {file.status === "no credits" && (
                                <Badge variant="destructive">No credits</Badge>
                              )}
                              {file.status === "failed" && (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                                  {file.clipsCount > 0 ? (
                                <span>
                                  {file.clipsCount} clip
                                  {file.clipsCount !== 1 ? "s" : ""}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  No clips yet
                                </span>
                              )}
                            </TableCell>
                        </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="my-clips">
          <Card>
            <CardHeader>
              <CardTitle>Your Clips</CardTitle>
               <CardDescription>
              View and manage the AI-generated clips from your uploaded.
              Procesing may take a few minutes depending on the length of your
              podcast.
            </CardDescription>
            </CardHeader>
           <CardContent>
            <ClipDisplay clips={clips} />
           </CardContent>
            </Card>
        </TabsContent>

        
      </Tabs>
    </div>
  );
};

export default DashboardClient;
