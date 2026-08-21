import axios from 'axios'

export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface OpenRouterOptions {
    model?: string
    fallbackModels?: string[]
    temperature?: number
    responseFormatJson?: boolean
    timeoutMs?: number
}

const DEFAULT_MODELS = [
    "meta-llama/llama-3.3-70b-instruct",
    "deepseek/deepseek-chat",
    "anthropic/claude-3.5-haiku",
    "google/gemini-2.5-flash"
]

export async function callOpenRouter(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
        throw new Error("Missing OPENROUTER_API_KEY in environment variables (.env)")
    }

    const primaryModel = options.model || process.env.OPENROUTER_MODEL || DEFAULT_MODELS[0]
    const fallbackListFromEnv = process.env.OPENROUTER_FALLBACK_MODELS
        ? process.env.OPENROUTER_FALLBACK_MODELS.split(',').map(m => m.trim())
        : []
    
    const rawCandidates = [
        primaryModel,
        ...(primaryModel.endsWith(':free') ? [primaryModel.replace(':free', '')] : []),
        ...(options.fallbackModels || []),
        ...fallbackListFromEnv,
        ...DEFAULT_MODELS
    ]
    const candidateModels = rawCandidates.filter((m, idx, arr) => arr.indexOf(m) === idx)

    let lastError: any = null

    for (const model of candidateModels) {
        try {
            const body: any = {
                model,
                messages,
                temperature: options.temperature ?? 0.1,
            }

            if (options.responseFormatJson) {
                body.response_format = { type: "json_object" }
            }

            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                body,
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey.trim()}`,
                        "HTTP-Referer": "https://violencetracker.org",
                        "X-Title": "Bangladesh Violence Tracker",
                        "Content-Type": "application/json"
                    },
                    timeout: options.timeoutMs ?? 30000
                }
            )

            const content = response.data?.choices?.[0]?.message?.content
            if (typeof content === 'string' && content.length > 0) {
                return content
            }
            throw new Error(`Empty response from model ${model}`)
        } catch (err: any) {
            const status = err.response?.status
            const errorData = err.response?.data
            lastError = errorData ? JSON.stringify(errorData) : err.message
            console.warn(`⚠️ OpenRouter error on model '${model}' (HTTP ${status || 'ERR'}): ${lastError}. Trying next model...`)
        }
    }

    throw new Error(`All OpenRouter candidate models failed. Last error: ${lastError}`)
}
