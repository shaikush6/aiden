'use client';

import type { ReactNode } from 'react';
import { parseScene, type SceneNode } from '@/lib/reading-quest/scene';

/**
 * Draws a picture scene so relationships are visible: things IN a container sit inside it,
 * things ON something sit on top, things UNDER peek out from below, and counts show real objects.
 */
export default function Scene({ scene, size = 3.2 }: { scene: string; size?: number }) {
  let nodes: SceneNode[];
  try { nodes = parseScene(scene); } catch { nodes = [{ kind: 'item', emoji: scene, count: 1 }]; }
  return (
    <div className="flex items-end justify-center gap-2 select-none" aria-hidden>
      {nodes.map((n, i) => <Node key={i} node={n} rem={size} />)}
    </div>
  );
}

function Glyph({ emoji, rem }: { emoji: string; rem: number }) {
  return <span className="leading-none whitespace-nowrap" style={{ fontSize: `${rem}rem` }}>{emoji}</span>;
}

function Node({ node, rem }: { node: SceneNode; rem: number }): ReactNode {
  if (node.kind === 'item') {
    if (node.count === 1) return <Glyph emoji={node.emoji} rem={rem} />;
    // Show every object so the child can count them.
    const cols = Math.min(node.count, node.count > 6 ? 5 : 3);
    const small = Math.max(0.9, rem * (node.count > 6 ? 0.34 : 0.45));
    return (
      <div className="grid gap-0.5 justify-items-center" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
        {Array.from({ length: node.count }, (_, i) => <Glyph key={i} emoji={node.emoji} rem={small} />)}
      </div>
    );
  }
  if (node.kind === 'group') {
    return (
      <div className="flex items-end gap-1">
        {node.items.map((n, i) => <Node key={i} node={n} rem={rem * 0.75} />)}
      </div>
    );
  }
  const { rel, a, b } = node;
  if (rel === 'in') {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Node node={b} rem={rem * 1.2} />
        <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 z-10 drop-shadow-md">
          <Node node={a} rem={rem * 0.68} />
        </div>
      </div>
    );
  }
  if (rel === 'on') {
    return (
      <div className="flex flex-col items-center">
        <div className="relative z-10" style={{ marginBottom: `-${rem * 0.28}rem` }}>
          <Node node={a} rem={rem * 0.62} />
        </div>
        <Node node={b} rem={rem * 1.1} />
      </div>
    );
  }
  if (rel === 'under') {
    return (
      <div className="flex flex-col items-center">
        <div className="relative z-10"><Node node={b} rem={rem} /></div>
        <div style={{ marginTop: `-${rem * 0.08}rem` }}><Node node={a} rem={rem * 0.72} /></div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-1">
      <Node node={a} rem={rem * 0.75} />
      <Node node={b} rem={rem} />
    </div>
  );
}
