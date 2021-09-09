interface Options {
  onSymbolSelect?: (symbol: string) => void;
}
export default function minichartGrid(
  givenElement: string | HTMLElement | HTMLElement[], { onSymbolSelect }?: Options
): void;
