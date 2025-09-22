import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  endpoint: process.env.S3_BUCKET_URL,
  s3ForcePathStyle: true,
});

// POST /api/uploads - Upload file to S3 and save metadata
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Upload to S3
    const fileKey = `${uuidv4()}-${file.name}`;
    const uploadParams = {
      Bucket: 'prico-uploads', // or from env
      Key: fileKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Save to DB
    const attachments = db.collection('attachments');
    const attachment = {
      url: uploadResult.Location,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      uploaderId: userId,
      createdAt: new Date(),
    };

    const result = await attachments.insertOne(attachment);

    return NextResponse.json({ ...attachment, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}