// Define interfaces for better type safety
interface ClassData {
  current_streak?: number;
  week_attendance?: number;
  total_saved?: number;
  bet_amount?: number;
  betAmount?: number;
  days_of_week?: string[];
  loss_amount?: number;
}

interface ClassAnalytics {
  currentStreak: number;
  weekAttendance: string;
  weekAttendancePercent: number;
  totalSaved: number;
  betAmount: number;
  isPerfectWeek: boolean;
}

// Calculate attendance analytics for a class
export function calculateClassAnalytics(cls: ClassData): ClassAnalytics {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  // Mock data for now - in real app, this would come from attendance_logs table
  const currentStreak = cls.current_streak || 0;
  const weekAttendance = cls.week_attendance || 0;
  const totalSaved = cls.total_saved || 0;
  const betAmount = cls.bet_amount || cls.betAmount || 0;
  
  // Calculate potential weekly classes
  const weeklyClasses = cls.days_of_week?.length || 0;
  
  return {
    currentStreak,
    weekAttendance: `${weekAttendance}/${weeklyClasses}`,
    weekAttendancePercent: weeklyClasses > 0 ? (weekAttendance / weeklyClasses) * 100 : 0,
    totalSaved,
    betAmount,
    isPerfectWeek: weekAttendance === weeklyClasses && weeklyClasses > 0
  };
}

// Update class analytics when attendance is marked
export function updateClassAttendance(cls: ClassData, present: boolean) {
  const analytics = calculateClassAnalytics(cls);
  
  if (present) {
    // User attended class
    return {
      current_streak: analytics.currentStreak + 1,
      week_attendance: parseInt(analytics.weekAttendance.split('/')[0]) + 1,
      total_saved: analytics.totalSaved + (cls.loss_amount || 0)
    };
  } else {
    // User missed class - deduct from bet amount
    return {
      current_streak: 0,
      week_attendance: parseInt(analytics.weekAttendance.split('/')[0]),
      total_saved: analytics.totalSaved,
      bet_amount: Math.max(0, (cls.bet_amount || 0) - (cls.loss_amount || 0))
    };
  }
}
