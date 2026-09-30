import { describe, expect, it } from 'vitest';
import { cloudinaryImageUrl } from '../src/utils/cloudinaryUrl';
import { getOptimizedImageSrc } from '../src/utils/imageSources';

describe('image URL helpers', () => {
  it('selects WebP only for the optimized local image folders', () => {
    expect(getOptimizedImageSrc('/images/cutouts/pose.png')).toBe('/images/cutouts/pose.webp');
    expect(getOptimizedImageSrc('/images/brand/logo.png')).toBeUndefined();
  });

  it('adds responsive Cloudinary delivery transformations for image assets', () => {
    expect(cloudinaryImageUrl('https://res.cloudinary.com/demo/image/upload/v12/work/cover.jpg'))
      .toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800/v12/work/cover.jpg');
    expect(cloudinaryImageUrl('https://res.cloudinary.com/demo/image/upload/v12/work/full.jpg', 1400))
      .toContain('f_auto,q_auto,w_1400');
    expect(cloudinaryImageUrl('https://example.com/cover.jpg')).toBe('https://example.com/cover.jpg');
  });
});