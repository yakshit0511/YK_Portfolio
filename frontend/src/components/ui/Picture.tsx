import type { ImgHTMLAttributes } from 'react';
import { getOptimizedImageSrc } from '../../utils/imageSources';

type PictureProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

export function Picture({ src, ...imageProps }: PictureProps) {
  const webpSrc = getOptimizedImageSrc(src);
  return <picture>
    {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
    <img src={src} {...imageProps} />
  </picture>;
}