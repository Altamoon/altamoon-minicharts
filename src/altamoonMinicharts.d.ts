interface Options {
  settingsContainer?: HTMLElement;
  alertLogContainer?: HTMLElement;
  onSymbolSelect?: (symbol: string) => void;
}
export default function altamoonMinicharts(
  givenElement: string | HTMLElement | HTMLElement[],
  { onSymbolSelect, settingsContainer, alertLogContainer }?: Options
): void;
