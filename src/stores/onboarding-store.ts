import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { appStorage } from "@/src/data/storage/mmkv";
import type { OnboardingAnswer } from "@/src/onboarding/types";

type OnboardingState = {
  answers: Record<string, OnboardingAnswer>;
  currentStepId: string | null;
  reset: () => void;
  setAnswer: (stepId: string, answer: OnboardingAnswer) => void;
  setCurrentStep: (stepId: string) => void;
};

const storage = {
  getItem: (name: string) => appStorage.getString(name) ?? null,
  removeItem: (name: string) => {
    appStorage.remove(name);
  },
  setItem: (name: string, value: string) => {
    appStorage.set(name, value);
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      answers: {},
      currentStepId: null,
      reset: () => set({ answers: {}, currentStepId: null }),
      setAnswer: (stepId, answer) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [stepId]: answer,
          },
        })),
      setCurrentStep: (currentStepId) => set({ currentStepId }),
    }),
    {
      name: "onboarding-store",
      storage: createJSONStorage(() => storage),
    }
  )
);
