import { PLEDGE_TEXT } from '../i18n/vi';

export interface Pledge {
  readonly id: string;
  readonly text: string;
}

export const PLEDGES: readonly Pledge[] = Object.entries(PLEDGE_TEXT).map(([id, text]) => ({ id, text }));
