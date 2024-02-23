"use client";
import React, { useState } from "react";
import Image, { ImageProps, StaticImageData } from "next/image";
import placeholder from "assets/images/lion.svg";

interface ImageWithFallbackProps extends ImageProps {
  src: string | StaticImageData;
  alt: string;
  fallbackSrc?: string | StaticImageData;
}

const ImageWithFallback = (props: ImageWithFallbackProps) => {
  const { src, fallbackSrc, alt, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...rest}
      alt={alt}
      src={imgSrc || placeholder}
      onError={() => {
        setImgSrc(fallbackSrc || placeholder);
      }}
    />
  );
};

export default ImageWithFallback;
