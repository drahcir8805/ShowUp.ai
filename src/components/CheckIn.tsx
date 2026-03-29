"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { 
  performManualCheckIn, 
  type CheckInResult,
  type ClassLocationForCheck
} from "@/lib/location";

interface CheckInProps {
  classData: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    startTime: string;
    endTime: string;
    days: string[];
  };
  onCheckInComplete?: (result: CheckInResult) => void;
}

type CheckInStatus = 'idle' | 'checking' | 'success' | 'failed' | 'not-in-time' | 'already-checked-in';

export function CheckIn({ classData, onCheckInComplete }: CheckInProps) {
  const [status, setStatus] = useState<CheckInStatus>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const classLocation: ClassLocationForCheck = useMemo(() => ({
    id: classData.id,
    lat: classData.lat,
    lng: classData.lng,
  }), [classData.id, classData.lat, classData.lng]);

  // Check if today is a class day
  const isTodayClassDay = useCallback(() => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayMap: { [key: number]: string } = {
      1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun'
    };
    return classData.days.includes(dayMap[today]);
  }, [classData.days]);

  // Check if current time is within class time
  const isWithinClassTime = useCallback(() => {
    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const startMinutes = parseInt(classData.startTime.split(':')[0]) * 60 + parseInt(classData.startTime.split(':')[1]);
    const endMinutes = startMinutes + 10; // 10 minutes after start (5 mins before + 10 mins after)
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }, [classData.startTime]);

  // Handle manual check-in
  const handleManualCheckIn = async () => {
    if (!isTodayClassDay()) {
      setStatus('not-in-time');
      setError('This class is not scheduled for today.');
      return;
    }

    if (!isWithinClassTime()) {
      setStatus('not-in-time');
      setError('Check-in is only available from 5 minutes before to 10 minutes after class start time.');
      return;
    }

    setLoading(true);
    setStatus('checking');
    setError('');

    try {
      const result = await performManualCheckIn(classLocation);
      
      if (result.success) {
        setStatus('success');
        onCheckInComplete?.(result);
      } else {
        setStatus('failed');
        setError(result.error || 'Check-in failed. Please ensure you are at class location.');
      }
    } catch (error) {
      setStatus('failed');
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Checking your location...';
      case 'success':
        return 'Successfully checked in!';
      case 'failed':
        return error;
      case 'not-in-time':
        return error || 'Check-in not available at this time';
      case 'already-checked-in':
        return error || 'Already checked in today';
      default:
        return 'Ready to check in';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'not-in-time':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'already-checked-in':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <MapPin className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">{classData.name}</h3>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{classData.startTime} - {classData.endTime}</span>
          </div>
        </div>

        {/* Manual Check-in Status */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            {getStatusIcon()}
            <span className="font-medium">{getStatusMessage()}</span>
          </div>

          {status !== 'success' && (
            <Button
              onClick={handleManualCheckIn}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Check In Now
                </>
              )}
            </Button>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                You&apos;re checked in! A random verification will occur during the lecture.
              </AlertDescription>
            </Alert>
          )}

          {(status === 'failed' || status === 'not-in-time') && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
