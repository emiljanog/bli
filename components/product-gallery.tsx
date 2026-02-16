"use client";

import { useEffect, useMemo, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const safeImages = useMemo(() => (images.length > 0 ? images : [""]), [images]);
  const [activeImage, setActiveImage] = useState(safeImages[0]);

  useEffect(() => {
    setActiveImage(safeImages[0]);
  }, [safeImages]);

  return (
    <div>
      <div
        className="h-72 rounded-2xl border border-slate-200 bg-slate-100 bg-cover bg-center md:h-[28rem]"
        style={{ backgroundImage: activeImage ? `url('${activeImage}')` : undefined }}
        aria-label={name}
      />

      {safeImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {safeImages.map((imageUrl) => (
            <button
              key={imageUrl}
              type="button"
              onClick={() => setActiveImage(imageUrl)}
              className={`h-20 rounded-xl border bg-cover bg-center transition ${
                activeImage === imageUrl
                  ? "border-slate-900 ring-2 ring-slate-900/10"
                  : "border-slate-200 hover:border-slate-400"
              }`}
              style={{ backgroundImage: `url('${imageUrl}')` }}
              aria-label={`Shiko foto te ${name}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
