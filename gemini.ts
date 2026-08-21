import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables. AI analysis will fail.')
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy')

// Use the user's preferred latest model
export const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
