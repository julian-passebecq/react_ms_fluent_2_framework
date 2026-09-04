import { scenes } from '../src/data/scenes.js';
const allowed = new Set(['join','window','rank','btree','plan','partition','broadcast','pipeline','dax','star','interval','idempotency','watermark','dag','storage','delta','binary','array','sampling','scatter','sigmoid','decisionTree','forest','kmeans','pca','matrix','layers','git']);
for (const [id, scene] of Object.entries(scenes)) {
  if (!allowed.has(scene.renderer)) throw new Error(`${id}: unknown renderer ${scene.renderer}`);
  if (!Array.isArray(scene.frames) || !scene.frames.length) throw new Error(`${id}: frames missing`);
  if (!Array.isArray(scene.code)) throw new Error(`${id}: code missing`);
  for (const frame of scene.frames) {
    for (const line of frame.codeFocus || []) if (line < 0 || line >= scene.code.length) throw new Error(`${id}: codeFocus ${line} out of range`);
  }
}
if (Object.keys(scenes).length < 25) throw new Error('Not enough interactive scenes');
console.log(`scene smoke: ${Object.keys(scenes).length} scenes`);
