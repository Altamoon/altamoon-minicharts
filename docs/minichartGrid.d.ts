interface Options {
  settingsContainer?: HTMLElement;
  onSymbolSelect?: (symbol: string) => void;
}
export default function minichartGrid(
  givenElement: string | HTMLElement | HTMLElement[],
  { onSymbolSelect, settingsContainer }?: Options
): void;
