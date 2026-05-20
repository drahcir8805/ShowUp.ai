-- Seed data for location-aware check-ins and trusted alerts.
-- Replace UUID values and emails with real auth.users IDs in your local environment.

-- Example user IDs (must exist in auth.users)
-- student: 11111111-1111-1111-1111-111111111111
-- friend:  22222222-2222-2222-2222-222222222222

INSERT INTO building_locations (id, name, latitude, longitude, radius_meters)
VALUES
  ('aaaaaaa1-1111-1111-1111-111111111111', 'LAZ', 43.472300, -80.544900, 150),
  ('aaaaaaa2-2222-2222-2222-222222222222', 'Science', 43.470900, -80.543600, 150)
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, code, name, building_location_id, start_time, end_time)
VALUES
  ('bbbbbbb1-1111-1111-1111-111111111111', 'LAZ101', 'LAZ', 'aaaaaaa1-1111-1111-1111-111111111111', '09:00', '10:00'),
  ('bbbbbbb2-2222-2222-2222-222222222222', 'SCI201', 'Science', 'aaaaaaa2-2222-2222-2222-222222222222', '11:00', '12:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (user_id, username, display_name, bio)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'student-one', 'Student One', 'Enrolled in LAZ and Science'),
  ('22222222-2222-2222-2222-222222222222', 'trusted-friend', 'Trusted Friend', 'Receives suspicious check-in alerts')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO enrollments (user_id, course_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbb1-1111-1111-1111-111111111111'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbb2-2222-2222-2222-222222222222')
ON CONFLICT (user_id, course_id) DO NOTHING;

INSERT INTO follows (follower_id, following_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (follower_id, following_id) DO NOTHING;

INSERT INTO trusted_friends (user_id, friend_user_id, email, alerts_enabled)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'friend@example.com', true)
ON CONFLICT (user_id, friend_user_id) DO NOTHING;
