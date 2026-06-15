import { readFile } from "node:fs/promises";
import {
  professionalProfileSchema,
  type ProfessionalProfile
} from "@/domain/professional-profile/schema";

export async function loadProfessionalProfile(
  path = "data/professional-profile.json"
): Promise<ProfessionalProfile> {
  const raw = await readFile(path, "utf8");
  return professionalProfileSchema.parse(JSON.parse(raw));
}
