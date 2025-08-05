import { getAvailableVoices } from '@/lib/gcp-tts';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const languageCode = searchParams.get('languageCode') || undefined;
    
    const voices = await getAvailableVoices(languageCode);
    
    return NextResponse.json({ voices });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener las voces disponibles' },
      { status: 500 }
    );
  }
}