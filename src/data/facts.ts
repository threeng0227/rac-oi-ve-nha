import { FACT_TEXT } from '../i18n/vi';

export interface Fact {
  readonly id: string;
  readonly text: string;
  readonly source: { readonly label: string; readonly url: string };
  readonly verified: boolean;
}

// Qualitative advice, pending primary-source review. No numerical claims.
export const FACTS: readonly Fact[] = Object.entries(FACT_TEXT).map(([levelId, text]) => ({
  id: `${levelId}-cleanup`,
  text,
  source: { label: '', url: '' },
  verified: false,
}));
