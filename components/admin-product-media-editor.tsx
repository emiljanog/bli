"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

type AdminProductMediaEditorProps = {
  imageName?: string;
  galleryName?: string;
  defaultImage?: string;
  defaultGallery?: string[];
};

function splitMediaEntries(raw: string): string[] {
  return raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminProductMediaEditor({
  imageName = "image",
  galleryName = "gallery",
  defaultImage = "",
  defaultGallery = [],
}: AdminProductMediaEditorProps) {
  const [image, setImage] = useState(defaultImage);
  const [galleryText, setGalleryText] = useState(defaultGallery.join("\n"));
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedGalleryPreviews, setUploadedGalleryPreviews] = useState<string[]>([]);

  const galleryItems = useMemo(() => splitMediaEntries(galleryText), [galleryText]);
  const previewImage = uploadedImagePreview || image;
  const previewGallery = uploadedGalleryPreviews.length > 0 ? uploadedGalleryPreviews : galleryItems;

  useEffect(() => {
    return () => {
      if (uploadedImagePreview) URL.revokeObjectURL(uploadedImagePreview);
      uploadedGalleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedImagePreview, uploadedGalleryPreviews]);

  const handleFeaturedUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (uploadedImagePreview) {
      URL.revokeObjectURL(uploadedImagePreview);
    }

    setUploadedImagePreview(URL.createObjectURL(file));
  };

  const handleGalleryUpload = (event: ChangeEvent<HTMLInputElement>) => {
    uploadedGalleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    const files = Array.from(event.target.files ?? []);
    setUploadedGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  return (
    <div className="space-y-3">
      <label className="space-y-1">
        <span className="text-xs font-medium text-slate-600">Upload featured image</span>
        <input
          name="imageFile"
          type="file"
          accept="image/*"
          onChange={handleFeaturedUpload}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-slate-600">Featured image URL</span>
        <input
          name={imageName}
          type="url"
          value={image}
          onChange={(event) => setImage(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>

      {previewImage ? (
        <div
          className="h-36 rounded-xl border border-slate-200 bg-slate-100 bg-cover bg-center"
          style={{ backgroundImage: `url('${previewImage}')` }}
          aria-label="Featured image preview"
        />
      ) : null}

      <label className="space-y-1">
        <span className="text-xs font-medium text-slate-600">Upload gallery images</span>
        <input
          name="galleryFiles"
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryUpload}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-medium text-slate-600">
          Gallery URLs (one per line or comma separated)
        </span>
        <textarea
          name={galleryName}
          rows={5}
          value={galleryText}
          onChange={(event) => setGalleryText(event.target.value)}
          placeholder="https://...\nhttps://..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </label>

      {previewGallery.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {previewGallery.slice(0, 8).map((imageUrl) => (
            <div
              key={imageUrl}
              className="h-16 rounded-lg border border-slate-200 bg-slate-100 bg-cover bg-center"
              style={{ backgroundImage: `url('${imageUrl}')` }}
              aria-label="Gallery preview"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
