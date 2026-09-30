const optimizedImagePath = /^\/images\/(?:hero|guide|cutouts|backgrounds)\//;

export function getOptimizedImageSrc(src: string) {
  if (!optimizedImagePath.test(src) || !/\.(?:png|jpe?g)$/i.test(src)) return undefined;
  return src.replace(/\.(?:png|jpe?g)$/i, '.webp');
}