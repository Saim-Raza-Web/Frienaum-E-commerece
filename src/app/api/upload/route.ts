import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image.' }, { status: 400 });
    }

    // Validate file size (5MB limit for better reliability)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB for optimal upload performance.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with timeout and retry configuration
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'ecommerce-uploads', // Organize uploads in a folder
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ],
          timeout: 120000, // 2 minutes timeout
          chunk_size: 6000000, // 6MB chunks for better reliability
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error details:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      // Set a timeout for the entire upload process
      const timeoutId = setTimeout(() => {
        uploadStream.destroy();
        reject(new Error('Upload timeout - please try with a smaller image'));
      }, 120000); // 2 minutes
      
      uploadStream.on('end', () => {
        clearTimeout(timeoutId);
      });
      
      uploadStream.end(buffer);
    });

    if (!result || typeof result !== 'object' || !('secure_url' in result)) {
      throw new Error('Failed to upload to Cloudinary');
    }

    // Return the Cloudinary secure URL
    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      public_id: (result as any).public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file to Cloudinary.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
