export type CurrentPosition = {
  title: string;
  company: string;
  bullets: string[];
};

export type LiveProfile = {
  role: string;
  focusBlurb: string;
  openToWork: boolean;
  currentPosition: CurrentPosition | null;
};
