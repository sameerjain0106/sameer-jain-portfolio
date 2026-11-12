export type ProjectCategory =
  | "Machine Learning"
  | "Statistical Modeling"
  | "Data Science"
  | "Quantitative Research";

export type ApproachStatus = "complete" | "methodology-only" | "in-progress";

export interface ModelResult {
  name: string;
  accuracy: number;
  f1: number;
}

export interface PipelineStage {
  id: string;
  title: string;
  description: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
  caption: string;
}

export interface ProjectHeadlineStat {
  value: string;
  label: string;
}

export interface ProjectSummary {
  slug: string;
  title: string;
  oneLiner: string;
  category: ProjectCategory[];
  technologies: string[];
  featured: boolean;
  githubUrl: string | null;
  cardImage?: ProjectImage;
  headlineStats?: ProjectHeadlineStat[];
}

export interface ProjectApproach {
  id: string;
  label: string;
  status: ApproachStatus;
  summary: string;
  methodology: string[];
  pipeline?: PipelineStage[];
  models?: ModelResult[];
  images?: ProjectImage[];
  notes?: string[];
}

export interface Project extends ProjectSummary {
  cardImage: ProjectImage;
  collaborators?: string[];
  problem: string;
  data: {
    description: string;
    classes: string[];
    imagesPerClass: number;
    totalImages: number;
    imageSize: string;
  };
  approaches: ProjectApproach[];
  limitations: string[];
  futureWork: string[];
}
