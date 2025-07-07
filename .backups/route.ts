import { NextRequest, NextResponse } from 'next/server';

// Map of filenames to their Cloudflare URLs
const musicFiles: Record<string, string> = {
  'Tersirat di Balik Senyuman - Brunetta Gondola.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/Tersirat%20di%20Balik%20Senyuman%20-%20Brunetta%20Gondola.mp3',
  'ポモドーロ・ラブ - 真道もも (Pomodoro LOVE! - Mado Momo) - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/%E3%83%9D%E3%83%A2%E3%83%89%E3%83%BC%E3%83%AD%E3%83%BB%E3%83%A9%E3%83%96%20-%20%E7%9C%9F%E9%81%93%E3%82%82%E3%82%82%20(Pomodoro%20LOVE!%20-%20Mado%20Momo)%20-%20HMS.mp3',
  'Possesive Cyborg Maid - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/Possesive%20Cyborg%20Maid%20-%20HMS.mp3',
  '„Nur Wenn Ich Will (AI-Prinz)" - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/%E2%80%9ENur%20Wenn%20Ich%20Will%20(AI-Prinz)%E2%80%9C%20-%20HMS.mp3',
  '🔥 _I Am the Dream Dreaming Me_ - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/%F0%9F%94%A5%20_I%20Am%20the%20Dream%20Dreaming%20Me_%20-%20HMS.mp3',
  '「冬の神話 (Fuyu no Shinwa) — Winter Myth」 - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/%E3%80%8C%E5%86%AC%E3%81%AE%E7%A5%9E%E8%A9%B1%20(Fuyu%20no%20Shinwa)%20%E2%80%94%20Winter%20Myth%E3%80%8D%20-%20HMS.mp3',
  'A Morning Hum - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/A%20Morning%20Hum%20-%20HMS.mp3',
  '🌸 花の香りに (Hana no Kaori ni) 🌸 Glam Rock Live - 差乃間・ミッチ.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/%F0%9F%8C%B8%20%E8%8A%B1%E3%81%AE%E9%A6%99%E3%82%8A%E3%81%AB%20(Hana%20no%20Kaori%20ni)%20%F0%9F%8C%B8%20Glam%20Rock%20Live%20-%20%E5%B7%AE%E4%B9%83%E9%96%93%E3%83%BB%E3%83%9F%E3%83%83%E3%83%81.mp3',
  'A Morning Hum (Remix) - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/A%20Morning%20Hum%20(Remix)%20-%20HMS.mp3',
  '🌸 花の香りに (Hana no Kaori ni) 🌸 - 花野かおり.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/%F0%9F%8C%B8%20%E8%8A%B1%E3%81%AE%E9%A6%99%E3%82%8A%E3%81%AB%20(Hana%20no%20Kaori%20ni)%20%F0%9F%8C%B8%20-%20%E8%8A%B1%E9%87%8E%E3%81%8B%E3%81%8A%E3%82%8A.mp3',
  'Debugin Hidup - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/Debugin%20Hidup%20-%20HMS.mp3',
  'Petals of Youth Memories - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/Petals%20of%20Youth%20Memories%20-%20HMS.mp3',
  'Sangkan Paraning Dumadisko - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/Sangkan%20Paraning%20Dumadisko%20-%20HMS.mp3',
  'Zbrrr! Patatra - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/Zbrrr!%20Patatra%20-%20HMS.mp3',
  'Possesive Cyborg Maid (Distort Break Cover) - HMS.mp3': 'https://pub-d2b93610ba26460998361184c094efd5.r2.dev/Possesive%20Cyborg%20Maid%20(Distort%20Break%20Cover)%20-%20HMS.mp3',
};

export async function GET(
  request: NextRequest,
  context: Promise<{ params: { filename: string } }>
) {
  try {
    const { params } = await context;
    const filename = decodeURIComponent(params.filename);
    
    // Check if the file exists in our mapping
    if (!musicFiles[filename]) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const cloudflareUrl = musicFiles[filename];
    
    // Fetch the file from Cloudflare
    const response = await fetch(cloudflareUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }

    // Get the file content and headers
    const fileBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const contentLength = response.headers.get('content-length');

    // Create response headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    headers.set('Accept-Ranges', 'bytes'); // Support for range requests (seeking)

    // Return the file as a stream
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error streaming file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 