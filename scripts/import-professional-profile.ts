import { createSupabaseServiceClient } from "../src/services/database/supabase";
import {
  importProfessionalProfile,
  SupabaseProfessionalProfileWriter
} from "../src/services/professional-profile/importer";
import { loadProfessionalProfile } from "../src/services/professional-profile/load";

try {
  const profile = await loadProfessionalProfile();
  const client = createSupabaseServiceClient();
  const result = await importProfessionalProfile(
    profile,
    new SupabaseProfessionalProfileWriter(client)
  );

  console.log(JSON.stringify({ ok: true, result }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
