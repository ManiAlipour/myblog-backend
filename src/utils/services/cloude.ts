import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.CLOUD_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUD_SECRET_KEY!,
  },
  endpoint: process.env.CLOUD_ENDPOINT,
  region: process.env.CLOUD_REGION,
  forcePathStyle: true,
});

export default s3;

export async function uploadFile(path: string, file: Express.Multer.File) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUD_BUCKET_NAME!,
      Key: `blog-images/${path}`,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    })
  );

  let endpoint = process.env.CLOUD_ENDPOINT!;
  if (endpoint.endsWith("/")) endpoint = endpoint.slice(0, -1);

  return `${endpoint}/${process.env.CLOUD_BUCKET_NAME}/${
    "blog-images/" + path
  }`;
}
