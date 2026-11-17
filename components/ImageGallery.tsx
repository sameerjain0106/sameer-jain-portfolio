import Image from "next/image";
import { ProjectImage } from "@/lib/types";
import MriInspectionLens from "./MriInspectionLens";

export default function ImageGallery({ images }: { images: ProjectImage[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {images.map((img) => (
        <figure
          key={img.src}
          className="overflow-hidden rounded-lg border border-base-border bg-base-panel"
        >
          {img.src.startsWith("/projects/brain-tumor-mri/images/") ? <MriInspectionLens className="aspect-[4/3] w-full bg-white">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </MriInspectionLens> : <div className="relative aspect-[4/3] w-full bg-white">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>}
          <figcaption className="border-t border-base-border px-4 py-3 text-xs text-ink-muted">
            {img.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
