import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

interface LeadData {
  name: string
  email: string
  company: string
  challenge: string
  source: string
  timestamp: string
}

// Validation helper
function validateLeadData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required')
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format')
    }
  }

  if (!data.company || typeof data.company !== 'string' || data.company.trim().length < 1) {
    errors.push('Company name is required')
  }

  if (!data.challenge || typeof data.challenge !== 'string' || data.challenge.trim().length < 10) {
    errors.push('Challenge description must be at least 10 characters')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Webhook helper for CRM integration
async function sendToWebhook(leadData: LeadData): Promise<boolean> {
  const webhookUrl = process.env.WEBHOOK_URL

  if (!webhookUrl) {
    console.log('No webhook URL configured, skipping CRM integration')
    return true
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    })

    return response.ok
  } catch (error) {
    console.error('Webhook error:', error)
    return false
  }
}

// Email notification helper (placeholder)
async function sendEmailNotification(leadData: LeadData): Promise<boolean> {
  // In production, integrate with SendGrid, Resend, or similar
  console.log('📧 New lead notification:', {
    name: leadData.name,
    email: leadData.email,
    company: leadData.company,
  })

  // TODO: Implement actual email sending
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateLeadData(body)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    // Create lead object
    const leadData: LeadData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      company: body.company.trim(),
      challenge: body.challenge.trim(),
      source: body.source || 'unknown',
      timestamp: body.timestamp || new Date().toISOString(),
    }

    // Store lead in database
    const lead = await prisma.lead.create({
      data: {
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        challenge: leadData.challenge,
        source: leadData.source,
        status: 'new',
      },
    })

    // Send to CRM webhook (async, don't wait)
    sendToWebhook(leadData).catch(err => console.error('Webhook failed:', err))

    // Send email notification (async, don't wait)
    sendEmailNotification(leadData).catch(err => console.error('Email failed:', err))

    console.log('✅ Lead captured:', lead.email, '- ID:', lead.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        leadId: lead.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve leads (for admin use)
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify token
    const payload = verifyToken(token)

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get leads from database
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
    })
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
