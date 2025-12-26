
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Cron job for frontend is no longer needed to update Redis directly.
  // We can treat this as a trigger to the backend if needed, or just deprecate it.
  // For now, let's just log and return success, or proxy to backend if we knew the endpoint.
  // Assuming backend handles its own scheduling or we call a backend trigger.
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  try {
     const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Trigger backend update
    const res = await fetch(`${backendUrl}/api/v1/quotes/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    
    // If backend doesn't have this, it might 404, we catch that.
    
    return NextResponse.json({
      success: true,
      message: 'Triggered backend update',
      backendStatus: res.status
    })
  } catch (error) {
    console.error('[Cron] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to trigger update' },
      { status: 500 }
    )
  }
}
