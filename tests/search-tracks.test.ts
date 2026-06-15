import { describe, expect, it } from "vitest";
import { defaultSearchTracks } from "../src/domain/search-tracks/defaults";
import { searchTrackSchema } from "../src/domain/search-tracks/schema";

describe("search track configuration", () => {
  it("contains the required initial tracks", () => {
    expect(defaultSearchTracks).toHaveLength(8);
    expect(defaultSearchTracks.map((track) => track.slug)).toEqual([
      "web-applications-business-platforms",
      "existing-project-repair",
      "cms-content-systems",
      "ai-agents-workflow-automation",
      "business-process-automation",
      "apis-integrations",
      "agency-subcontracting",
      "technical-consulting"
    ]);
  });

  it("validates every default track", () => {
    for (const track of defaultSearchTracks) {
      expect(searchTrackSchema.parse(track).queries[0]).toMatch(
        /project|developer|automation|consultant|freelance|workflow|planning/i
      );
    }
  });
});
