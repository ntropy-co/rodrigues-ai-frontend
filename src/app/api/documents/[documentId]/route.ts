import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const url = `${BACKEND_URL}/api/v1/documents/${params.documentId}`

    console.log('[API Proxy] DELETE document:', params.documentId)

    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    })

    console.log('[API Proxy] Delete response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Delete error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Proxy] Error deleting document:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
