import Image from "next/image";
import { useState } from "react";


interface BlurImageProp {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function BlurImage(props: BlurImageProp) {
  const [isLoading, setLoading] = useState(true);

  return (
    <Image
      {...props}
      alt={props.alt}
      className={
        `${props.className} blurImage ${isLoading ? "isLoading" : ""}`
      }
      width={props.width}
      height={props.height}
      src={props.src}
      onLoadingComplete={() => setLoading(false)
      }
    />
  );
}
