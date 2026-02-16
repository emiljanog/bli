"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";

type AdminMediaImageEditorProps = {
  defaultUrl?: string;
  restoreUrl?: string;
  fileInputName?: string;
  urlInputName?: string;
  croppedInputName?: string;
};

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropDragState = {
  pointerId: number;
  mode: "create" | "move" | "resize";
  startX: number;
  startY: number;
  originRect: CropRect | null;
};

type CropHoverMode = "create" | "move" | "resize";

const CROP_ASPECT_PRESETS = [
  { key: "free", label: "Free", ratio: 0 },
  { key: "1:1", label: "1:1", ratio: 1 },
  { key: "16:9", label: "16:9", ratio: 16 / 9 },
  { key: "4:3", label: "4:3", ratio: 4 / 3 },
  { key: "3:2", label: "3:2", ratio: 3 / 2 },
  { key: "4:5", label: "4:5", ratio: 4 / 5 },
  { key: "9:16", label: "9:16", ratio: 9 / 16 },
] as const;

type CropAspectPresetKey = (typeof CROP_ASPECT_PRESETS)[number]["key"];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function pointInImage(
  event: ReactPointerEvent<HTMLDivElement>,
  imageElement: HTMLImageElement,
): { x: number; y: number } {
  const bounds = imageElement.getBoundingClientRect();
  return {
    x: clamp(event.clientX - bounds.left, 0, bounds.width),
    y: clamp(event.clientY - bounds.top, 0, bounds.height),
  };
}

