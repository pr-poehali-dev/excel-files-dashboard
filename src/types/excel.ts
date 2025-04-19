/**
 * Тип данных для представления загруженного Excel файла
 */
export interface FileData {
  id: string;
  name: string;
  data: any[];
  columns: string[];
  selected: boolean;
}

/**
 * Настройки для объединения Excel файлов
 */
export interface MergeOptions {
  mergeType: "vertical" | "horizontal";
  ignoreEmptyCells: boolean;
  keyColumn: string | null;
}

/**
 * Настройки для сведения Excel файлов
 */
export interface ConsolidationSettings {
  consolidationType: "append" | "summary" | "pivot";
  preserveHeaders: boolean;
  skipEmptyRows: boolean;
  aggregationFunction: string;
}
