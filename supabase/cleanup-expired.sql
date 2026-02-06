-- ============================================================
-- Cleanup Script for Expired Sessions
-- Run this periodically via pg_cron or edge function
-- ============================================================

-- Mark expired sessions as EXPIRED
UPDATE generation_sessions
SET status = 'EXPIRED'
WHERE status = 'ACTIVE'
  AND expires_at < NOW();

-- Clean up old rate limit records (older than 24 hours)
DELETE FROM rate_limits
WHERE window_start < NOW() - INTERVAL '24 hours';

-- Optional: Archive old completed sessions to a separate table
-- CREATE TABLE IF NOT EXISTS generation_sessions_archive (LIKE generation_sessions INCLUDING ALL);
-- INSERT INTO generation_sessions_archive
-- SELECT * FROM generation_sessions
-- WHERE status = 'COMPLETED'
--   AND completed_at < NOW() - INTERVAL '30 days';
-- DELETE FROM generation_sessions
-- WHERE status = 'COMPLETED'
--   AND completed_at < NOW() - INTERVAL '30 days';
