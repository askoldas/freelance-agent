alter table search_tracks
  add column if not exists excluded_title_patterns jsonb not null default '[]'::jsonb,
  add column if not exists time_range text check (time_range in ('day', 'week', 'month', 'year')),
  add column if not exists start_date date,
  add column if not exists freshness_days integer not null default 90 check (freshness_days between 1 and 730),
  add column if not exists social_freshness_days integer not null default 21 check (social_freshness_days between 1 and 180);

alter table opportunities
  add column if not exists content_type text not null default 'unknown' check (
    content_type in (
      'active_opportunity',
      'social_post',
      'informational',
      'service_page',
      'portfolio',
      'documentation',
      'discussion',
      'tutorial',
      'case_study',
      'comparison',
      'unknown'
    )
  ),
  add column if not exists buyer_intent_evidence jsonb not null default '[]'::jsonb,
  add column if not exists rejection_category text check (
    rejection_category in (
      'excluded_domain',
      'excluded_title_pattern',
      'informational_content',
      'service_page',
      'portfolio',
      'documentation',
      'case_study',
      'generic_discussion',
      'missing_buyer_intent',
      'stale_result',
      'undated_social_post',
      'stale_social_post',
      'low_prefilter_score'
    )
  ),
  add column if not exists rejection_reason text,
  add column if not exists rejected_at timestamptz;

create index if not exists opportunities_rejection_category_idx on opportunities(rejection_category);
