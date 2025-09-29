Table conversion_logs

CREATE TABLE conversion_logs (
  id SERIAL PRIMARY KEY,
  input TEXT NOT NULL,
  base VARCHAR(10) NOT NULL,
  result_decimal TEXT,
  result_binary TEXT,
  result_hex TEXT,
  steps JSONB,
  visualizer JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);


Include indices on created_at for listing. Add user_id column later if auth is added.