const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env' });

async function testGemini() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('API Key disponível:', !!apiKey);

    if (!apiKey) {
        console.error('ERRO: Nenhuma API key encontrada no .env');
        return;
    }

    const genAI = new GoogleGenAI({ apiKey });

    // Tentar listar modelos (se a lib suportar ou inferir pelo erro)
    const modelsToTest = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-3-flash-preview' // O que você tentou
    ];

    for (const modelName of modelsToTest) {
        console.log(`\nTestando modelo: ${modelName}...`);
        try {
            const response = await genAI.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: 'Teste de conexão. Retorne apenas "OK".' }] }]
            });
            console.log(`✅ SUCESSO: ${modelName} respondeu:`, response.text ? response.text.trim() : 'Sem texto');
            return; // Parar no primeiro que funcionar
        } catch (error) {
            console.log(`❌ FALHA: ${modelName}`);
            if (error.message) console.log('Erro:', error.message);
            if (error.status) console.log('Status:', error.status);
            if (error.statusText) console.log('Status Text:', error.statusText);
        }
    }
}

testGemini();
