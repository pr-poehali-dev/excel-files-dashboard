import { FileData, MergeOptions } from "@/types/excel";

/**
 * Объединяет данные из выбранных файлов согласно указанным настройкам
 * 
 * @param selectedFiles Массив выбранных файлов для объединения
 * @param mergeOptions Настройки объединения
 * @returns Объединенный набор данных или null в случае ошибки
 */
export const mergeExcelFiles = (
  selectedFiles: FileData[],
  mergeOptions: MergeOptions
): any[] | null => {
  if (selectedFiles.length < 2) {
    return null;
  }

  // Вертикальное объединение (строки одна под другой)
  if (mergeOptions.mergeType === "vertical") {
    return selectedFiles.flatMap(file => file.data);
  }
  
  // Горизонтальное объединение (по ключевому столбцу)
  if (!mergeOptions.keyColumn) {
    return null;
  }
  
  // Создаем объединенные данные на основе ключевого столбца
  const mergedMap = new Map();
  
  selectedFiles.forEach(file => {
    file.data.forEach(row => {
      const keyValue = row[mergeOptions.keyColumn!];
      if (!keyValue && mergeOptions.ignoreEmptyCells) return;
      
      if (!mergedMap.has(keyValue)) {
        mergedMap.set(keyValue, {});
      }
      
      const mergedRow = mergedMap.get(keyValue);
      
      // Добавляем все поля из текущей строки
      Object.entries(row).forEach(([key, value]) => {
        // Если поле уже существует с другим значением, добавляем префикс файла
        if (key in mergedRow && mergedRow[key] !== value && key !== mergeOptions.keyColumn) {
          mergedRow[`${key} (${file.name})`] = value;
        } else {
          mergedRow[key] = value;
        }
      });
    });
  });
  
  return Array.from(mergedMap.values());
};

/**
 * Функция для преобразования и сохранения данных в Excel-файл
 * 
 * @param data Данные для сохранения
 * @param fileName Имя файла (по умолчанию 'merged_data.xlsx')
 */
export const downloadAsExcel = (data: any[], fileName: string = 'merged_data.xlsx'): void => {
  // В реальной реализации здесь была бы логика сохранения Excel-файла
  // с использованием библиотеки для работы с Excel, например, exceljs или xlsx
  
  console.log('Данные для сохранения:', data);
  console.log(`Файл будет сохранен как ${fileName}`);
};

/**
 * Получение списка всех доступных колонок из массива файлов
 * 
 * @param files Массив файлов
 * @returns Массив уникальных имен колонок
 */
export const extractAvailableColumns = (files: FileData[]): string[] => {
  if (files.length === 0) return [];
  
  const allColumns = new Set<string>();
  files.forEach(file => {
    file.columns.forEach(column => allColumns.add(column));
  });
  
  return Array.from(allColumns);
};

/**
 * Имитация чтения данных из Excel-файла
 * В реальной реализации здесь была бы логика чтения Excel-файла
 * 
 * @param file Файл для чтения
 * @returns Объект с данными и метаданными файла
 */
export const readExcelFile = async (file: File): Promise<Omit<FileData, 'id' | 'selected'>> => {
  // Имитация асинхронного чтения файла
  return new Promise((resolve) => {
    setTimeout(() => {
      // Генерируем случайные тестовые данные
      const mockData = [
        { "Имя": "Иванов Иван", "Возраст": 30, "Город": "Москва", "Отдел": "Продажи" },
        { "Имя": "Петров Петр", "Возраст": 25, "Город": "Санкт-Петербург", "Отдел": "Маркетинг" }
      ];
      
      // Добавляем дополнительную строку для разнообразия
      if (file.name.includes("2")) {
        mockData.push({ "Имя": "Сидоров Сидор", "Возраст": 35, "Город": "Казань", "Отдел": "HR" });
      }
      
      resolve({
        name: file.name,
        data: mockData,
        columns: Object.keys(mockData[0])
      });
    }, 100);
  });
};
