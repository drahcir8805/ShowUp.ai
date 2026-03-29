// Test script for location functionality
export function getStudentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy // metres of accuracy
      }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

export function isStudentAtClass(studentLat, studentLng, classLat, classLng) {
  const R = 6371e3
  const φ1 = studentLat * Math.PI / 180
  const φ2 = classLat * Math.PI / 180
  const Δφ = (classLat - studentLat) * Math.PI / 180
  const Δλ = (classLng - studentLng) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)

  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return {
    present: distance < 100,
    distance: Math.round(distance)
  }
}

// Test function to verify location tracking
export async function testLocationTracking() {
  console.log('🧪 Testing Location Tracking...')
  
  try {
    // Test 1: Get current location
    console.log('📍 Getting your location...')
    const location = await getStudentLocation()
    console.log('✅ Location found:', location)
    
    // Test 2: Test distance calculation with known coordinates
    // Using Laurier campus coordinates as test
    const testClassLat = 43.4843
    const testClassLng = -80.5374
    
    console.log('🧮 Testing distance calculation...')
    const result = isStudentAtClass(
      location.lat, 
      location.lng, 
      testClassLat, 
      testClassLng
    )
    
    console.log('📏 Distance result:', result)
    
    if (result.present) {
      console.log('🎯 SUCCESS: You would be marked PRESENT')
    } else {
      console.log(`❌ You would be marked ABSENT (${result.distance}m away)`)
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Location test failed:', error.message)
    return null
  }
}
