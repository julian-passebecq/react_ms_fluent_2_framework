import type { RefObject } from 'react';
import { Button } from '@fluentui/react-components';
import { ArrowDownload20Regular } from '@fluentui/react-icons';

export function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.querySelectorAll('[data-runtime-only]').forEach((node) => node.remove());
  return new XMLSerializer().serializeToString(clone);
}

export function SvgExportButton({ hostRef, filename, label = 'Export SVG' }: {
  hostRef: RefObject<HTMLElement | null>;
  filename: string;
  label?: string;
}) {
  const exportSvg = () => {
    const svg = hostRef.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <Button size="small" appearance="subtle" icon={<ArrowDownload20Regular />} onClick={exportSvg}>{label}</Button>;
}
