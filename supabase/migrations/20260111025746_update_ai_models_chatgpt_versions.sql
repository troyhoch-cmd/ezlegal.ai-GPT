/*
  # Update AI Models with ChatGPT Versions

  1. Changes
    - Remove existing AI models
    - Add new ChatGPT model versions matching LegalBreeze
    - Models include: ChatGPT, ChatGPT Plus, ChatGPT 4, ChatGPT 4o, 
      ChatGPT 4o mini, ChatGPT o1, ChatGPT o3-mini, ChatGPT 5, 
      ChatGPT 5 mini, ChatGPT 5 nano

  2. Default Model
    - ChatGPT 5 is set as the default model
*/

DELETE FROM ai_model_configs;

INSERT INTO ai_model_configs (model_name, display_name, provider, is_active, is_default, priority, cost_per_token, max_tokens, settings) VALUES
  ('chatgpt', 'ChatGPT', 'openai', true, false, 1, 0.000002, 4096, '{"temperature": 0.7}'),
  ('chatgpt-plus', 'ChatGPT Plus', 'openai', true, false, 2, 0.00002, 8192, '{"temperature": 0.7}'),
  ('chatgpt-4', 'ChatGPT 4', 'openai', true, false, 3, 0.00003, 8192, '{"temperature": 0.7}'),
  ('chatgpt-4o', 'ChatGPT 4o', 'openai', true, false, 4, 0.000005, 128000, '{"temperature": 0.7}'),
  ('chatgpt-4o-mini', 'ChatGPT 4o mini', 'openai', true, false, 5, 0.00000015, 128000, '{"temperature": 0.7}'),
  ('chatgpt-o1', 'ChatGPT o1', 'openai', true, false, 6, 0.000015, 200000, '{"temperature": 0.7}'),
  ('chatgpt-o3-mini', 'ChatGPT o3-mini', 'openai', true, false, 7, 0.0000011, 200000, '{"temperature": 0.7}'),
  ('chatgpt-5', 'ChatGPT 5', 'openai', true, true, 8, 0.00006, 256000, '{"temperature": 0.7}'),
  ('chatgpt-5-mini', 'ChatGPT 5 mini', 'openai', true, false, 9, 0.00001, 256000, '{"temperature": 0.7}'),
  ('chatgpt-5-nano', 'ChatGPT 5 nano', 'openai', true, false, 10, 0.000003, 128000, '{"temperature": 0.7}');
