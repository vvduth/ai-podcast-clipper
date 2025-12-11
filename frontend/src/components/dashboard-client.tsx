"use client";
import React from "react";
import type { Clip } from "generated/prisma";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
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
            <TabsTrigger value="my-clips">
                Clips ({clips.length})
            </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Upload podcast
                    </CardTitle>
                    <CardDescription>
                        Upload your podcast audio files to get started.
                    </CardDescription>
                </CardHeader>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardClient;
