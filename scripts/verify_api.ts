import { model } from '../lib/gemini'

async function testApi() {
    try {
        console.log('Testing Gemini API with model:', model.model)
        const result = await model.generateContent('Explain "Political Violence" in one sentence.')
        console.log('✅ API Response:', result.response.text())
    } catch (error: any) {
        console.error('❌ API Error:', error.message)
    }
}

testApi()
