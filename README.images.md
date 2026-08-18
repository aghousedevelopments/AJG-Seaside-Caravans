# Image management

You can add images via the admin UI at `/admin/images` (protected with HTTP Basic auth). The upload flow:

- If Cloudinary credentials are set (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET), images will be uploaded to Cloudinary and the returned secure URL will be saved.
- Otherwise images are stored in `public/uploads/` and served from `NEXT_PUBLIC_SITE_URL/uploads/<file>`.

Notes:
- Storing in `public/uploads` works for local development, but is not suitable for immutable hosts like Vercel (files will be ephemeral). For production, set up Cloudinary or S3 and provide credentials.
- The admin UI expects a propertyId when uploading — use the property id from the database (default sample uses propertyId=1).
