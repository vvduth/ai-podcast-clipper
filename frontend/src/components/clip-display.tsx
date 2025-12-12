"use client";
import type { Clip } from "generated/prisma";
import { Download, Loader2, Play } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getClipPlayUrl } from "~/actions/generation";
import { Button } from "./ui/button";

function ClipCard({ clip }: { clip: Clip }) {
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  useEffect(() => {
    async function fetchPlayUrl() {
      setIsLoadingUrl(true);
      try {
        const result = await getClipPlayUrl(clip.id);
        if (result.sucess && result.url) {
          setPlayUrl(result.url);
        } else if (result.error) {
          console.error("Error fetching play URL:", result.error);
        }
      } catch (error) {
        console.error("Unexpected error fetching play URL:", error);
      } finally {
        setIsLoadingUrl(false);
      }
    }

    void fetchPlayUrl();
  }, [clip.id]);

  const handleDownload = () => {
    if (playUrl) {
      const link = document.createElement("a");
      link.href = playUrl || "";
      link.style.display = "none";
      document.body.append(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <div className="flex max-w-52 flex-col gap-2">
      <div className="bg-muted">
        {isLoadingUrl ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : playUrl ? (
          <video
            src={playUrl}
            controls
            preload="metadata"
            className="h-full w-full rounded-md object-cover"
          ></video>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="text-muted-foreground h-8 w-8 opacity-50" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleDownload} variant={"outline"} size={"sm"}>
          <Download className="mr-2 h-4 w-4" />
          Download Clip
        </Button>
      </div>
    </div>
  );
}

const ClipDisplay = ({ clips }: { clips: Clip[] }) => {
  if (clips.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">
        No clips available
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} />
      ))}
    </div>
  );
};

export default ClipDisplay;
