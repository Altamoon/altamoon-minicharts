import {
  useEffect, useMemo, useState, MutableRefObject,
} from 'react';

// TODO check if it's actually use once the bug is resolved
// https://trello.com/c/yAkkjXxy/143-minicharts-lazy-render-bug
export default function useOnScreen(ref: MutableRefObject<Element | null>): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(() => new IntersectionObserver(
    ([entry]) => { setIntersecting(entry.isIntersecting); },
  ), []);

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);
      // Remove the observer as soon as the component is unmounted
      return () => { observer.disconnect(); };
    }

    return undefined;
  }, [observer, ref]);

  return isIntersecting;
}
