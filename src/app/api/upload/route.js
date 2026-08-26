import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ykomzf1n';
    const apiKey = process.env.CLOUDINARY_API_KEY || '919529848628671';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '9XCCvf39RF6wxBdeHVBqxoxI3jA';

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary server credentials are not fully configured' },
        { status: 500 }
      );
    }

    // Convert uploaded File to Buffer / Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Compute Cloudinary SHA-1 Signature for Signed Upload
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'slns-sea-foods/products';
    
    // Cloudinary payload signature must sort params alphabetically: folder & timestamp
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    // Build FormData for Cloudinary API call
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', base64Data);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', folder);

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok) {
      console.error('Cloudinary response error:', data);
      throw new Error(data.error?.message || `Cloudinary upload error (${cloudinaryRes.status})`);
    }

    return NextResponse.json({
      url: data.secure_url,
      public_id: data.public_id,
    });
  } catch (err) {
    console.error('Server /api/upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to upload image to Cloudinary' },
      { status: 500 }
    );
  }
}
