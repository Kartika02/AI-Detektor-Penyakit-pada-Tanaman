
export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebSource;
}

export interface AnalysisResponse {
  analysis: string;
  sources: GroundingChunk[];
}
