"use client";

import { useCallback, useId, useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { SessionStorySlide } from "@/components/sessions/SessionStorySlide";
import type { SessionStoryData } from "@/lib/session-share";
import { STORY_HEIGHT, STORY_WIDTH } from "@/lib/session-share";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function SessionShareButton({
  data,
  className = "",
}: {
  data: SessionStoryData;
  className?: string;
}) {
  const slideId = useId().replace(/:/g, "");
  const [loading, setLoading] = useState(false);

  const generateImage = useCallback(async () => {
    const node = document.getElementById(slideId);
    if (!node) return null;

    await document.fonts.ready;

    const logo = node.querySelector("img");
    if (logo && !logo.complete) {
      await new Promise<void>((resolve, reject) => {
        logo.onload = () => resolve();
        logo.onerror = () => reject(new Error("Logo failed to load"));
      });
    }

    return toPng(node, {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      pixelRatio: 1,
      cacheBust: true,
    });
  }, [slideId]);

  const downloadImage = useCallback((dataUrl: string) => {
    const link = document.createElement("a");
    link.download = `peladinhas-${slugify(data.title) || "sessao"}.png`;
    link.href = dataUrl;
    link.click();
  }, [data.title]);

  const shareImage = useCallback(async () => {
    setLoading(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File(
        [blob],
        `peladinhas-${slugify(data.title) || "sessao"}.png`,
        { type: "image/png" },
      );

      if (
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          files: [file],
          title: data.title,
          text: "Peladinhas da Invicta",
        });
        return;
      }

      downloadImage(dataUrl);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        const dataUrl = await generateImage();
        if (dataUrl) downloadImage(dataUrl);
      } catch {
        // ignore secondary failure
      }
    } finally {
      setLoading(false);
    }
  }, [data.title, downloadImage, generateImage]);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed overflow-hidden"
        style={{ left: -9999, top: 0, zIndex: -1 }}
      >
        <SessionStorySlide data={data} id={slideId} />
      </div>

      <button
        type="button"
        onClick={shareImage}
        disabled={loading}
        aria-label="Partilhar nos stories"
        className={`flex h-10 w-10 items-center justify-center text-text-primary transition hover:text-gold disabled:opacity-60 ${className}`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Share2 className="h-5 w-5" strokeWidth={2} aria-hidden />
        )}
      </button>
    </>
  );
}
