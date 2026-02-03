import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are ShipMe's AI stack advisor. Analyze the user's app idea and recommend the optimal tech stack.

You MUST respond with valid JSON only, no markdown or extra text. Use this exact structure:
{
  "stack": {
    "framework": "Next.js" | "React + Vite" | "Python FastAPI" | "Node.js Express",
    "database": "Supabase" | "PostgreSQL" | "MongoDB" | "Firebase",
    "hosting": "Vercel" | "Railway" | "AWS" | "Render",
    "additional": ["list", "of", "additional", "services"]
  },
  "reasoning": "2-3 sentence explanation of why this stack fits",
  "estimated_monthly_cost": "$X-Y/mo",
  "setup_time": "X minutes",
  "features": ["feature 1 enabled by this stack", "feature 2", "feature 3"]
}

Consider:
- Budget constraints (free tier friendly vs scale-ready)
- Target platform (web, mobile, both)
- Expected scale (users)
- App complexity from description`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { idea, budget, platform, scale } = body

    // Validate input
    if (!idea || idea.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Please describe your app idea in more detail (at least 10 characters)'
      }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey.includes('demo')) {
      return NextResponse.json({
        success: false,
        error: 'Anthropic API key not configured'
      }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const userPrompt = `Analyze this app idea and recommend the optimal stack:

**App Idea:** ${idea}

**Constraints:**
- Monthly Budget: ${budget || '$0-50/mo'}
- Target Platform: ${platform || 'Web only'}
- Expected Scale: ${scale || '~1,000 users'}

Respond with JSON only.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: SYSTEM_PROMPT
    })

    let responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    // Parse the JSON response - handle markdown code blocks
    let recommendation
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        responseText = jsonMatch[1].trim()
      }

      // Also try to find JSON object directly
      const jsonObjectMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonObjectMatch) {
        responseText = jsonObjectMatch[0]
      }

      recommendation = JSON.parse(responseText)
    } catch (parseError) {
      // If JSON parsing fails, return the raw text for debugging
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', responseText)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response',
        raw: responseText.substring(0, 500) // Limit raw output size
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recommendation,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        estimated_cost: `$${((message.usage.input_tokens * 3 + message.usage.output_tokens * 15) / 1_000_000).toFixed(4)}`
      }
    })

  } catch (error: any) {
    console.error('Analyze error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze idea'
    }, { status: 500 })
  }
}
