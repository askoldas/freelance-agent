import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfessionalProfile } from "@/domain/professional-profile/schema";

export type ImportCounts = {
  inserted: number;
  updated: number;
  unchanged: number;
  skipped: number;
};

export type ImportResult = Record<string, ImportCounts>;

type UpsertOutcome = "inserted" | "updated" | "unchanged" | "skipped";

export type ProfessionalProfileWriter = {
  upsert(
    table: string,
    match: Record<string, unknown>,
    row: Record<string, unknown>
  ): Promise<UpsertOutcome>;
  deactivateMissingCapabilities(
    profileId: string,
    activeNames: string[]
  ): Promise<number>;
};

const profileId = "00000000-0000-4000-8000-000000000001";

function emptyCounts(): ImportCounts {
  return { inserted: 0, updated: 0, unchanged: 0, skipped: 0 };
}

function count(result: ImportResult, bucket: string, outcome: UpsertOutcome) {
  result[bucket] ??= emptyCounts();
  result[bucket][outcome] += 1;
}

function externalIdFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function importProfessionalProfile(
  profile: ProfessionalProfile,
  writer: ProfessionalProfileWriter
): Promise<ImportResult> {
  const result: ImportResult = {};

  count(
    result,
    "candidate_profiles",
    await writer.upsert(
      "candidate_profiles",
      { id: profileId },
      {
        id: profileId,
        name: profile.profile.name,
        headline: profile.profile.headline,
        summary: profile.profile.fullSummary,
        location: profile.profile.location,
        timezone: profile.profile.timezone,
        languages: profile.languages.map((language) => language.name),
        preferred_project_types: profile.profile.preferredWorkTypes,
        excluded_project_types: [],
        availability_notes: profile.profile.availabilityNotes,
        proposal_preferences: profile.proposalPreferences,
        updated_at: new Date().toISOString()
      }
    )
  );

  await writer.deactivateMissingCapabilities(
    profileId,
    profile.capabilities.map((capability) => capability.name)
  );

  for (const capability of profile.capabilities) {
    count(
      result,
      "capabilities",
      await writer.upsert(
        "capabilities",
        { profile_id: profileId, name: capability.name },
        {
          profile_id: profileId,
          name: capability.name,
          category: capability.category,
          proficiency: capability.proficiency,
          description: capability.name,
          evidence_notes: `Imported from professional-profile.json with status ${capability.status}.`,
          is_active: capability.status !== "private",
          updated_at: new Date().toISOString()
        }
      )
    );
  }

  for (const item of profile.overallExperience) {
    count(
      result,
      "professional_overall_experience",
      await writer.upsert(
        "professional_overall_experience",
        { profile_id: profileId, external_id: item.id },
        {
          profile_id: profileId,
          external_id: item.id,
          area: item.area,
          start_year: item.startYear,
          years_approximate: item.yearsApproximate,
          minimum_project_count: item.minimumProjectCount,
          exact_count: item.exactCount,
          summary: item.summary,
          public_claim: item.publicClaim,
          work_types: item.workTypes ?? [],
          platforms: item.platforms ?? [],
          record_status: item.status,
          source_payload: item,
          updated_at: new Date().toISOString()
        }
      )
    );
  }

  for (const item of profile.technologies) {
    count(
      result,
      "professional_technologies",
      await writer.upsert(
        "professional_technologies",
        { profile_id: profileId, external_id: externalIdFromName(item.name) },
        {
          profile_id: profileId,
          external_id: externalIdFromName(item.name),
          name: item.name,
          category: item.category,
          proficiency: item.proficiency,
          record_status: item.status,
          source_payload: item,
          updated_at: new Date().toISOString()
        }
      )
    );
  }

  for (const item of profile.experienceEntries) {
    count(
      result,
      "professional_experience_entries",
      await writer.upsert(
        "professional_experience_entries",
        { profile_id: profileId, external_id: item.id },
        {
          profile_id: profileId,
          external_id: item.id,
          company: item.company,
          role: item.role,
          start_year: item.startYear,
          end_year: item.endYear,
          employment_type: item.employmentType,
          summary: item.summary,
          responsibilities: item.responsibilities,
          record_status: item.status,
          source_payload: item,
          updated_at: new Date().toISOString()
        }
      )
    );
  }

  for (const item of profile.cases) {
    count(
      result,
      "professional_cases",
      await writer.upsert(
        "professional_cases",
        { profile_id: profileId, external_id: item.id },
        {
          profile_id: profileId,
          external_id: item.id,
          title: item.title,
          type: item.type,
          url: item.url,
          record_status: item.status,
          project_status: item.projectStatus,
          client_type: item.clientType,
          client_name: item.clientName,
          confidential: item.confidential ?? false,
          public_visibility: item.publicVisibility,
          role: item.role,
          business_problem: item.businessProblem,
          solution: item.solution,
          features: item.features,
          technologies: item.technologies,
          results: item.results,
          proposal_safe_summary: item.proposalSafeSummary,
          source_payload: item,
          updated_at: new Date().toISOString()
        }
      )
    );
  }

  for (const [index, item] of profile.education.entries()) {
    const externalId = externalIdFromName(`${item.institution}-${item.program}-${index}`);
    count(
      result,
      "professional_education",
      await writer.upsert(
        "professional_education",
        { profile_id: profileId, external_id: externalId },
        {
          profile_id: profileId,
          external_id: externalId,
          institution: item.institution,
          program: item.program,
          start_year: item.startYear,
          end_year: item.endYear,
          record_status: item.status,
          source_payload: item,
          updated_at: new Date().toISOString()
        }
      )
    );
  }

  for (const item of profile.languages) {
    count(
      result,
      "professional_languages",
      await writer.upsert(
        "professional_languages",
        { profile_id: profileId, external_id: externalIdFromName(item.name) },
        {
          profile_id: profileId,
          external_id: externalIdFromName(item.name),
          name: item.name,
          level: item.level,
          notes: item.notes,
          record_status: item.status,
          source_payload: item,
          updated_at: new Date().toISOString()
        }
      )
    );
  }

  count(
    result,
    "professional_profile_settings",
    await writer.upsert(
      "professional_profile_settings",
      { profile_id: profileId },
      {
        profile_id: profileId,
        proposal_preferences: profile.proposalPreferences,
        claim_rules: profile.claimRules,
        source_payload: {
          proposalPreferences: profile.proposalPreferences,
          claimRules: profile.claimRules
        },
        updated_at: new Date().toISOString()
      }
    )
  );

  return result;
}

