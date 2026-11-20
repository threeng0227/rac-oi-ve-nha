import { describe, expect, test } from 'vitest';
import { TRASH_TYPES, type TrashId } from '../../src/data/trashTypes';
import { ScoreSystem } from '../../src/gameplay/ScoreSystem';
import { TrashItem } from '../../src/gameplay/TrashItem';

function item(id: number, typeId: TrashId = 'chai-nhua-pet'): TrashItem {
  return new TrashItem(id, TRASH_TYPES.find(type => type.id === typeId)!, 0, 0);
}

function correct(system: ScoreSystem, id: number): TrashItem {
  const trash = item(id);
  system.registerSpawn(trash, 0);
  system.pick(trash);
  system.sort(trash, true);
  return trash;
}

function resultFor(correctCount: number, total = 100): ReturnType<ScoreSystem['finish']> {
  const system = new ScoreSystem(90);
  for (let index = 0; index < total; index++) {
    const trash = item(index);
    system.registerSpawn(trash, 0);
    if (index < correctCount) {
      system.pick(trash);
      system.sort(trash, true);
    }
  }
  return system.finish([]);
}

describe('ScoreSystem', () => {
  test('chạm nhặt cộng năm điểm đúng một lần, kể cả khi đăng ký bị lặp', () => {
    const system = new ScoreSystem(90);
    const trash = item(1);
    system.registerSpawn(trash, 0);
    system.registerSpawn(trash, 1);
    system.pick(trash);
    system.pick(trash);
    expect(system.score).toBe(5);
    expect(system.totalSpawned).toBe(1);
    expect(system.combo).toBe(0);
    expect(system.multiplier).toBe(1);
  });

  test('điểm combo dùng chuỗi trước lượt hiện tại, đúng mọi ngưỡng', () => {
    const system = new ScoreSystem(90);
    const increments: number[] = [];
    for (let id = 0; id < 21; id++) {
      const before = system.score;
      correct(system, id);
      increments.push(system.score - before - 5);
    }
    expect(increments).toEqual([
      ...Array<number>(5).fill(10),
      ...Array<number>(7).fill(20),
      ...Array<number>(8).fill(30),
      40,
    ]);
    expect(system.combo).toBe(21);
    expect(system.multiplier).toBe(4);
    expect(system.correctCount).toBe(21);
  });

  test('phân loại sai trừ điểm và reset combo, mỗi lần thử sai đều bị phạt', () => {
    const system = new ScoreSystem(90);
    for (let id = 0; id < 6; id++) correct(system, id);
    const trash = item(10);
    system.registerSpawn(trash, 0);
    system.pick(trash);
    const before = system.score;
    system.sort(trash, false);
    system.sort(trash, false);
    expect(system.score).toBe(before - 30);
    expect(system.combo).toBe(0);
    expect(system.multiplier).toBe(1);
    expect(system.pollution).toBe(16);
    expect(system.mistakes).toBe(2);
    system.sort(trash, true);
    expect(system.correctCount).toBe(7);
    expect(system.combo).toBe(1);
  });

  test('điểm không âm kể cả sau nhiều lần sai và phạt cuối màn', () => {
    const system = new ScoreSystem(90);
    const trash = item(0);
    system.registerSpawn(trash, 0);
    system.pick(trash);
    system.sort(trash, false);
    expect(system.score).toBe(0);
    const hazard = item(1, 'pin-aa');
    system.registerSpawn(hazard, 0);
    expect(system.finish([trash]).score).toBe(0);
  });

  test('rác nguy hại đúng cộng năm mươi, giữ combo và tách khỏi số đúng thường', () => {
    const system = new ScoreSystem(90);
    for (let id = 0; id < 5; id++) correct(system, id);
    const hazard = item(9, 'pin-aa');
    system.registerSpawn(hazard, 0);
    system.pick(hazard);
    const before = system.score;
    system.sort(hazard, true);
    expect(system.score).toBe(before + 50);
    expect(system.combo).toBe(5);
    expect(system.multiplier).toBe(2);
    expect(system.correctCount).toBe(5);
    expect(system.finish([]).cleanliness).toBe(1);
  });

  test('rác nguy hại sai trừ bốn mươi, cộng hai mươi ô nhiễm và chặn ba sao', () => {
    const system = new ScoreSystem(90);
    for (let id = 0; id < 10; id++) correct(system, id);
    const hazard = item(20, 'lightstick');
    system.registerSpawn(hazard, 0);
    system.pick(hazard);
    const before = system.score;
    system.sort(hazard, false);
    expect(system.score).toBe(before - 40);
    expect(system.pollution).toBe(20);
    expect(system.combo).toBe(0);
    expect(system.mistakes).toBe(1);
    expect(system.hazardMistakes).toBe(1);
    system.sort(hazard, true);
    expect(system.finish([]).stars).toBe(2);
  });

  test('ô nhiễm tích luỹ và phục hồi theo số món trên sàn, dải giữa giữ nguyên', () => {
    const system = new ScoreSystem(90);
    system.update(2.5, 8);
    expect(system.pollution).toBe(2.5);
    system.update(7, 7);
    system.update(7, 4);
    expect(system.pollution).toBe(2.5);
    system.update(0.5, 3);
    expect(system.pollution).toBe(1.5);
    system.update(10, 0);
    expect(system.pollution).toBe(0);
    system.update(-1, 8);
    expect(system.pollution).toBe(0);
  });

  test('chạm một trăm ô nhiễm thua ngay và không thể tự phục hồi sau đó', () => {
    const system = new ScoreSystem(90);
    correct(system, 0);
    system.addPollution(85);
    expect(system.failed).toBe(false);
    system.addPollution(15);
    expect(system.failed).toBe(true);
    expect(system.pollution).toBe(100);
    system.update(100, 0);
    system.addPollution(-100);
    expect(system.failed).toBe(true);
    expect(system.pollution).toBe(100);
    expect(system.finish([]).stars).toBe(0);
  });

  test('sự kiện có thể thêm điểm và ô nhiễm, hệ số thưởng không đổi combo', () => {
    const system = new ScoreSystem(90);
    const trash = item(1);
    system.registerSpawn(trash, 0);
    system.pick(trash, 1.5);
    expect(system.score).toBe(7.5);
    system.sort(trash, true, 2);
    expect(system.score).toBe(27.5);
    system.addBonus(100);
    system.addPollution(15);
    expect(system.score).toBe(127.5);
    expect(system.combo).toBe(1);
    expect(system.pollution).toBe(15);
  });

  test.each([[59, 0], [60, 1], [79, 1], [80, 2], [94, 2], [95, 3], [100, 3]])(
    'đúng %i phần trăm cho %i sao',
    (count, stars) => {
      const result = resultFor(count);
      expect(result.cleanliness).toBe(count / 100);
      expect(result.stars).toBe(stars);
    },
  );

  test('ba lần sai vẫn được ba sao, bốn lần chỉ được hai sao', () => {
    for (const mistakes of [3, 4]) {
      const system = new ScoreSystem(90);
      const trash = item(0);
      system.registerSpawn(trash, 0);
      system.pick(trash);
      for (let i = 0; i < mistakes; i++) system.sort(trash, false);
      system.sort(trash, true);
      expect(system.finish([]).stars).toBe(mistakes === 3 ? 3 : 2);
    }
  });

  test('mẫu số cộng thêm món còn trong túi, phạt riêng món thường trên sàn', () => {
    const system = new ScoreSystem(90);
    correct(system, 0);
    const inBag = item(1);
    const onGround = item(2);
    system.registerSpawn(inBag, 0);
    system.registerSpawn(onGround, 0);
    system.pick(inBag);
    const before = system.score;
    const result = system.finish([inBag]);
    expect(result.cleanliness).toBe(1 / 4);
    expect(result.score).toBe(before - 2);
    expect(result.remainingCount).toBe(2);
    expect(result.hazardRemainingCount).toBe(0);
  });

  test('loại trừ rác năm giây cuối, bị gió cuốn và nguy hại bằng tập hợp không trừ lặp', () => {
    const system = new ScoreSystem(90);
    correct(system, 0);
    const late = item(1);
    const blown = item(2);
    const hazard = item(3, 'pin-aa');
    const lateHazard = item(4, 'pin-aa');
    system.registerSpawn(late, 85);
    system.registerSpawn(blown, 10);
    system.registerSpawn(hazard, 10);
    system.registerSpawn(lateHazard, 86);
    system.removeByWind(blown);
    system.removeByWind(blown);
    system.removeByWind(lateHazard);
    expect(system.finish([]).cleanliness).toBe(1);
  });

  test('nguy hại sót sàn và trong túi trừ hai mươi mỗi món đúng một lần', () => {
    const system = new ScoreSystem(90);
    system.addBonus(100);
    const ground = item(0, 'pin-aa');
    const bag = item(1, 'lightstick');
    system.registerSpawn(ground, 0);
    system.registerSpawn(bag, 0);
    system.pick(bag);
    const result = system.finish([bag, bag]);
    expect(result.score).toBe(65);
    expect(result.hazardRemainingCount).toBe(2);
    expect(result.cleanliness).toBe(0);
    expect(result.remainingCount).toBe(2);
    expect(system.finish([])).toBe(result);
    expect(system.score).toBe(65);
  });

  test('gọi lặp sau khi hoàn thành không đổi điểm, combo hay kết quả', () => {
    const system = new ScoreSystem(90);
    const trash = correct(system, 1);
    system.pick(trash);
    system.sort(trash, true);
    expect(system.score).toBe(15);
    const result = system.finish([]);
    system.addBonus(100);
    system.addPollution(100);
    system.registerSpawn(item(2), 0);
    system.sort(trash, false);
    expect(system.finish([])).toBe(result);
    expect(system.score).toBe(15);
    expect(system.combo).toBe(1);
    expect(system.failed).toBe(false);
  });

  test('màn không có món hợp lệ và túi rỗng được xem là sạch hoàn toàn', () => {
    const system = new ScoreSystem(90);
    expect(system.finish([]).cleanliness).toBe(1);
    expect(system.finish([]).stars).toBe(3);
  });
});
