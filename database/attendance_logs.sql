-- Attendance logs table for tracking student check-ins
-- This table stores both manual and silent check-ins for each class

CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  check_in_type VARCHAR(10) NOT NULL CHECK (check_in_type IN ('manual', 'silent')),
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  student_lat DECIMAL(10, 8) NOT NULL,
  student_lng DECIMAL(11, 8) NOT NULL,
  distance INTEGER NOT NULL, -- Distance in meters from class location
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_id ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_class_id ON attendance_logs(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_checked_at ON attendance_logs(checked_at);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_class_date ON attendance_logs(user_id, class_id, DATE(checked_at));

-- RLS (Row Level Security) policies
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own attendance logs
CREATE POLICY "Users can view own attendance logs" ON attendance_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own attendance logs
CREATE POLICY "Users can insert own attendance logs" ON attendance_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own attendance logs (if needed)
CREATE POLICY "Users can update own attendance logs" ON attendance_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_attendance_logs_updated_at
  BEFORE UPDATE ON attendance_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for today's attendance summary
CREATE OR REPLACE VIEW today_attendance_summary AS
SELECT 
  u.id as user_id,
  u.email,
  c.id as class_id,
  c.name as class_name,
  c.start_time,
  c.end_time,
  MAX(CASE WHEN al.check_in_type = 'manual' THEN al.success END) as manual_check_in_success,
  MAX(CASE WHEN al.check_in_type = 'silent' THEN al.success END) as silent_check_in_success,
  MAX(CASE WHEN al.check_in_type = 'manual' THEN al.checked_at END) as manual_check_in_time,
  MAX(CASE WHEN al.check_in_type = 'silent' THEN al.checked_at END) as silent_check_in_time,
  CASE 
    WHEN MAX(CASE WHEN al.check_in_type = 'manual' THEN al.success END) = true 
     AND MAX(CASE WHEN al.check_in_type = 'silent' THEN al.success END) = true THEN 'present'
    WHEN MAX(CASE WHEN al.check_in_type = 'manual' THEN al.success END) = true THEN 'partial'
    WHEN MAX(CASE WHEN al.check_in_type = 'manual' THEN al.success END) = false THEN 'absent'
    ELSE 'pending'
  END as overall_status
FROM auth.users u
CROSS JOIN classes c
LEFT JOIN attendance_logs al ON u.id = al.user_id AND c.id = al.class_id 
  AND DATE(al.checked_at) = CURRENT_DATE
WHERE u.id = auth.uid()
GROUP BY u.id, u.email, c.id, c.name, c.start_time, c.end_time;
