import { loadProfessionalProfile } from "../src/services/professional-profile/load";

try {
  const profile = await loadProfessionalProfile();
  console.log(
    JSON.stringify(
      {
        ok: true,
        schemaVersion: profile.schemaVersion,
        profile: profile.profile.name,
        counts: {
          overallExperience: profile.overallExperience.length,
          capabilities: profile.capabilities.length,
          technologies: profile.technologies.length,
          experienceEntries: profile.experienceEntries.length,
          cases: profile.cases.length,
          education: profile.education.length,
          languages: profile.languages.length
        }
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
