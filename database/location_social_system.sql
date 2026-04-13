-- Location-aware check-in and friendship alert schema

CREATE TYPE check_in_status AS ENUM ('valid', 'blocked', 'suspicious');

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS building_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 150 CHECK (radius_meters > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  building_location_id UUID NOT NULL REFERENCES building_locations(id) ON DELETE RESTRICT,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (code, name)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_latitude DOUBLE PRECISION NOT NULL,
  user_longitude DOUBLE PRECISION NOT NULL,
  status check_in_status NOT NULL,
  resolved_building_id UUID REFERENCES building_locations(id) ON DELETE SET NULL,
  distance_from_class_meters INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (follower_id <> following_id),
  UNIQUE (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS trusted_friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (user_id <> friend_user_id),
  UNIQUE (user_id, friend_user_id)
);

CREATE TABLE IF NOT EXISTS suspicious_check_in_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_in_id UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  actual_nearby_building_id UUID REFERENCES building_locations(id) ON DELETE SET NULL,
  attempted_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_course_id ON check_ins(course_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_check_in_time ON check_ins(check_in_time);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_check_in_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user profiles are readable" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "users upsert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users read own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users read own checkins" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own checkins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users read own follows" ON follows
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "users insert own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "users delete own follows" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "users manage trusted friends" ON trusted_friends
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users read own suspicious events" ON suspicious_check_in_events
  FOR SELECT USING (auth.uid() = user_id);
