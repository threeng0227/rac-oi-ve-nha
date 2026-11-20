import { LEVEL_TEXT } from '../i18n/vi';
import { getLevelPalette, type LevelPalette } from '../render/palette';
import type { TrashId } from './trashTypes';

export type BackdropId = keyof typeof LEVEL_TEXT;

export type EventId =
  | 'NEM_RAC'
  | 'MUA_BAO'
  | 'CUU_SINH_VAT'
  | 'GIO_MUA'
  | 'BAC_VE_CHAI'
  | 'PIN_ROI'
  | 'GIO_CAO_DIEM'
  | 'BAI_RAC_TU_PHAT';

export interface TrashPoolEntry {
  readonly typeId: TrashId;
  readonly weight: number;
  readonly variantId?: string;
}

export interface LevelDef {
  readonly id: BackdropId;
  readonly order: number;
  readonly name: string;
  readonly subtitle: string;
  readonly durationSec: number;
  readonly initialTrashCount: number;
  readonly spawnRatePerSec: number;
  readonly trashPool: readonly TrashPoolEntry[];
  readonly events: readonly { readonly eventId: EventId; readonly atSec: number }[];
  readonly palette: LevelPalette;
  readonly backdrop: BackdropId;
  readonly factOnComplete: string;
}

export const LEVELS: readonly LevelDef[] = [
  {
    id: 'ha-noi', order: 1, ...LEVEL_TEXT['ha-noi'],
    durationSec: 90, initialTrashCount: 4, spawnRatePerSec: 0.25,
    trashPool: [
      { typeId: 'coc-nhua', variantId: 'coc-tra-da', weight: 30 },
      { typeId: 'giay-bao', weight: 20 },
      { typeId: 'vo-chuoi', weight: 20 },
      { typeId: 'tui-nilon', weight: 15 },
      { typeId: 'lon-nhom', weight: 5 },
      { typeId: 'chai-nhua-pet', weight: 5 },
      { typeId: 'tan-thuoc-la', weight: 3 },
      { typeId: 'vo-trai-cay', weight: 2 },
    ],
    events: [{ eventId: 'NEM_RAC', atSec: 55 }],
    palette: getLevelPalette('ha-noi'), backdrop: 'ha-noi', factOnComplete: 'ha-noi-cleanup',
  },
  {
    id: 'ha-long', order: 2, ...LEVEL_TEXT['ha-long'],
    durationSec: 75, initialTrashCount: 6, spawnRatePerSec: 0.35,
    trashPool: [
      { typeId: 'chai-nhua-pet', weight: 30 },
      { typeId: 'hop-xop', weight: 20 },
      { typeId: 'tui-nilon', weight: 20 },
      { typeId: 'luoi-danh-ca', weight: 12 },
      { typeId: 'chai-thuy-tinh', weight: 10 },
      { typeId: 'ong-hut-nhua', weight: 8 },
    ],
    events: [{ eventId: 'MUA_BAO', atSec: 20 }, { eventId: 'CUU_SINH_VAT', atSec: 50 }],
    palette: getLevelPalette('ha-long'), backdrop: 'ha-long', factOnComplete: 'ha-long-cleanup',
  },
  {
    id: 'hoi-an', order: 3, ...LEVEL_TEXT['hoi-an'],
    durationSec: 75, initialTrashCount: 6, spawnRatePerSec: 0.40,
    trashPool: [
      { typeId: 'tui-nilon', weight: 25 },
      { typeId: 'coc-nhua', weight: 20 },
      { typeId: 'ong-hut-nhua', weight: 20 },
      { typeId: 'giay-bao', variantId: 'hoa-dang', weight: 15 },
      { typeId: 'vo-trai-cay', weight: 12 },
      { typeId: 'chai-nhua-pet', weight: 8 },
    ],
    events: [{ eventId: 'GIO_MUA', atSec: 35 }],
    palette: getLevelPalette('hoi-an'), backdrop: 'hoi-an', factOnComplete: 'hoi-an-cleanup',
  },
  {
    id: 'da-lat', order: 4, ...LEVEL_TEXT['da-lat'],
    durationSec: 75, initialTrashCount: 8, spawnRatePerSec: 0.45,
    trashPool: [
      { typeId: 'coc-nhua', weight: 25 },
      { typeId: 'lon-nhom', weight: 20 },
      { typeId: 'vo-trai-cay', variantId: 'vo-bap', weight: 20 },
      { typeId: 'khau-trang-y-te', weight: 15 },
      { typeId: 'chai-nhua-pet', weight: 12 },
      { typeId: 'giay-bao', weight: 8 },
    ],
    events: [{ eventId: 'BAC_VE_CHAI', atSec: 30 }],
    palette: getLevelPalette('da-lat'), backdrop: 'da-lat', factOnComplete: 'da-lat-cleanup',
  },
  {
    id: 'concert', order: 5, ...LEVEL_TEXT.concert,
    durationSec: 60, initialTrashCount: 6, spawnRatePerSec: 0.40,
    trashPool: [
      { typeId: 'coc-nhua', weight: 35 },
      { typeId: 'ao-mua-giay', weight: 20 },
      { typeId: 'chai-nhua-pet', weight: 18 },
      { typeId: 'giay-bao', variantId: 'bang-ron', weight: 12 },
      { typeId: 'lon-nhom', weight: 10 },
      { typeId: 'lightstick', weight: 5 },
    ],
    events: [{ eventId: 'PIN_ROI', atSec: 18 }, { eventId: 'GIO_CAO_DIEM', atSec: 40 }],
    palette: getLevelPalette('concert'), backdrop: 'concert', factOnComplete: 'concert-cleanup',
  },
  {
    id: 'nhieu-loc', order: 6, ...LEVEL_TEXT['nhieu-loc'],
    durationSec: 75, initialTrashCount: 8, spawnRatePerSec: 0.45,
    trashPool: [
      { typeId: 'hop-xop', weight: 28 },
      { typeId: 'tui-nilon', weight: 25 },
      { typeId: 'chai-nhua-pet', weight: 18 },
      { typeId: 'coc-nhua', weight: 15 },
      { typeId: 'ao-mua-giay', weight: 8 },
      { typeId: 'bia-carton', weight: 6 },
    ],
    events: [{ eventId: 'BAI_RAC_TU_PHAT', atSec: 30 }],
    palette: getLevelPalette('nhieu-loc'), backdrop: 'nhieu-loc', factOnComplete: 'nhieu-loc-cleanup',
  },
  {
    id: 'cai-rang', order: 7, ...LEVEL_TEXT['cai-rang'],
    durationSec: 75, initialTrashCount: 8, spawnRatePerSec: 0.50,
    trashPool: [
      { typeId: 'vo-trai-cay', weight: 30 },
      { typeId: 'la-chuoi', weight: 20 },
      { typeId: 'ba-mia', weight: 18 },
      { typeId: 'tui-nilon', weight: 15 },
      { typeId: 'thuc-an-thua', weight: 10 },
      { typeId: 'hop-xop', weight: 7 },
    ],
    events: [{ eventId: 'GIO_MUA', atSec: 40 }],
    palette: getLevelPalette('cai-rang'), backdrop: 'cai-rang', factOnComplete: 'cai-rang-cleanup',
  },
  {
    id: 'giao-thua', order: 8, ...LEVEL_TEXT['giao-thua'],
    durationSec: 75, initialTrashCount: 10, spawnRatePerSec: 0.45,
    trashPool: [
      { typeId: 'lon-nhom', weight: 25 },
      { typeId: 'que-xien-tre', weight: 20 },
      { typeId: 'vo-hat-dua', weight: 18 },
      { typeId: 'giay-bao', weight: 15 },
      { typeId: 'coc-nhua', weight: 10 },
      { typeId: 'bia-carton', weight: 7 },
      { typeId: 'bong-den', weight: 5 },
    ],
    events: [{ eventId: 'PIN_ROI', atSec: 20 }, { eventId: 'GIO_CAO_DIEM', atSec: 45 }],
    palette: getLevelPalette('giao-thua'), backdrop: 'giao-thua', factOnComplete: 'giao-thua-cleanup',
  },
  {
    id: 'sa-pa', order: 9, ...LEVEL_TEXT['sa-pa'],
    durationSec: 80, initialTrashCount: 8, spawnRatePerSec: 0.45,
    trashPool: [
      { typeId: 'chai-nhua-pet', weight: 28 },
      { typeId: 'tui-nilon', weight: 22 },
      { typeId: 'khau-trang-y-te', weight: 20 },
      { typeId: 'giay-bao', weight: 14 },
      { typeId: 'lon-nhom', weight: 11 },
      { typeId: 'pin-aa', weight: 5 },
    ],
    events: [{ eventId: 'MUA_BAO', atSec: 25 }, { eventId: 'PIN_ROI', atSec: 55 }],
    palette: getLevelPalette('sa-pa'), backdrop: 'sa-pa', factOnComplete: 'sa-pa-cleanup',
  },
  {
    id: 'con-dao', order: 10, ...LEVEL_TEXT['con-dao'],
    durationSec: 85, initialTrashCount: 10, spawnRatePerSec: 0.48,
    trashPool: [
      { typeId: 'tui-nilon', weight: 25 },
      { typeId: 'ong-hut-nhua', weight: 20 },
      { typeId: 'chai-nhua-pet', weight: 18 },
      { typeId: 'luoi-danh-ca', weight: 15 },
      { typeId: 'hop-xop', weight: 12 },
      { typeId: 'chai-thuy-tinh', weight: 6 },
      { typeId: 'pin-aa', weight: 4 },
    ],
    events: [{ eventId: 'CUU_SINH_VAT', atSec: 25 }, { eventId: 'BAI_RAC_TU_PHAT', atSec: 55 }],
    palette: getLevelPalette('con-dao'), backdrop: 'con-dao', factOnComplete: 'con-dao-cleanup',
  },
];
