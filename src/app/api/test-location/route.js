import { NextResponse } from 'next/server'
import { isStudentAtClass } from '@/lib/location-test'

export async function POST(req) {
  try {
    const { studentLat, studentLng, classLat, classLng } = await req.json()
    
    console.log('🧪 Backend Location Test')
    console.log('Student Location:', { studentLat, studentLng })
    console.log('Class Location:', { classLat, classLng })
    
    const result = isStudentAtClass(studentLat, studentLng, classLat, classLng)
    
    console.log('📏 Distance Calculation:', result)
    
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Backend test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
