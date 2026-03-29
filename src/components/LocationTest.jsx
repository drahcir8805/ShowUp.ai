'use client'
import { useState } from 'react'
import { testLocationTracking } from '@/lib/location-test'

export function LocationTest() {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleteTest, setDeleteTest] = useState(null)

  const runTest = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      const result = await testLocationTracking()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testDelete = async (classId) => {
    setDeleteTest({ loading: true, classId })
    
    try {
      const response = await fetch('/api/test-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      })
      
      const result = await response.json()
      setDeleteTest(result)
    } catch (error) {
      setDeleteTest({ error: error.message })
    }
  }

  return (
    <div className="fixed top-20 right-6 z-40 bg-white rounded-lg shadow-lg p-4 w-96 max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">🧪 Testing Tools</h3>
      
      {/* Location Test */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">📍 Location Test</h4>
        <button
          onClick={runTest}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 px-4 font-medium transition-colors"
        >
          {loading ? '🔄 Testing...' : '📍 Test Location'}
        </button>

        {testResult && (
          <div className="mt-3 p-2 bg-white rounded text-xs">
            {testResult.error ? (
              <div className="text-red-600">
                <p className="font-medium">❌ Error:</p>
                <p>{testResult.error}</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-green-600">✅ Results:</p>
                <p>Distance: {testResult.distance}m</p>
                <p>Status: {testResult.present ? 
                  <span className="text-green-600 font-medium">PRESENT</span> : 
                  <span className="text-red-600 font-medium">ABSENT</span>
                }</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Test */}
      <div className="mb-4 p-3 bg-red-50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">🗑️ Delete Test</h4>
        <input
          type="text"
          placeholder="Enter class ID to test delete"
          className="w-full p-2 border rounded mb-2 text-sm"
          id="test-class-id"
        />
        <button
          onClick={() => {
            const classId = document.getElementById('test-class-id').value
            if (classId) testDelete(classId)
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 font-medium transition-colors text-sm"
        >
          🗑️ Test Delete
        </button>

        {deleteTest && (
          <div className="mt-3 p-2 bg-white rounded text-xs">
            {deleteTest.error ? (
              <div className="text-red-600">
                <p className="font-medium">❌ Delete Error:</p>
                <p>{deleteTest.error}</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-green-600">✅ Delete Result:</p>
                <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(deleteTest, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
