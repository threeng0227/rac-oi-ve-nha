import { TRASH_TYPES, getDecomposeLabel, type TrashType } from '../src/data/trashTypes.ts';

/** Chỉ kiểm hai điều kiện của Mục 8.3, kể cả với loại không có thời gian phân hủy. */
export function verifyFacts(
  types: readonly TrashType[],
  displayLabel: (type: TrashType) => string = getDecomposeLabel,
): string[] {
  const errors: string[] = [];
  for (const type of types) {
    if (!type.verified) {
      if (type.decomposeLabel.trim() !== '' && displayLabel(type).includes(type.decomposeLabel)) {
        errors.push(`${type.id}: unverified decomposition label is visible`);
      }
      continue;
    }
    try {
      new URL(type.source.url);
    } catch {
      errors.push(`${type.id}: verified source must have a valid URL`);
    }
  }
  return errors;
}

const errors = verifyFacts(TRASH_TYPES);
if (errors.length > 0) throw new Error(errors.join('\n'));
