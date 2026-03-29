import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req) {
  try {
    const { classId } = await req.json()
    
    console.log('🧪 Testing delete for class:', classId)
    
    // First, check if class exists
    const { data: existingClass, error: fetchError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single()
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!existingClass) {
      console.warn('⚠️ Class not found:', classId)
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }
    
    console.log('✅ Found class:', existingClass)
    
    // Attempt deletion
    const { data, error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId)
      .select()
    
    console.log('🗑️ Delete result:', { data, error })
    
    if (error) {
      console.error('❌ Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Verify deletion by trying to fetch again
    const { data: verifyDelete } = await supabase
      .from('classes')
      .select('id')
      .eq('id', classId)
    
    console.log('🔍 Verification result:', verifyDelete)
    
    return NextResponse.json({
      success: true,
      deletedClass: existingClass,
      deleteResult: data,
      verification: verifyDelete
    })
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
