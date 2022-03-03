import { useCallback, useEffect, useState } from 'react';

export default function useBoundingClientRect(): [DOMRect | null, (node: HTMLElement) => void] {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [node, setNode] = useState<HTMLElement | null>();

  const ref = useCallback((el: HTMLElement) => {
    setNode(el);
    setRect(el !== null ? el.getBoundingClientRect() : null);
  }, []);

  useEffect(() => {
    if (node) {
      const observer = new ResizeObserver(() => {
        setRect(node.getBoundingClientRect());
      });

      observer.observe(node);

      return () => observer.unobserve(node);
    }

    return undefined;
  }, [node]);

  return [rect, ref];
}
