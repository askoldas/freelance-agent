do $$
declare
  profile_uuid uuid := '00000000-0000-4000-8000-000000000001';
  tavily_source_uuid uuid := '00000000-0000-4000-8000-000000000101';
  excluded_title_patterns jsonb := '[
    "\\bguide\\b",
    "\\btutorial\\b",
    "\\bcase study\\b",
    "\\bservices?\\b",
    "\\bcost\\b",
    "\\bpricing\\b",
    "\\bcomparison\\b",
    "\\bhow to\\b",
    "\\bbest\\b",
    "\\bexamples\\b"
  ]'::jsonb;
begin
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
    profile_uuid,
    'Replace with owner name',
    'Full-stack web developer, CMS/ecommerce developer, integration specialist, and automation specialist',
    'Builds practical web applications, business websites, CMS and ecommerce systems, integrations, and automation workflows. Replace this example profile with verified owner-specific wording before using generated proposals.',
    'Europe',
    'Europe/Riga',
    '["English"]'::jsonb,
    '["web applications", "business websites", "CMS", "ecommerce", "integrations", "business automation", "AI-assisted workflows", "technical consulting"]'::jsonb,
    '["commission-only work", "unpaid work", "unclear ownership", "projects without clear buyer intent"]'::jsonb,
    '["EUR", "USD"]'::jsonb,
    'Replace with current availability.',
    '{"tone":"concise, practical, honest", "avoid_claims_without_evidence":true}'::jsonb
  )
  on conflict (id) do update set
    headline = excluded.headline,
    summary = excluded.summary,
    location = excluded.location,
    timezone = excluded.timezone,
    languages = excluded.languages,
    preferred_project_types = excluded.preferred_project_types,
    excluded_project_types = excluded.excluded_project_types,
    preferred_currencies = excluded.preferred_currencies,
    availability_notes = excluded.availability_notes,
    proposal_preferences = excluded.proposal_preferences,
    updated_at = now();

  insert into sources (id, type, name, enabled, configuration) values
    (tavily_source_uuid, 'tavily', 'Tavily public web search', true, '{"provider":"tavily"}'::jsonb)
  on conflict (id) do update set
    type = excluded.type,
    name = excluded.name,
    enabled = true,
    configuration = excluded.configuration,
    updated_at = now();

  update capabilities
  set is_active = false,
      updated_at = now()
  where profile_id = profile_uuid
    and lower(name) not in (
      'full-stack web development',
      'web application engineering',
      'business websites and service platforms',
      'existing project completion, debugging, and repair',
      'frontend implementation from designs',
      'responsive ui with custom css',
      'multilingual websites and applications',
      'next.js and react',
      'javascript and typescript',
      'firebase and firestore',
      'supabase and postgresql',
      'authentication and account areas',
      'payments and subscription flows',
      'rest apis, webhooks, and third-party integrations',
      'wordpress development and customization',
      'woocommerce development and integrations',
      'shopify store setup and customization',
      'shopify integrations and custom functionality',
      'payload cms and headless cms architecture',
      'custom admin panels and content systems',
      'business-process automation',
      'ai workflow and agent design',
      'n8n workflow automation',
      'telegram bots and integrations',
      'email, crm, spreadsheet, and api automation',
      'lead research and sales automation',
      'document processing and report generation',
      'mvp planning and technical architecture',
      'technology and stack selection',
      'requirements clarification and project scoping',
      'maintenance, refactoring, and deployment support'
    );

  insert into capabilities (
    profile_id,
    name,
    category,
    proficiency,
    description,
    evidence_notes,
    is_active
  ) values
    (profile_uuid, 'Full-stack web development', 'core_web', 'strong', 'Builds complete web solutions across frontend, backend, data flow, integrations, deployment, and operational maintenance.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Web application engineering', 'core_web', 'strong', 'Implements interactive web applications, MVPs, dashboards, portals, and workflow tools with maintainable application structure.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Business websites and service platforms', 'core_web', 'strong', 'Builds business websites, service platforms, landing flows, content-driven pages, and practical lead-generation experiences.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Existing project completion, debugging, and repair', 'core_web', 'strong', 'Takes over incomplete or broken projects, diagnoses issues, fixes bugs, and moves existing applications toward a stable release.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Frontend implementation from designs', 'frontend', 'strong', 'Turns provided designs and product requirements into responsive, accessible, production-ready frontend interfaces.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Responsive UI with custom CSS', 'frontend', 'strong', 'Builds responsive interfaces using custom CSS, CSS Modules, layout systems, and pragmatic design tokens without relying on heavy UI frameworks.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Multilingual websites and applications', 'frontend', 'working', 'Implements multilingual website and application flows, localization structure, and translated content experiences.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Next.js and React', 'frameworks_backend', 'strong', 'Builds React and Next.js applications, including App Router projects, server-rendered pages, API routes, and component-driven interfaces.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'JavaScript and TypeScript', 'frameworks_backend', 'strong', 'Implements typed JavaScript and TypeScript application code, integrations, validation, and maintainable business logic.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Firebase and Firestore', 'frameworks_backend', 'working', 'Works with Firebase and Firestore for authentication-adjacent flows, serverless data storage, and application backends.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Supabase and PostgreSQL', 'frameworks_backend', 'working', 'Designs and implements Supabase/PostgreSQL-backed application features, relational data models, and server-side persistence.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Authentication and account areas', 'frameworks_backend', 'working', 'Builds login, account, protected-page, role-aware, and user-profile flows for web applications.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Payments and subscription flows', 'frameworks_backend', 'working', 'Implements payment, checkout, subscription, purchase-state, and account-access flows using third-party payment services.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'REST APIs, webhooks, and third-party integrations', 'integration', 'strong', 'Builds API integrations, webhook handlers, data synchronization, scheduled jobs, and third-party service connections.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'WordPress development and customization', 'cms_ecommerce', 'working', 'Works on WordPress sites, customization, structured content, plugin-adjacent integration needs, and practical site improvements.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'WooCommerce development and integrations', 'cms_ecommerce', 'working', 'Supports WooCommerce store customization, checkout-adjacent flows, product/content structure, and integrations.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Shopify store setup and customization', 'cms_ecommerce', 'working', 'Works on Shopify store setup, theme customization, product/content structure, and store configuration tasks.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Shopify integrations and custom functionality', 'cms_ecommerce', 'adjacent', 'Can approach Shopify integration and custom functionality work through transferable API, frontend, and ecommerce experience while identifying Shopify-specific unknowns.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Payload CMS and headless CMS architecture', 'cms_ecommerce', 'working', 'Designs headless CMS architecture, content modeling, admin workflows, and API-driven content delivery.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Custom admin panels and content systems', 'cms_ecommerce', 'strong', 'Builds custom admin interfaces, content-management workflows, internal tools, and structured editorial systems.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Business-process automation', 'automation_ai', 'strong', 'Automates repeatable business processes with APIs, scheduled tasks, webhooks, data transformations, and human review steps.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'AI workflow and agent design', 'automation_ai', 'working', 'Designs AI-assisted workflows, agent-like task flows, extraction, classification, drafting, and human-in-the-loop review systems.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'n8n workflow automation', 'automation_ai', 'working', 'Builds and reasons about n8n-style workflow automation, triggers, actions, webhooks, and service-to-service flows.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Telegram bots and integrations', 'automation_ai', 'working', 'Creates Telegram bot workflows, notifications, callbacks, private operational controls, and integration touchpoints.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Email, CRM, spreadsheet, and API automation', 'automation_ai', 'strong', 'Connects email, CRM, spreadsheet, and API systems to reduce manual work and improve reporting or follow-up flows.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Lead research and sales automation', 'automation_ai', 'working', 'Builds lead research, qualification, enrichment, and sales-support automations with reviewable outputs.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Document processing and report generation', 'automation_ai', 'working', 'Creates workflows for extracting information from documents, transforming it, and generating structured reports or summaries.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'MVP planning and technical architecture', 'consulting_delivery', 'working', 'Helps scope MVPs, choose implementation approaches, plan technical architecture, and identify delivery risks.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Technology and stack selection', 'consulting_delivery', 'working', 'Recommends practical technology choices based on business goals, constraints, maintainability, and delivery risk.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Requirements clarification and project scoping', 'consulting_delivery', 'strong', 'Clarifies requirements, breaks vague ideas into deliverable scope, identifies unknowns, and proposes practical next steps.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true),
    (profile_uuid, 'Maintenance, refactoring, and deployment support', 'consulting_delivery', 'strong', 'Improves existing systems through maintenance, refactoring, deployment fixes, stability work, and incremental improvements.', 'Capability seed only. Replace or enrich with verified project evidence before making proposal claims.', true)
  on conflict (profile_id, lower(name)) do update set
    category = excluded.category,
    proficiency = excluded.proficiency,
    description = excluded.description,
    evidence_notes = excluded.evidence_notes,
    is_active = true,
    updated_at = now();

  update search_tracks
  set enabled = false,
      updated_at = now()
  where source_id = tavily_source_uuid
    and slug not in (
      'business-website-development',
      'website-redesign-modernization',
      'web-application-mvp-development',
      'existing-project-completion-bug-fixing',
      'nextjs-react-development',
      'wordpress-development-customization',
      'woocommerce-projects',
      'shopify-development-integrations',
      'cms-headless-cms-projects',
      'payload-cms-projects',
      'dashboards-internal-tools',
      'customer-portals-account-systems',
      'authentication-payment-integrations',
      'api-third-party-integrations',
      'multilingual-websites-localization',
      'ai-agents-assistants',
      'n8n-workflow-automation',
      'business-process-automation',
      'telegram-bots-messaging-automation',
      'crm-email-spreadsheet-automation',
      'agency-subcontracting',
      'technical-consulting-mvp-planning'
    );

  insert into search_tracks (
    source_id,
    slug,
    name,
    category,
    queries,
    include_domains,
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
    (tavily_source_uuid, 'business-website-development', 'Business website development', 'web_build', '["looking for freelance developer business website project paid", "need contractor to build business website budget proposal", "seeking web developer for service website project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 42, 76, true),
    (tavily_source_uuid, 'website-redesign-modernization', 'Website redesign and modernization', 'web_build', '["looking for contractor website redesign project budget", "need freelance developer to modernize website paid", "seeking proposal for website redesign and migration"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 42, 76, true),
    (tavily_source_uuid, 'web-application-mvp-development', 'Web application and MVP development', 'web_build', '["looking for freelance developer MVP web application project", "need contractor to build web app budget proposal", "hiring developer for paid MVP platform project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'existing-project-completion-bug-fixing', 'Existing project completion and bug fixing', 'existing_project', '["need developer to finish existing project paid", "looking for contractor bug fixing web application project", "hiring freelance developer to repair broken website app"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'nextjs-react-development', 'Next.js and React development', 'frontend', '["looking for freelance React developer project paid", "need Next.js contractor for web application budget", "hiring React Next.js developer proposal project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 42, 76, true),
    (tavily_source_uuid, 'wordpress-development-customization', 'WordPress development and customization', 'cms', '["looking for freelance WordPress developer customization project", "need WordPress contractor paid website work budget", "seeking proposal for WordPress development project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 42, 75, true),
    (tavily_source_uuid, 'woocommerce-projects', 'WooCommerce projects', 'cms', '["looking for WooCommerce developer freelance project paid", "need contractor WooCommerce customization integration budget", "hiring WooCommerce developer for store project proposal"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 42, 75, true),
    (tavily_source_uuid, 'shopify-development-integrations', 'Shopify development and integrations', 'cms', '["looking for Shopify developer freelance project paid", "need Shopify contractor integration customization budget", "hiring Shopify developer for store project proposal"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 40, 74, true),
    (tavily_source_uuid, 'cms-headless-cms-projects', 'CMS and headless CMS projects', 'cms', '["looking for headless CMS developer freelance project", "need contractor CMS content system budget proposal", "seeking developer for CMS migration paid project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 40, 74, true),
    (tavily_source_uuid, 'payload-cms-projects', 'Payload CMS projects', 'cms', '["looking for Payload CMS developer freelance project", "need contractor Payload CMS build paid budget", "hiring developer for Payload CMS project proposal"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 40, 74, true),
    (tavily_source_uuid, 'dashboards-internal-tools', 'Dashboards and internal tools', 'web_build', '["looking for developer internal dashboard project paid", "need contractor to build internal tool budget proposal", "hiring freelance developer business dashboard project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'customer-portals-account-systems', 'Customer portals and account systems', 'web_build', '["looking for freelance developer customer portal project", "need contractor account area web app budget", "hiring developer for client portal paid project proposal"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'authentication-payment-integrations', 'Authentication and payment integrations', 'integration', '["looking for developer authentication payment integration project", "need contractor checkout subscription integration budget", "hiring freelance developer login payment flow paid"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 42, 76, true),
    (tavily_source_uuid, 'api-third-party-integrations', 'API and third-party integrations', 'integration', '["looking for API integration developer freelance project", "need contractor third party integration budget proposal", "hiring developer webhooks API automation paid project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'multilingual-websites-localization', 'Multilingual websites and localization', 'frontend', '["looking for developer multilingual website project paid", "need contractor localization web application budget", "seeking proposal multilingual website development project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 40, 74, true),
    (tavily_source_uuid, 'ai-agents-assistants', 'AI agents and assistants', 'ai_agent', '["looking for AI agent developer freelance project paid", "need contractor internal AI assistant budget proposal", "hiring developer AI workflow assistant project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'n8n-workflow-automation', 'n8n and workflow automation', 'automation', '["looking for n8n automation developer freelance project", "need contractor n8n workflow automation budget", "hiring workflow automation specialist paid project proposal"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'business-process-automation', 'Business-process automation', 'automation', '["looking for business process automation developer paid", "need contractor automate manual workflow budget proposal", "hiring freelance automation specialist project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'telegram-bots-messaging-automation', 'Telegram bots and messaging automation', 'automation', '["looking for Telegram bot developer freelance project", "need contractor messaging automation budget proposal", "hiring developer Telegram integration paid project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 42, 76, true),
    (tavily_source_uuid, 'crm-email-spreadsheet-automation', 'CRM, email, and spreadsheet automation', 'automation', '["looking for CRM email spreadsheet automation developer", "need contractor automate Google Sheets CRM email budget", "hiring freelance automation developer paid integration project"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 44, 78, true),
    (tavily_source_uuid, 'agency-subcontracting', 'Agency subcontracting', 'consulting', '["agency looking for freelance web developer subcontractor paid", "need contractor developer for agency project budget", "hiring white label development subcontractor proposal"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 40, 74, true),
    (tavily_source_uuid, 'technical-consulting-mvp-planning', 'Technical consulting and MVP planning', 'consulting', '["looking for technical consultant MVP planning project", "need contractor architecture scoping budget proposal", "hiring freelance consultant technology stack selection paid"]'::jsonb, '[]'::jsonb, '[]'::jsonb, excluded_title_patterns, 'month', 90, 21, 5, 40, 74, true)
  on conflict (slug) do update set
    source_id = excluded.source_id,
    name = excluded.name,
    category = excluded.category,
    queries = excluded.queries,
    include_domains = excluded.include_domains,
    exclude_domains = excluded.exclude_domains,
    excluded_title_patterns = excluded.excluded_title_patterns,
    time_range = excluded.time_range,
    start_date = excluded.start_date,
    freshness_days = excluded.freshness_days,
    social_freshness_days = excluded.social_freshness_days,
    result_limit = excluded.result_limit,
    min_prefilter_score = excluded.min_prefilter_score,
    notification_threshold = excluded.notification_threshold,
    enabled = true,
    updated_at = now();
end $$;
