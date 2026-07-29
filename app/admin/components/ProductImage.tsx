"use client";

import { useMemo } from "react";

interface Props {
  image: File | null;
  currentImage?: string;
  onChange: (file: File | null) => void;
}

export default function ProductImage({
  image,
  currentImage,
  onChange,
}: Props) {
  const preview = useMemo(() => {
    if (image) {
      return URL.createObjectURL(image);
    }

    return currentImage ?? "";
  }, [image, currentImage]);

  return (
    <div className="col-span-2 space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full"
      />

      {preview && (
        <div className="overflow-hidden rounded-xl border border-zinc-700">
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}