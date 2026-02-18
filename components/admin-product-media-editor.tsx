"use client";

import { UploadField } from "@/components/upload-field";

type AdminProductMediaEditorItem = {
  id: string;
  url: string;
  label: string;
  uploadedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type AdminProductMediaEditorProps = {
  imageName?: string;
  galleryName?: string;
  defaultImage?: string;
  defaultGallery?: string[];
  mediaItems?: AdminProductMediaEditorItem[];
  currentUsername?: string;
};

export function AdminProductMediaEditor({
  imageName = "image",
  galleryName = "gallery",
  defaultImage = "",
  defaultGallery = [],
  mediaItems = [],
  currentUsername = "",
}: AdminProductMediaEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Featured Image</p>
        <UploadField
          title="Upload Featured Image"
          mediaItems={mediaItems}
          fileInputName="imageFile"
          valueInputName={imageName}
          defaultValue={defaultImage}
          triggerLabel="Upload"
          currentUsername={currentUsername}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Gallery</p>
        <UploadField
          title="Upload Gallery Images"
          mediaItems={mediaItems}
          fileInputName="galleryFiles"
          valueInputName={galleryName}
          defaultValues={defaultGallery}
          multiple
          triggerLabel="Upload"
          currentUsername={currentUsername}
        />
      </div>
    </div>
  );
}
