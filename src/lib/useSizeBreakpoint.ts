import useBoundingClientRect from './useBoundingClientRect';

type SizeBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const breakpoins: Record<SizeBreakpoint, number> = {
  xs: 0,
  sm: 300,
  md: 500,
  lg: 700,
  xl: 1000,
};

// Example:
// const [isWideLayout, wideLayoutRef] = useWidgetSizeBreakpoint('lg');
export default function useSizeBreakpoint(
  breakpoint: SizeBreakpoint,
): [boolean, (node: HTMLElement) => void] {
  const [rect, ref] = useBoundingClientRect();

  if (!rect) return [false, ref];

  return [breakpoins[breakpoint] < rect.width, ref];
}
