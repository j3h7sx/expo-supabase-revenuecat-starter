export type OnboardingAnswer = string | string[] | boolean | null;

export type OnboardingStep =
  | {
      body: string;
      cta: string;
      id: string;
      title: string;
      type: "intro";
    }
  | {
      body: string;
      id: string;
      options: Array<{ label: string; value: string }>;
      title: string;
      type: "single_choice";
    }
  | {
      body: string;
      id: string;
      options: Array<{ label: string; value: string }>;
      title: string;
      type: "multi_choice";
    }
  | {
      body: string;
      cta: string;
      id: string;
      placement: string;
      title: string;
      type: "paywall";
    }
  | {
      body: string;
      cta: string;
      id: string;
      title: string;
      type: "complete";
    };
