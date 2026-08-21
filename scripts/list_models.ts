
import { GoogleGenerativeAI } from "@google/generative-ai"
import * as dotenv from "dotenv"
dotenv.config()

const API_KEY = process.env.GEMINI_API_KEY || ""

async function main() {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels()
    // Wait, listModels is on the genAI object or model?
    // Actually it's usually genAI.listModels()
}
/*
Actually the SDK method is:
*/
async function list() {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

list().catch(console.error)
