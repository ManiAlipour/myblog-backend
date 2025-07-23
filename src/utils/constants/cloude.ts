import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.CLOUD_ACCESS_KEY,
  secretAccessKey: process.env.CLOUD_SECRET_KEY,
  endpoint: `${process.env.CLOUD_ENDPOINT}`,
  region: `${process.env.CLOUD_REGION}`,
  signatureVersion: "v4",
});

export default s3;
