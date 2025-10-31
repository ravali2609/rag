import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CopyObjectCommand, CreateMultipartUploadCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  constructor(private params: {
    bucketName: string;
    region: string;
    endpoint?: string;
    accessKey: string;
    secretKey: string;
  }) {}

  private getS3Client() {
    return new S3Client({
      region: this.params.region,
      endpoint: this.params.endpoint,
      credentials: {
        accessKeyId: this.params.accessKey,
        secretAccessKey: this.params.secretKey,
      },
      forcePathStyle: true,
      useAccelerateEndpoint: false,

    });
  }

  getPresignedUploadUrl = async (path: string, contentType: string, fullMetadata: { [k: string]: string }) => {
    const s3 = this.getS3Client();
    const command = new PutObjectCommand({
      Bucket: this.params.bucketName,
      Key: path,
      ContentType: contentType,
      Metadata: fullMetadata,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    return { uploadUrl, path };
  };

  getPresignedDownloadUrl = async (key: string): Promise<string> => {
    const s3 = this.getS3Client();
    const command = new GetObjectCommand({ Bucket: this.params.bucketName, Key: key });
    return getSignedUrl(s3, command, { expiresIn: 36000 });
  };

  startMultipartUpload = async (key: string, contentType: string, fullMetadata: { [k: string]: string }) => {
    const s3 = this.getS3Client();
    const command = new CreateMultipartUploadCommand({
      Bucket: this.params.bucketName,
      Key: key,
      ContentType: contentType,
      Metadata: fullMetadata,
    });
    const response = await s3.send(command);
    return { uploadId: response.UploadId, key };
  };

  getAllPartUploadUrls = async (key: string, uploadId: string, totalParts: number) => {
    const urls = [];
    const s3 = this.getS3Client();
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const command = new UploadPartCommand({
        Bucket: this.params.bucketName,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 900 });
      urls.push({ partNumber, url });
    }
    return await Promise.all(urls);
  };

  completeMultipartUpload = async (key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) => {
    const s3 = this.getS3Client();

    const command = new CompleteMultipartUploadCommand({
      Bucket: this.params.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });
    await s3.send(command);
    return { success: true };
  };

  abortMultipartUpload = async (key: string, uploadId: string) => {
    const s3 = this.getS3Client();
    const command = new AbortMultipartUploadCommand({
      Bucket: this.params.bucketName,
      Key: key,
      UploadId: uploadId,
    });
    await s3.send(command);
  };

  renameObject = async (oldKey: string, newKey: string) => {
    const s3 = this.getS3Client();
    await s3.send(
      new CopyObjectCommand({
        Bucket: this.params.bucketName,
        CopySource: encodeURIComponent(`${this.params.bucketName}/${oldKey}`),
        Key: newKey,
      }),
    );

    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.params.bucketName,
        Key: oldKey,
      }),
    );
  };

  getObjectMetadata = async (key: string) => {
    const s3 = this.getS3Client();
    const command = new HeadObjectCommand({
      Bucket: this.params.bucketName,
      Key: key,
    });
    const response = await s3.send(command);
    return response.Metadata || {};
  };

  deleteObject = async (key: string) => {
    const s3 = this.getS3Client();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.params.bucketName,
        Key: key,
      }),
    );
  };
}
