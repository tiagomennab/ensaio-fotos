-- Create edit_history table to track image edits
CREATE TABLE IF NOT EXISTS edit_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  edited_image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  operation TEXT NOT NULL,
  prompt TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_edit_history_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_edit_history_user_id ON edit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_created_at ON edit_history(created_at);
CREATE INDEX IF NOT EXISTS idx_edit_history_original_url ON edit_history(original_image_url);