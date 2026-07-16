<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## ⚠️ IMPORTANT: Media & Images
- **NEVER** use direct S3/Liara URLs for images. They will return 404 in local environment.
- **ALWAYS** route images through the internal proxy: `/api/media/[key]`.
- Use `getPublicImageUrl(key)` from `lib/upload-image.ts` to generate URLs.
- See `docs/IMAGE_SYSTEM.md` for the full architectural logic.
<!-- END:nextjs-agent-rules -->
