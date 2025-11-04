# S3 Storage Configuration for Report Uploads

To enable S3 uploads for generated PDF reports, set the following environment variables:

- S3_BUCKET=
- S3_REGION=
- S3_ACCESS_KEY_ID=
- S3_SECRET_ACCESS_KEY=
- S3_ENDPOINT= (optional, e.g., for MinIO or custom S3-compatible service)

Behavior:
- If all required vars are present, reports are uploaded to `reports/{type}/{uuid}.pdf` with ACL public-read and a public URL is returned.
- If vars are missing, the action falls back to a data URI (inline) so users can still download the report.

Security Notes:
- Use least-privilege credentials for the bucket.
- For production, prefer time-limited signed URLs instead of public-read objects.
- Consider server-side encryption (SSE) and access logs.
