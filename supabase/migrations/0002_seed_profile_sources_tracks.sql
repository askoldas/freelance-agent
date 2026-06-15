insert into candidate_profiles (
  id,
  name,
  headline,
  summary,
  location,
  timezone,
  languages,
  preferred_project_types,
  excluded_project_types,
  preferred_currencies,
  availability_notes,
  proposal_preferences
) values (
  '00000000-0000-4000-8000-000000000001',
  'Replace with owner name',
  'Full-stack developer and AI automation specialist',
  'Builds practical web applications, integrations, CMS solutions, and business automation workflows. Replace this example profile with verified owner-specific wording before sending proposals.',
  'Europe',
  'Europe/Riga',
  '["English"]'::jsonb,
  '["web applications", "business automation", "CMS", "integrations", "AI-assisted workflows"]'::jsonb,
  '["commission-only work", "unpaid work", "unclear ownership"]'::jsonb,
  '["EUR", "USD"]'::jsonb,
  'Replace with current availability.',
  '{"tone":"concise, practical, honest", "avoid_claims_without_evidence":true}'::jsonb
) on conflict (id) do nothing;

insert into capabilities (profile_id, name, category, proficiency, description, evidence_notes) values
  ('00000000-0000-4000-8000-000000000001', 'Next.js and React', 'frontend', 'strong', 'Builds modern React and Next.js applications, including App Router projects.', 'Replace with specific verified examples.'),
  ('00000000-0000-4000-8000-000000000001', 'TypeScript and JavaScript', 'engineering', 'strong', 'Implements maintainable application logic, API integrations, and typed interfaces.', 'Replace with specific verified examples.'),
  ('00000000-0000-4000-8000-000000000001', 'Supabase and PostgreSQL', 'backend', 'working', 'Designs server-side data flows and persistence for small to medium applications.', 'Replace with specific verified examples.'),
  ('00000000-0000-4000-8000-000000000001', 'CMS implementation', 'cms', 'working', 'Works with CMS-driven websites, admin interfaces, and structured content workflows.', 'Replace with specific verified examples.'),
  ('00000000-0000-4000-8000-000000000001', 'Business automation', 'automation', 'strong', 'Automates repeatable business workflows with APIs, scheduled jobs, webhooks, and human review steps.', 'Replace with specific verified examples.'),
  ('00000000-0000-4000-8000-000000000001', 'AI workflow design', 'ai', 'working', 'Builds AI-assisted research, extraction, classification, and report-generation workflows with validation.', 'Replace with specific verified examples.'),
  ('00000000-0000-4000-8000-000000000001', 'Telegram bots', 'automation', 'working', 'Creates Telegram notification and control flows for private operational tools.', 'Replace with specific verified examples.')
on conflict do nothing;

insert into sources (id, type, name, enabled, configuration) values
  ('00000000-0000-4000-8000-000000000101', 'tavily', 'Tavily public web search', true, '{"provider":"tavily"}'::jsonb)
on conflict (type, name) do nothing;

insert into search_tracks (
  source_id,
  slug,
  name,
  category,
  queries,
  exclude_domains,
  excluded_title_patterns,
  time_range,
  freshness_days,
  social_freshness_days,
  result_limit,
  min_prefilter_score,
  notification_threshold,
  enabled
) values
  ('00000000-0000-4000-8000-000000000101', 'web-applications-business-platforms', 'Web applications and business platforms', 'web_build', '["freelance project build customer portal web application", "looking for developer build business dashboard portal", "need web app developer for client platform"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 40, 78, true),
  ('00000000-0000-4000-8000-000000000101', 'existing-project-repair', 'Completion or repair of existing projects', 'existing_project', '["need developer finish existing React project", "fix broken application authentication deployment", "take over incomplete web application project"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 40, 76, true),
  ('00000000-0000-4000-8000-000000000101', 'cms-content-systems', 'CMS and content systems', 'cms', '["need CMS website developer structured content workflow", "CMS developer freelance project", "headless CMS migration project looking for developer"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 40, 74, true),
  ('00000000-0000-4000-8000-000000000101', 'ai-agents-workflow-automation', 'AI agents and workflow automation', 'ai_agent', '["AI agent workflow automation freelance project", "automate document processing with AI developer needed", "internal AI assistant business workflow project"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 42, 78, true),
  ('00000000-0000-4000-8000-000000000101', 'business-process-automation', 'Non-AI business automation', 'automation', '["automate spreadsheet CRM email workflow developer", "business process automation freelancer webhooks API", "automation developer project looking for contractor"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 42, 76, true),
  ('00000000-0000-4000-8000-000000000101', 'apis-integrations', 'APIs and integrations', 'integration', '["API integration freelancer payment auth CRM", "connect CRM email reporting dashboard developer", "third party API integration project developer needed"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 40, 74, true),
  ('00000000-0000-4000-8000-000000000101', 'agency-subcontracting', 'Agency subcontracting', 'consulting', '["agency looking for freelance web developer subcontractor", "white label web development subcontractor project", "agency needs automation developer subcontractor"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 38, 72, true),
  ('00000000-0000-4000-8000-000000000101', 'technical-consulting', 'Technical consulting', 'consulting', '["MVP technical planning consultant project looking for", "automation feasibility consultant project needed", "review existing codebase architecture freelance"]'::jsonb, '[]'::jsonb, '["\\\\bguide\\\\b", "\\\\btutorial\\\\b", "\\\\bcase study\\\\b", "\\\\bservices?\\\\b", "\\\\bcost\\\\b"]'::jsonb, 'month', 90, 21, 5, 38, 72, true)
on conflict (slug) do nothing;
