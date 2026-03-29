import { supabase } from '@/lib/supabase';
import { CheckInResult } from '@/lib/location';

export interface AttendanceLog {
  id?: string;
  user_id: string;
  class_id: string;
  check_in_type: 'manual' | 'silent';
  checked_at: string;
  student_lat: number;
  student_lng: number;
  distance: number;
  success: boolean;
  error_message?: string;
  created_at?: string;
}

export interface AttendanceSummary {
  class_id: string;
  manual_check_in?: AttendanceLog;
  silent_check_in?: AttendanceLog;
  overall_status: 'present' | 'partial' | 'absent' | 'pending';
  final_distance?: number;
}

/**
 * Save attendance log to database
 */
export async function saveAttendanceLog(
  userId: string,
  classId: string,
  checkInType: 'manual' | 'silent',
  result: CheckInResult
): Promise<{ success: boolean; error?: string; data?: AttendanceLog }> {
  try {
    const attendanceData: Omit<AttendanceLog, 'id' | 'created_at'> = {
      user_id: userId,
      class_id: classId,
      check_in_type: checkInType,
      checked_at: result.checkedAt || new Date().toISOString(),
      student_lat: result.studentLat || 0,
      student_lng: result.studentLng || 0,
      distance: result.distance || 0,
      success: result.success,
      error_message: result.error,
    };

    const { data, error } = await supabase
      .from('attendance_logs')
      .insert(attendanceData)
      .select()
      .single();

    if (error) {
      // Check if it's a table doesn't exist error
      if (error.code === 'PGRST116') {
        return { 
          success: false, 
          error: 'Attendance table not found. Please run the database setup script.' 
        };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save attendance' 
    };
  }
}

/**
 * Get attendance logs for a specific class and user
 */
export async function getAttendanceLogs(
  userId: string,
  classId: string
): Promise<{ success: boolean; error?: string; data?: AttendanceLog[] }> {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch attendance' 
    };
  }
}

/**
 * Get today's attendance summary for a user
 */
export async function getTodayAttendanceSummary(
  userId: string
): Promise<{ success: boolean; error?: string; data?: AttendanceSummary[] }> {
  try {
    // Get classes for today
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (classesError) throw classesError;

    if (!classes || classes.length === 0) {
      return { success: true, data: [] };
    }

    const summaries: AttendanceSummary[] = [];

    for (const classItem of classes) {
      // Get attendance logs for this class
      const { data: logs } = await getAttendanceLogs(userId, classItem.id);

      const manualCheckIn = logs?.find(log => log.check_in_type === 'manual');
      const silentCheckIn = logs?.find(log => log.check_in_type === 'silent');

      // Determine overall status
      let overallStatus: 'present' | 'partial' | 'absent' | 'pending' = 'pending';
      
      if (manualCheckIn && silentCheckIn) {
        overallStatus = (manualCheckIn.success && silentCheckIn.success) ? 'present' : 'partial';
      } else if (manualCheckIn) {
        overallStatus = manualCheckIn.success ? 'partial' : 'absent';
      } else {
        overallStatus = 'pending';
      }

      summaries.push({
        class_id: classItem.id,
        manual_check_in: manualCheckIn,
        silent_check_in: silentCheckIn,
        overall_status: overallStatus,
        final_distance: manualCheckIn?.distance || silentCheckIn?.distance,
      });
    }

    return { success: true, data: summaries };
  } catch (error) {
    console.error('Error getting today\'s attendance summary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get attendance summary' 
    };
  }
}

/**
 * Check if user has already done manual check-in for a class today
 */
export async function hasCheckedInToday(
  userId: string,
  classId: string
): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { data, error } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .eq('check_in_type', 'manual')
      .gte('checked_at', todayStr)
      .limit(1);

    if (error) {
      // If table doesn't exist, return false (allow check-in)
      if (error.code === 'PGRST116') {
        return false;
      }
      return false;
    }

    return (data && data.length > 0) || false;
  } catch {
    return false;
  }
}

/**
 * Update class analytics based on attendance
 */
export async function updateClassAnalytics(
  classId: string,
  userId: string,
  wasPresent: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // This would typically update a class_analytics table
    // For now, we'll just log it
    console.log(`Updating analytics for class ${classId}, user ${userId}, present: ${wasPresent}`);
    
    // In a real implementation, you might:
    // 1. Update current_streak
    // 2. Update week_attendance
    // 3. Update total_saved based on bet_amount
    // 4. Update bet_amount if they missed class
    
    return { success: true };
  } catch (error) {
    console.error('Error updating class analytics:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update analytics' 
    };
  }
}
