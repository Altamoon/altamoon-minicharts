import * as bootstrap from 'bootstrap';

export default function tooltipRef(
  options?: Partial<bootstrap.Tooltip.Options>,
): ((element: null | HTMLElement) => void) {
  return (element: null | HTMLElement): void => {
    if (element && !bootstrap.Tooltip.getInstance(element)) {
      // eslint-disable-next-line no-new
      new bootstrap.Tooltip(element, { html: true, ...options });
    }
  };
}
