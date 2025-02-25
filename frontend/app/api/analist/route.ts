import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";

// Configuración de la API de OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Mensaje de instrucción para el modelo
const instructionMessage: ChatCompletionRequestMessage = {
  role: "system",
  content: `
You are a cybersecurity incident response analyst. 
Your role is to assist in identifying, analyzing, and mitigating security incidents. 
Provide detailed technical explanations, recommendations, and best practices for handling cybersecurity threats. 
Use technical language and be concise. 
If providing step-by-step instructions, ensure they are clear and actionable.
`
};

export async function POST(req: Request) {
  try {
    // Autenticación del usuario
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Comprobación de la configuración de la API Key
    if (!configuration.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    }

    // Lectura y validación del cuerpo de la solicitud
    const body = await req.json();
    const { messages } = body;
    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    // Verificación de los límites y suscripciones de la API
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Creación de la respuesta del modelo de chat
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [instructionMessage, ...messages],
    });

    // Incremento del límite de la API si el usuario no es Pro
    if (!isPro) {
      await incrementApiLimit();
    }

    // Devolución de la respuesta del modelo
    return NextResponse.json(response.data.choices[0].message);
  } catch (error) {
    console.error('[CONVERSATION_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
