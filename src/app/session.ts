import { create } from "zustand";
import { tonight } from "@/data/questions";
import type { AnswerMap } from "@/data/types";

const STORAGE_KEY = "thin-path.ledger.v1";

type LedgerState = {
  id: string | null;
  answers: AnswerMap;
  narration: string | null;
  narrationFor: string | null;
  hydrated: boolean;
  hydrate: () => void;
  start: () => string;
  choose: (questionId: string, optionId: string) => void;
  setNarration: (signature: string, text: string) => void;
  reset: () => void;
};

type Snapshot = {
  id: string | null;
  answers: AnswerMap;
  narration: string | null;
  narrationFor: string | null;
};

const empty: Snapshot = {
  id: null,
  answers: {},
  narration: null,
  narrationFor: null,
};

function readSnapshot(): Snapshot {
  if (typeof window === "undefined") return empty;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Snapshot>;
    return {
      id: parsed.id ?? null,
      answers: parsed.answers ?? {},
      narration: parsed.narration ?? null,
      narrationFor: parsed.narrationFor ?? null,
    };
  } catch {
    return empty;
  }
}

function writeSnapshot(snap: Snapshot) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    /* private mode / IAB quota — memory still holds it */
  }
}

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

export const pack = tonight;

export const useLedger = create<LedgerState>((set, get) => ({
  ...empty,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const snap = readSnapshot();
    set({ ...snap, hydrated: true });
  },
  start: () => {
    const id = newId();
    const next: Snapshot = {
      id,
      answers: {},
      narration: null,
      narrationFor: null,
    };
    writeSnapshot(next);
    set({ ...next, hydrated: true });
    return id;
  },
  choose: (questionId, optionId) => {
    if (!get().id) return;
    if (get().answers[questionId] === optionId) return;
    const questionIndex = pack.questions.findIndex((q) => q.id === questionId);
    const answers: AnswerMap = { ...get().answers, [questionId]: optionId };
    if (questionIndex >= 0) {
      for (let i = questionIndex + 1; i < pack.questions.length; i++) {
        const later = pack.questions[i];
        if (later) delete answers[later.id];
      }
    }
    const next: Snapshot = {
      id: get().id,
      answers,
      narration: null,
      narrationFor: null,
    };
    writeSnapshot(next);
    set(next);
  },
  setNarration: (signature, text) => {
    const next: Snapshot = {
      id: get().id,
      answers: get().answers,
      narration: text,
      narrationFor: signature,
    };
    writeSnapshot(next);
    set({ narration: text, narrationFor: signature });
  },
  reset: () => {
    writeSnapshot(empty);
    set({ ...empty, hydrated: true });
  },
}));
