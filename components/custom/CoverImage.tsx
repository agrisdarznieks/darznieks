import Image from "next/image";
import type { CoverImage as Cover } from "@/lib/cms";

export function CoverImage({
  cover,
  priority = false,
}: {
  cover: Cover;
  priority?: boolean;
}) {
  return (
    <Image
      src={cover.url}
      alt={cover.alt}
      width={cover.width}
      height={cover.height}
      priority={priority}
      sizes="480px"
      className="mt-4 h-auto w-full rounded-md"
    />
  );
}
