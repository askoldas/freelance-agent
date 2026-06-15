import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EvaluationCapability,
  EvaluationProfile
} from "@/use-cases/evaluate-opportunity";

export class ProfileRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getEvaluationContext(): Promise<{
    profile: EvaluationProfile;
    capabilities: EvaluationCapability[];
  }> {
    const { data: profile, error: profileError } = await this.client
      .from("candidate_profiles")
      .select("id,name,headline,summary")
      .limit(1)
      .single();

    if (profileError) {
      throw profileError;
    }

    const { data: capabilities, error: capabilitiesError } = await this.client
      .from("capabilities")
      .select("name,category,proficiency,description")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("name");

    if (capabilitiesError) {
      throw capabilitiesError;
    }

    return {
      profile: profile as EvaluationProfile,
      capabilities: (capabilities ?? []) as EvaluationCapability[]
    };
  }
}