function isPointInsideRect(point: { x: number; y: number }, rect: CropRect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function isPointNearResizeCorner(point: { x: number; y: number }, rect: CropRect): boolean {
  const handleSize = 12;
  const cornerX = rect.x + rect.width;
  const cornerY = rect.y + rect.height;
  return Math.abs(point.x - cornerX) <= handleSize && Math.abs(point.y - cornerY) <= handleSize;
}

export function AdminMediaImageEditor({
  defaultUrl = "",
  restoreUrl,
  fileInputName = "mediaFile",
  urlInputName = "url",
  croppedInputName = "croppedImage",
}: AdminMediaImageEditorProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState("");
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [cropAspect, setCropAspect] = useState<CropAspectPresetKey>("free");
  const [cropError, setCropError] = useState("");
  const [hoverMode, setHoverMode] = useState<CropHoverMode>("create");
  const [dragMode, setDragMode] = useState<CropDragState["mode"] | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<CropDragState | null>(null);

  const sourceImage = useMemo(() => croppedImage || uploadedPreview || url, [croppedImage, uploadedPreview, url]);
  const effectiveRestoreUrl = restoreUrl || defaultUrl;

  function releaseUploadedPreview() {
    if (uploadedPreview) {
      URL.revokeObjectURL(uploadedPreview);
    }
  }

  useEffect(() => {
    return () => {
      if (uploadedPreview) {
        URL.revokeObjectURL(uploadedPreview);
      }
    };
  }, [uploadedPreview]);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    releaseUploadedPreview();
    setUploadedPreview(URL.createObjectURL(file));
    setCroppedImage("");
    setCropRect(null);
    setCropError("");
    setDragMode(null);
    setHoverMode("create");
  }

  function handleRestoreOriginal() {
    releaseUploadedPreview();
    setUploadedPreview(null);
    setCroppedImage("");
    setCropRect(null);
    setCropError("");
    setDragMode(null);
    setHoverMode("create");
    setUrl(effectiveRestoreUrl);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!imageRef.current || !sourceImage) return;

    const point = pointInImage(event, imageRef.current);
    const isResizeSelection = Boolean(cropRect && isPointNearResizeCorner(point, cropRect));
    const isMoveSelection = Boolean(cropRect && !isResizeSelection && isPointInsideRect(point, cropRect));

    const nextMode: CropDragState["mode"] = isResizeSelection ? "resize" : isMoveSelection ? "move" : "create";
    dragRef.current = {
      pointerId: event.pointerId,
      mode: nextMode,
      startX: point.x,
      startY: point.y,
      originRect: cropRect,
    };
    setDragMode(nextMode);

    if (!isMoveSelection && !isResizeSelection) {
      setCropRect({
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      });
    }
    setCropError("");
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!imageRef.current || !sourceImage) return;
    const point = pointInImage(event, imageRef.current);

    if (!dragRef.current) {
      if (cropRect && isPointNearResizeCorner(point, cropRect)) {
        setHoverMode("resize");
      } else if (cropRect && isPointInsideRect(point, cropRect)) {
        setHoverMode("move");
      } else {
        setHoverMode("create");
      }
      return;
    }

    if (dragRef.current.pointerId !== event.pointerId) return;

    const drag = dragRef.current;
    const aspectRatio = CROP_ASPECT_PRESETS.find((preset) => preset.key === cropAspect)?.ratio ?? 0;

    if (drag.mode === "resize" && drag.originRect) {
      const bounds = imageRef.current.getBoundingClientRect();
      const maxWidth = Math.max(4, bounds.width - drag.originRect.x);
      const maxHeight = Math.max(4, bounds.height - drag.originRect.y);
      const nextWidthRaw = drag.originRect.width + (point.x - drag.startX);
      const nextHeightRaw = drag.originRect.height + (point.y - drag.startY);

      if (!aspectRatio) {
        setCropRect({
          ...drag.originRect,
          width: clamp(nextWidthRaw, 4, maxWidth),
          height: clamp(nextHeightRaw, 4, maxHeight),
        });
        return;
      }

      const nextWidthCandidate = Math.max(4, nextWidthRaw);
      const nextHeightCandidate = Math.max(4, nextHeightRaw);
      const nextWidthFromHeight = nextHeightCandidate * aspectRatio;
      const mergedWidthCandidate = Math.max(nextWidthCandidate, nextWidthFromHeight);
      const safeWidth = clamp(mergedWidthCandidate, 4, Math.min(maxWidth, maxHeight * aspectRatio));
      const safeHeight = safeWidth / aspectRatio;

      setCropRect({
        ...drag.originRect,
        width: safeWidth,
        height: safeHeight,
      });
      return;
    }

    if (drag.mode === "move" && drag.originRect) {
      const bounds = imageRef.current.getBoundingClientRect();
      const nextX = clamp(
        drag.originRect.x + (point.x - drag.startX),
        0,
        Math.max(0, bounds.width - drag.originRect.width),
      );
      const nextY = clamp(
        drag.originRect.y + (point.y - drag.startY),
        0,
        Math.max(0, bounds.height - drag.originRect.height),
      );

      setCropRect({
        ...drag.originRect,
        x: nextX,
        y: nextY,
      });
      return;
    }

    const dx = point.x - drag.startX;
    const dy = point.y - drag.startY;

    if (!aspectRatio) {
      const x = Math.min(drag.startX, point.x);
      const y = Math.min(drag.startY, point.y);
      const width = Math.abs(dx);
      const height = Math.abs(dy);
      setCropRect({ x, y, width, height });
      return;
    }

    const bounds = imageRef.current.getBoundingClientRect();
    const dirX = dx >= 0 ? 1 : -1;
    const dirY = dy >= 0 ? 1 : -1;
    const maxWidthAvail = dirX > 0 ? bounds.width - drag.startX : drag.startX;
    const maxHeightAvail = dirY > 0 ? bounds.height - drag.startY : drag.startY;
    const desiredWidth = Math.max(Math.abs(dx), Math.abs(dy) * aspectRatio);
    const maxWidthByHeight = maxHeightAvail * aspectRatio;
    const safeWidth = clamp(desiredWidth, 0, Math.min(maxWidthAvail, maxWidthByHeight));
    const safeHeight = safeWidth / aspectRatio;

    const x = dirX > 0 ? drag.startX : drag.startX - safeWidth;
    const y = dirY > 0 ? drag.startY : drag.startY - safeHeight;
    setCropRect({ x, y, width: safeWidth, height: safeHeight });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    const mode = dragRef.current.mode;
    dragRef.current = null;
    setDragMode(null);

    setCropRect((previous) => {
      if (!previous) return null;
      if (mode === "create" && (previous.width < 4 || previous.height < 4)) return null;
      return previous;
    });
  }

  function handlePointerLeave() {
    if (!dragRef.current) {
      setHoverMode("create");
    }
  }

  function handleSelectFullImage() {
    if (!imageRef.current || !sourceImage) {
      setCropError("Select or upload an image first.");
      return;
    }
    const bounds = imageRef.current.getBoundingClientRect();
    setCropRect({
      x: 0,
      y: 0,
      width: Math.max(4, bounds.width),
      height: Math.max(4, bounds.height),
    });
    setCropError("");
  }

  const cropCursor =
    dragMode === "move"
      ? "grabbing"
      : dragMode === "resize"
        ? "nwse-resize"
        : hoverMode === "move"
          ? "grab"
          : hoverMode === "resize"
            ? "nwse-resize"
            : "crosshair";

  async function handleCrop() {
    if (!sourceImage) {
      setCropError("Select or upload an image first.");
      return;
    }
    if (!cropRect || cropRect.width < 4 || cropRect.height < 4 || !imageRef.current) {
      setCropError("Drag on the image to select crop area first.");
      return;
    }

    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Image cannot be loaded for crop."));
        image.src = sourceImage;
      });

      const bounds = imageRef.current.getBoundingClientRect();
      const scaleX = image.width / Math.max(1, bounds.width);
      const scaleY = image.height / Math.max(1, bounds.height);

      const sx = clamp(Math.floor(cropRect.x * scaleX), 0, Math.max(0, image.width - 1));
      const sy = clamp(Math.floor(cropRect.y * scaleY), 0, Math.max(0, image.height - 1));
      const sw = clamp(Math.floor(cropRect.width * scaleX), 1, Math.max(1, image.width - sx));
      const sh = clamp(Math.floor(cropRect.height * scaleY), 1, Math.max(1, image.height - sy));

      const maxOutputSide = 1600;
      const scaleDown = Math.min(1, maxOutputSide / Math.max(sw, sh));
      const outputWidth = Math.max(1, Math.round(sw * scaleDown));
      const outputHeight = Math.max(1, Math.round(sh * scaleDown));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        setCropError("Canvas is not supported in this browser.");
        return;
      }

      context.drawImage(image, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
      const dataUrl = canvas.toDataURL("image/webp", 0.88);
      setCroppedImage(dataUrl);
      setCropRect(null);
      setCropError("");
    } catch {
      setCropError("Crop failed. Try upload image file and crop again.");
    }
  }

  return (
    <div className="space-y-3">
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">Upload image</span>
        <input
          name={fileInputName}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">Image URL</span>
        <input
          name={urlInputName}
          type="text"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setCroppedImage("");
            setCropRect(null);
            setCropError("");
          }}
          placeholder="https://..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <input type="hidden" name={croppedInputName} value={croppedImage} />

      {sourceImage ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">
            Drag on image to select crop area. Drag inside selected area to move it.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {CROP_ASPECT_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  setCropAspect(preset.key);
                  setCropRect(null);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  cropAspect === preset.key
                    ? "border-[#2ea2cc] bg-[#2ea2cc] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2">
            <div className="flex justify-center">
              <div
                className="relative inline-block"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                style={{ touchAction: "none", cursor: cropCursor }}
              >
                <img
                  ref={imageRef}
                  src={sourceImage}
                  alt="Media preview"
                  className="block max-h-[420px] max-w-full select-none"
                  draggable={false}
                />
                {cropRect ? (
                  <div
                    className="pointer-events-none absolute border-2 border-[#2ea2cc] bg-[#2ea2cc]/20"
                    style={{
                      left: `${cropRect.x}px`,
                      top: `${cropRect.y}px`,
                      width: `${cropRect.width}px`,
                      height: `${cropRect.height}px`,
                    }}
                  >
                    <span
                      className="absolute h-3 w-3 rounded-full border border-white bg-[#2ea2cc] shadow-sm"
                      style={{
                        right: "-7px",
                        bottom: "-7px",
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSelectFullImage}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Select Full Image
        </button>
        <button
          type="button"
          onClick={handleCrop}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Apply Crop
        </button>
        <button
          type="button"
          onClick={() => {
            setCropRect(null);
            setCropError("");
            setDragMode(null);
            setHoverMode("create");
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Clear Selection
        </button>
        {effectiveRestoreUrl ? (
          <button
            type="button"
            onClick={handleRestoreOriginal}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Restore Original
          </button>
        ) : null}
      </div>

      {cropError ? <p className="text-xs font-semibold text-rose-700">{cropError}</p> : null}
    </div>
  );
}
