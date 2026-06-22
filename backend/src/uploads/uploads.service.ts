import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly client: S3Client;
  private readonly bucket = process.env.MINIO_BUCKET ?? 'apreensoes';
  private readonly endpoint = process.env.MINIO_ENDPOINT ?? 'http://localhost:9000';
  // MinIO serve leitura pública no mesmo endpoint S3 (path-style). Provedores
  // como o Supabase Storage usam um endpoint de leitura pública separado do
  // endpoint do protocolo S3 — por isso o override abaixo.
  private readonly publicUrlBase = process.env.STORAGE_PUBLIC_URL ?? this.endpoint;

  constructor() {
    this.client = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'canil',
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'canil12345',
      },
    });
  }

  async enviarFoto(arquivo: { buffer: Buffer; mimetype: string; originalname: string }) {
    const extensao = arquivo.originalname.split('.').pop();
    const chave = `${randomUUID()}.${extensao ?? 'jpg'}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: chave,
        Body: arquivo.buffer,
        ContentType: arquivo.mimetype,
      }),
    );

    return { url: `${this.publicUrlBase}/${this.bucket}/${chave}` };
  }
}
