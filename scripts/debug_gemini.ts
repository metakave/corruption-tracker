import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env')
    process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)

async function listModels() {
    try {
        console.log('Fetching available models...')
        // Note: listModels might not be directly exposed on the instance in older versions or specific setups,
        // but let's try the model directly first or just a simple generation to check connectivity.
        // Actually, listing models is a system instruction.
        // We'll try a standard generation with a known safe model.

        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-1.0-pro'
        ]

        for (const modelName of modelsToTry) {
            console.log(`Testing model: ${modelName}`)
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                const result = await model.generateContent('Hello')
                const response = await result.response
                console.log(`✅ Success with ${modelName}:`, response.text().slice(0, 20) + '...')
            } catch (e: any) {
                console.log(`❌ Failed ${modelName}:`, e.message.split('\n')[0])
            }
        }

    } catch (error) {
        console.error('Global error:', error)
    }
}

listModels()
