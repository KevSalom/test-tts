import { synthesizeSpeech } from '@/lib/gcp-tts';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voiceName, languageCode } = body;
    
    if (!text || !voiceName || !languageCode) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: text, voiceName, languageCode' },
        { status: 400 }
      );
    }
    
    const audioContent = await synthesizeSpeech(text, voiceName, languageCode);
    
    // Convertir Buffer a base64 para enviar en JSON
    const audioBase64 = Buffer.from(audioContent as string).toString('base64');
    
    return NextResponse.json({
      audioContent: audioBase64,
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error al generar el audio' },
      { status: 500 }
    );
  }
}