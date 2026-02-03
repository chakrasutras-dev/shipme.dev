import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function GET() {
  // Check if API key exists
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'sk-ant-demo-key') {
    return NextResponse.json({
      success: false,
      error: 'No valid API key configured',
      hint: 'Add your real ANTHROPIC_API_KEY to .env.local'
    }, { status: 400 })
  }

  try {
    const client = new Anthropic({
      apiKey: apiKey
    })

    // Simple test call
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Say "ShipMe API connected!" in exactly 5 words.'
        }
      ]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : 'No text response'

    return NextResponse.json({
      success: true,
      message: responseText,
      model: message.model,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        estimated_cost: `$${((message.usage.input_tokens * 3 + message.usage.output_tokens * 15) / 1_000_000).toFixed(6)}`
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to connect to Claude',
      type: error.constructor.name
    }, { status: 500 })
  }
}
