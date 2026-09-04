import React, { useEffect, useRef, useState } from 'react';
import { renderScene } from '../renderers/index.js';

export default function D3Scene({ scene, frame, duration = 520 }) {
  const ref = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ref.current || !scene || !frame) return undefined;
    try {
      setError('');
      renderScene(ref.current, scene, frame, { duration });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    return undefined;
  }, [scene, frame, duration]);

  if (error) {
    return <div className="viz-error" role="alert"><b>Visualization renderer failed.</b><span>{error}</span></div>;
  }
  return <svg ref={ref} className="d3-stage" focusable="false" />;
}
