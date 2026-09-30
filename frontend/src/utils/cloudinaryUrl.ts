export function cloudinaryImageUrl(url: string, width: 800 | 1400 = 800) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') return url;

    const imageUploadPath = '/image/upload/';
    if (!parsed.pathname.includes(imageUploadPath)) return url;

    parsed.pathname = parsed.pathname.replace(imageUploadPath, `${imageUploadPath}f_auto,q_auto,w_${width}/`);
    return parsed.toString();
  } catch {
    return url;
  }
}