function comparable(value: unknown) {
  return JSON.stringify(value ?? null);
}

export class SupabaseProfessionalProfileWriter implements ProfessionalProfileWriter {
  constructor(private readonly client: SupabaseClient) {}

  async upsert(
    table: string,
    match: Record<string, unknown>,
    row: Record<string, unknown>
  ): Promise<UpsertOutcome> {
    const { data: existing, error: selectError } = await this.client
      .from(table)
      .select("*")
      .match(match)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (existing) {
      const changed = Object.entries(row).some(([key, value]) => {
        if (key === "updated_at") {
          return false;
        }
        return (
          comparable((existing as Record<string, unknown>)[key]) !== comparable(value)
        );
      });

      if (!changed) {
        return "unchanged";
      }

      const { error } = await this.client.from(table).update(row).match(match);
      if (error) {
        throw error;
      }
      return "updated";
    }

    const { error } = await this.client.from(table).insert(row);
    if (error) {
      throw error;
    }

    return "inserted";
  }

  async deactivateMissingCapabilities(profileIdInput: string, activeNames: string[]) {
    const { data, error } = await this.client
      .from("capabilities")
      .select("id,name,is_active")
      .eq("profile_id", profileIdInput);

    if (error) {
      throw error;
    }

    const active = new Set(activeNames.map((name) => name.toLowerCase()));
    const stale = (data ?? []).filter(
      (row) => !active.has(String(row.name).toLowerCase()) && row.is_active
    );

    for (const row of stale) {
      const { error: updateError } = await this.client
        .from("capabilities")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", row.id);

      if (updateError) {
        throw updateError;
      }
    }

    return stale.length;
  }
}
