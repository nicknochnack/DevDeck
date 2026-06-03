export type SlideBase = { id: string; title: string };

export type SlideNote = {
  slideId: string;
  notes: string;
};

export type SlideNotesData = {
  slideNotes: SlideNote[];
};

export type TitleSlide = SlideBase & {
  type: "title";
  heading: string;
  subtitle?: string;
  author?: string;
  date?: string;
  reveals?: { src: string; alt: string; name: string; handle: string }[];
  qr?: { src: string; label: string; caption?: string };
};

export type JobsGridSlide = SlideBase & {
  type: "jobsGrid";
  heading: string;
  jobs: { title: string; tag: string; blurb: string }[];
};

export type SkillsCodeSlide = SlideBase & {
  type: "skillsCode";
  heading: string;
  skills: { name: string; why: string }[];
  logo?: { src: string; alt: string };
};

export type SectionSlide = SlideBase & {
  type: "section";
  number: string;
  name: string;
};

export type BulletsSlide = SlideBase & {
  type: "bullets";
  heading: string;
  prefix?: string;
  items: string[];
};

export type CodeSlide = SlideBase & {
  type: "code";
  filename: string;
  language: string;
  code: string;
  caption?: string;
};

export type CompareSlide = SlideBase & {
  type: "compare";
  heading: string;
  left: { label: string; items: string[] };
  right: { label: string; items: string[] };
};

export type StatSlide = SlideBase & {
  type: "stat";
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  detail?: string;
};

export type QuoteSlide = SlideBase & {
  type: "quote";
  text: string;
  attribution: string;
  role?: string;
};

export type ImageSlide = SlideBase & {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};

export type QuestionSlide = SlideBase & {
  type: "question";
  question: string;
  hint?: string;
};

export type LogoSlide = SlideBase & {
  type: "logo";
  src: string;
  alt: string;
  caption?: string;
};

export type FormulaSlide = SlideBase & {
  type: "formula";
  heading: string;
  rows: {
    label: string;
    terms: string[]; // e.g. ["input", "rules", "answer"]
    accent?: boolean;
  }[];
  caption?: string;
};

export type ImageGridSlide = SlideBase & {
  type: "imageGrid";
  heading: string;
  images: { src: string; alt: string }[];
  caption?: string;
};

export type FlowchartSlide = SlideBase & {
  type: "flowchart";
  rootNode: {
    id: string;
    label: string;
  };
  nodes: {
    id: string;
    label: string;
    targetSlideId: string; // slide id to navigate to when clicked
  }[];
};

export type BenefitsSlide = SlideBase & {
  type: "benefits";
  heading: string;
  benefits: {
    title: string;
    description: string;
    imageSrc: string; // path to image in src/assets/benefits
  }[];
};

export type TimelineSlide = SlideBase & {
  type: "timeline";
  heading: string;
  disclaimer?: string;
  milestones: {
    period: string; // e.g., "Q2", "Q3", "Q4"
    items: string[];
  }[];
};

export type BioSlide = SlideBase & {
  type: "bio";
  heading: string;
  image: {
    src: string;
    alt: string;
  };
  items: string[];
};

export type VerticalWordSlide = SlideBase & {
  type: "verticalWord";
  words: string[];
  meme: {
    src: string;
    alt: string;
  };
};

export type Slide =
  | TitleSlide
  | SectionSlide
  | BulletsSlide
  | CodeSlide
  | CompareSlide
  | StatSlide
  | QuoteSlide
  | ImageSlide
  | QuestionSlide
  | LogoSlide
  | FormulaSlide
  | JobsGridSlide
  | SkillsCodeSlide
  | ImageGridSlide
  | FlowchartSlide
  | BenefitsSlide
  | TimelineSlide
  | BioSlide
  | VerticalWordSlide;
