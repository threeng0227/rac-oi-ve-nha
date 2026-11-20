import { DECOMPOSE_TEXT, TRASH_TEXT, VARIANT_TEXT, vi } from '../i18n/vi.ts';

export type TrashId = keyof typeof TRASH_TEXT;
export type SpriteId = TrashId | keyof typeof VARIANT_TEXT;
export type BinId = 'recycle' | 'food' | 'other' | 'hazard';

export interface TrashType {
  id: TrashId;
  name: string;
  bin: BinId;
  decomposeLabel: string;
  harm: string;
  tip: string;
  source: { label: string; url: string };
  verified: boolean;
  sprite: SpriteId;
  size: 'small' | 'medium' | 'large';
  variants?: { id: string; label: string; sprite: SpriteId }[];
}

const NOAA = {
  label: 'NOAA Marine Debris Program',
  url: 'https://marinedebris.noaa.gov/sites/default/files/publications-files/Gen_Poster_Decomp.pdf',
};
const EPA_BATTERIES = {
  label: 'US EPA — Used Household Batteries',
  url: 'https://www.epa.gov/recycle/used-household-batteries',
};
const CPSC = {
  label: 'US CPSC — Button Cell and Coin Batteries',
  url: 'https://www.cpsc.gov/Safety-Education/Safety-Education-Centers/Button-Cell-or-Coin-Battery-Information-Center',
};
const EPA_LAMPS = {
  label: 'US EPA — Compact Fluorescent Light Bulbs',
  url: 'https://www.epa.gov/mercury/recycling-and-disposal-cfls-and-other-bulbs-contain-mercury',
};
const PENDING = { label: '', url: '' };

function trash(
  id: TrashId,
  bin: BinId,
  decomposeLabel: string,
  verified: boolean,
  size: TrashType['size'] = 'medium',
  source = verified ? NOAA : PENDING,
): TrashType {
  return { id, ...TRASH_TEXT[id], bin, decomposeLabel, verified, size, source, sprite: id };
}

function variant(id: keyof typeof VARIANT_TEXT): { id: string; label: string; sprite: SpriteId } {
  return { id, label: VARIANT_TEXT[id], sprite: id };
}

export const TRASH_TYPES: readonly TrashType[] = [
  trash('chai-nhua-pet', 'recycle', DECOMPOSE_TEXT['chai-nhua-pet'], true),
  trash('lon-nhom', 'recycle', DECOMPOSE_TEXT['lon-nhom'], true),
  trash('chai-thuy-tinh', 'recycle', DECOMPOSE_TEXT['chai-thuy-tinh'], true),
  { ...trash('giay-bao', 'recycle', DECOMPOSE_TEXT['giay-bao'], true), variants: [variant('hoa-dang'), variant('bang-ron')] },
  trash('bia-carton', 'recycle', DECOMPOSE_TEXT['bia-carton'], false, 'large'),
  trash('vo-chuoi', 'food', DECOMPOSE_TEXT['vo-chuoi'], true),
  { ...trash('vo-trai-cay', 'food', DECOMPOSE_TEXT['vo-trai-cay'], true), variants: [variant('vo-bap')] },
  trash('thuc-an-thua', 'food', DECOMPOSE_TEXT['thuc-an-thua'], true),
  trash('la-chuoi', 'food', DECOMPOSE_TEXT['la-chuoi'], false, 'large'),
  trash('ba-mia', 'food', DECOMPOSE_TEXT['ba-mia'], false),
  trash('vo-hat-dua', 'food', DECOMPOSE_TEXT['vo-hat-dua'], false, 'small'),
  trash('tui-nilon', 'other', DECOMPOSE_TEXT['tui-nilon'], true, 'large'),
  trash('hop-xop', 'other', DECOMPOSE_TEXT['hop-xop'], true, 'large'),
  { ...trash('coc-nhua', 'other', DECOMPOSE_TEXT['coc-nhua'], true), variants: [variant('coc-tra-da'), variant('coc-tra-sua'), variant('coc-bia')] },
  trash('tan-thuoc-la', 'other', DECOMPOSE_TEXT['tan-thuoc-la'], true, 'small'),
  trash('ta-bim', 'other', DECOMPOSE_TEXT['ta-bim'], true),
  trash('luoi-danh-ca', 'other', DECOMPOSE_TEXT['luoi-danh-ca'], true, 'large'),
  trash('ong-hut-nhua', 'other', DECOMPOSE_TEXT['ong-hut-nhua'], false, 'small'),
  trash('khau-trang-y-te', 'other', DECOMPOSE_TEXT['khau-trang-y-te'], false),
  trash('que-xien-tre', 'other', DECOMPOSE_TEXT['que-xien-tre'], false, 'small'),
  trash('ao-mua-giay', 'other', DECOMPOSE_TEXT['ao-mua-giay'], false, 'large'),
  trash('pin-aa', 'hazard', DECOMPOSE_TEXT['pin-aa'], true, 'small', EPA_BATTERIES),
  trash('lightstick', 'hazard', DECOMPOSE_TEXT['lightstick'], true, 'medium', CPSC),
  trash('bong-den', 'hazard', DECOMPOSE_TEXT['bong-den'], true, 'large', EPA_LAMPS),
];

/** Dùng chung cho mọi nơi hiển thị thời gian phân hủy. */
export function getDecomposeLabel(type: TrashType): string {
  return type.verified ? type.decomposeLabel : vi.verifyingSource;
}
