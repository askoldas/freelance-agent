export type SourceRecordReference = {
  sourceTable: string;
  sourceRecordId: string;
  sourceExternalId?: string;
};

export type DocumentClaim = {
  claimText: string;
  source: SourceRecordReference;
};

export function createDocumentClaim(input: DocumentClaim): DocumentClaim {
  if (!input.claimText.trim()) {
    throw new Error("Document claim text is required.");
  }

  if (!input.source.sourceTable || !input.source.sourceRecordId) {
    throw new Error("Document claims must reference a source record.");
  }

  return input;
}
