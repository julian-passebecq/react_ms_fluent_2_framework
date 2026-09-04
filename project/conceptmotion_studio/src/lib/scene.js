/**
 * Canonical authoring shape keeps renderer-specific payload under `data`.
 * Bundled legacy scenes are still flat for now; normalizeScene keeps both forms working.
 * New version 1 authoring must use nested data.
 */
export function normalizeScene(scene) {
  if (!scene || typeof scene !== 'object') throw new Error('Scene must be an object.');
  return scene.data && typeof scene.data === 'object' && !Array.isArray(scene.data)
    ? { ...scene, ...scene.data }
    : scene;
}

export function validateSceneShape(scene) {
  if (!scene || typeof scene !== 'object') throw new Error('Scene must be an object.');
  const normalized = normalizeScene(scene);
  const errors = [];
  if (!normalized.id) errors.push('id');
  if (!normalized.title) errors.push('title');
  if (!normalized.renderer) errors.push('renderer');
  if (!Array.isArray(normalized.code)) errors.push('code[]');
  if (!Array.isArray(normalized.frames) || normalized.frames.length === 0) errors.push('frames[]');
  if (String(scene.version || '') === '1' && (!scene.data || typeof scene.data !== 'object' || Array.isArray(scene.data))) errors.push('data{} for v1');
  if (errors.length) throw new Error(`Invalid scene; missing/invalid: ${errors.join(', ')}`);

  normalized.frames.forEach((frame, index) => {
    if (!frame || typeof frame !== 'object') throw new Error(`Invalid scene frame ${index}: frame must be an object.`);
    if (!frame.caption?.trim()) throw new Error(`Invalid scene frame ${index}: caption is required.`);
    if (!frame.operation?.trim()) throw new Error(`Invalid scene frame ${index}: operation is required.`);
    if (frame.codeFocus != null && !Array.isArray(frame.codeFocus)) throw new Error(`Invalid scene frame ${index}: codeFocus must be an array.`);
    for (const line of frame.codeFocus || []) {
      if (!Number.isInteger(line) || line < 0 || line >= normalized.code.length) {
        throw new Error(`Invalid scene frame ${index}: codeFocus index ${line} is outside code[].`);
      }
    }
  });

  return normalized;
}
