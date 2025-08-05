// Inicializar cliente de GCP Text-to-Speech
import textToSpeech from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as path from 'path';

// Inicializar cliente de GCP Text-to-Speech
export const initializeTTSClient = () => {
  // En Vercel/producción, usar variable de entorno
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      console.log('Usando credenciales desde variable de entorno');
      return new textToSpeech.TextToSpeechClient({ credentials });
    } catch (error) {
      console.error('Error parsing credentials from env:', error);
    }
  }
  
  // En desarrollo local, intentar usar archivo
  if (process.env.NODE_ENV === 'development') {
    try {
      const credentialsPath = path.join(process.cwd(), 'credentials.json');
      if (fs.existsSync(credentialsPath)) {
        console.log('Usando credenciales desde archivo local');
        return new textToSpeech.TextToSpeechClient({ keyFilename: credentialsPath });
      }
    } catch (error) {
      console.error('Error loading local credentials file:', error);
    }
  }
  
  // Último recurso: Application Default Credentials
  console.log('Usando Application Default Credentials');
  return new textToSpeech.TextToSpeechClient();
};

// Obtener lista de voces disponibles
export const getAvailableVoices = async (languageCode?: string) => {
  const client = initializeTTSClient();

  try {
    const request: any = {};
    if (languageCode) {
      request.languageCode = languageCode;
    }

    const [result] = await client.listVoices(request);

    const voices = result.voices || [];

    // Filtrar solo voces con versión gratuita
    const freeVoices = voices.filter((voice) => {
      // Incluir todas las voces básicas (Standard son gratuitas)
      return voice.name && voice.ssmlGender;
    });

    return freeVoices.map((voice) => ({
      name: voice.name || "",
      languageCodes: voice.languageCodes || [],
      ssmlGender: voice.ssmlGender || "SSML_VOICE_GENDER_UNSPECIFIED",
      naturalSampleRateHertz: voice.naturalSampleRateHertz || 0,
      isFree:
        voice.name?.includes("Standard"),
    }));
  } catch (error: any) {
    console.error("Error obteniendo voces:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw new Error(
      `No se pudieron obtener las voces disponibles: ${error.message}`
    );
  }
};

// Generar audio desde texto
export const synthesizeSpeech = async (
  text: string,
  voiceName: string,
  languageCode: string
) => {
  const client = initializeTTSClient();

  const request = {
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0,
      sampleRateHertz: 24000,
    },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error("No se generó contenido de audio");
    }

    return response.audioContent;
  } catch (error: any) {
    console.error("Error generando audio:", error);
    throw new Error(`Error al generar el audio: ${error.message}`);
  }
};
