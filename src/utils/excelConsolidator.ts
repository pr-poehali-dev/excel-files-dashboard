import { FileData, ConsolidationSettings } from "@/types/excel";

/**
 * Консолидирует (сводит) данные из выбранных файлов согласно указанным настройкам
 * 
 * @param files Массив выбранных файлов для сведения
 * @param settings Настройки сведения
 * @returns Сведенный набор данных или null в случае ошибки
 */
export const consolidateExcelFiles = (
  files: FileData[],
  settings: ConsolidationSettings
): any[] | null => {
  if (files.length === 0) {
    return null;
  }

  switch (settings.consolidationType) {
    case "append":
      return appendConsolidation(files, settings);
    case "summary":
      return summaryConsolidation(files, settings);
    case "pivot":
      return pivotConsolidation(files, settings);
    default:
      return null;
  }
};

/**
 * Простое добавление данных из всех файлов в один список
 */
const appendConsolidation = (
  files: FileData[],
  settings: ConsolidationSettings
): any[] => {
  let result: any[] = [];
  
  for (const file of files) {
    // Фильтруем пустые строки, если это настроено
    const fileData = settings.skipEmptyRows 
      ? file.data.filter(row => Object.values(row).some(val => val !== null && val !== undefined && val !== ''))
      : file.data;
      
    // Добавляем информацию об источнике файла, если не сохраняем заголовки
    if (!settings.preserveHeaders) {
      fileData.forEach(row => {
        row["Файл-источник"] = file.name;
      });
    }
    
    result = result.concat(fileData);
  }
  
  return result;
};

/**
 * Создание сводной таблицы с суммированием/усреднением значений
 */
const summaryConsolidation = (
  files: FileData[],
  settings: ConsolidationSettings
): any[] => {
  // Собираем все возможные колонки из всех файлов
  const allColumns = new Set<string>();
  files.forEach(file => {
    file.columns.forEach(col => allColumns.add(col));
  });
  
  // Находим числовые и текстовые колонки для агрегации
  const numericColumns: string[] = [];
  const textColumns: string[] = [];
  
  // Предполагаем, что первый файл репрезентативен для определения типов колонок
  if (files.length > 0 && files[0].data.length > 0) {
    const sampleRow = files[0].data[0];
    
    for (const col of allColumns) {
      if (col in sampleRow) {
        if (typeof sampleRow[col] === 'number') {
          numericColumns.push(col);
        } else {
          textColumns.push(col);
        }
      }
    }
  }
  
  // Создаем сводную таблицу по текстовым колонкам
  const summary: Record<string, any> = {};
  
  files.forEach(file => {
    file.data.forEach(row => {
      // Пропускаем пустые строки, если настроено
      if (settings.skipEmptyRows && 
          Object.values(row).every(val => val === null || val === undefined || val === '')) {
        return;
      }
      
      // Создаем ключ группировки из текстовых колонок
      const groupKey = textColumns
        .map(col => row[col] || "Не указано")
        .join("_");
      
      if (!summary[groupKey]) {
        const summaryRow: Record<string, any> = {};
        
        // Копируем текстовые значения
        textColumns.forEach(col => {
          summaryRow[col] = row[col] || "Не указано";
        });
        
        // Инициализируем числовые значения
        numericColumns.forEach(col => {
          summaryRow[col] = 0;
          summaryRow[`_count_${col}`] = 0; // Для подсчета среднего
        });
        
        summary[groupKey] = summaryRow;
      }
      
      // Агрегируем числовые значения
      numericColumns.forEach(col => {
        if (row[col] !== null && row[col] !== undefined && !isNaN(Number(row[col]))) {
          const value = Number(row[col]);
          
          if (settings.aggregationFunction === "sum" || settings.aggregationFunction === "average") {
            summary[groupKey][col] += value;
            summary[groupKey][`_count_${col}`] += 1;
          } else if (settings.aggregationFunction === "max") {
            summary[groupKey][col] = Math.max(summary[groupKey][col], value);
          } else if (settings.aggregationFunction === "min") {
            if (summary[groupKey][`_count_${col}`] === 0) {
              summary[groupKey][col] = value;
            } else {
              summary[groupKey][col] = Math.min(summary[groupKey][col], value);
            }
            summary[groupKey][`_count_${col}`] += 1;
          }
        }
      });
    });
  });
  
  // Преобразуем результат в массив и финализируем вычисления
  const result = Object.values(summary);
  
  if (settings.aggregationFunction === "average") {
    result.forEach(row => {
      numericColumns.forEach(col => {
        if (row[`_count_${col}`] > 0) {
          row[col] = row[col] / row[`_count_${col}`];
        }
        delete row[`_count_${col}`];
      });
    });
  } else {
    // Удаляем служебные поля счетчиков
    result.forEach(row => {
      numericColumns.forEach(col => {
        delete row[`_count_${col}`];
      });
    });
  }
  
  return result;
};

/**
 * Создание сводной таблицы с данными по столбцам
 */
const pivotConsolidation = (
  files: FileData[],
  settings: ConsolidationSettings
): any[] => {
  // Упрощенная реализация сводной таблицы
  // В реальном проекте этот метод был бы более сложным и настраиваемым
  
  if (files.length === 0 || files[0].columns.length < 2) {
    return [];
  }
  
  // Для демонстрации берем первые две колонки как строки и столбцы сводной таблицы
  const rowField = files[0].columns[0];
  const colField = files[0].columns[1];
  let valueField = files[0].columns[2];
  
  // Если есть числовое поле, используем его для значений
  for (const col of files[0].columns) {
    if (files[0].data.length > 0 && typeof files[0].data[0][col] === 'number') {
      valueField = col;
      break;
    }
  }
  
  // Собираем уникальные значения для строк и столбцов
  const rowValues = new Set<string>();
  const colValues = new Set<string>();
  
  files.forEach(file => {
    file.data.forEach(row => {
      if (row[rowField]) rowValues.add(String(row[rowField]));
      if (row[colField]) colValues.add(String(row[colField]));
    });
  });
  
  // Создаем сводную таблицу
  const result: any[] = [];
  
  rowValues.forEach(rowVal => {
    const newRow: Record<string, any> = {
      [rowField]: rowVal
    };
    
    colValues.forEach(colVal => {
      newRow[colVal] = 0;
      let count = 0;
      
      files.forEach(file => {
        file.data.forEach(row => {
          if (String(row[rowField]) === rowVal && String(row[colField]) === colVal) {
            const value = Number(row[valueField]) || 0;
            
            if (settings.aggregationFunction === "sum" || settings.aggregationFunction === "average") {
              newRow[colVal] += value;
              count++;
            } else if (settings.aggregationFunction === "max") {
              newRow[colVal] = Math.max(newRow[colVal], value);
            } else if (settings.aggregationFunction === "min") {
              if (count === 0) {
                newRow[colVal] = value;
              } else {
                newRow[colVal] = Math.min(newRow[colVal], value);
              }
              count++;
            }
          }
        });
      });
      
      if (settings.aggregationFunction === "average" && count > 0) {
        newRow[colVal] /= count;
      }
    });
    
    result.push(newRow);
  });
  
  return result;
};

/**
 * Функция для преобразования и сохранения данных в Excel-файл
 * 
 * @param data Данные для сохранения
 * @param fileName Имя файла
 */
export const downloadAsExcel = (data: any[], fileName: string): void => {
  // В реальной реализации здесь была бы логика сохранения Excel-файла
  console.log('Данные для сохранения:', data);
  console.log(`Файл будет сохранен как ${fileName}`);
};

/**
 * Имитация чтения данных из Excel-файла
 * 
 * @param file Файл для чтения
 * @returns Объект с данными и метаданными файла
 */
export const readExcelFile = async (file: File): Promise<Omit<FileData, 'id' | 'selected'>> => {
  // Имитация асинхронного чтения файла
  return new Promise((resolve) => {
    setTimeout(() => {
      // Генерируем случайные тестовые данные для разных типов файлов
      let mockData: any[] = [];
      
      if (file.name.includes("продажи") || file.name.includes("sales")) {
        mockData = [
          { "Регион": "Москва", "Продукт": "Телефоны", "Продажи": 120000, "Месяц": "Январь" },
          { "Регион": "Москва", "Продукт": "Ноутбуки", "Продажи": 230000, "Месяц": "Январь" },
          { "Регион": "Санкт-Петербург", "Продукт": "Телефоны", "Продажи": 95000, "Месяц": "Январь" },
          { "Регион": "Санкт-Петербург", "Продукт": "Ноутбуки", "Продажи": 180000, "Месяц": "Январь" },
          { "Регион": "Москва", "Продукт": "Телефоны", "Продажи": 135000, "Месяц": "Февраль" },
          { "Регион": "Москва", "Продукт": "Ноутбуки", "Продажи": 210000, "Месяц": "Февраль" }
        ];
      } else if (file.name.includes("персонал") || file.name.includes("staff")) {
        mockData = [
          { "Отдел": "Продажи", "Сотрудник": "Иванов", "Зарплата": 70000, "Стаж": 3 },
          { "Отдел": "Продажи", "Сотрудник": "Петров", "Зарплата": 65000, "Стаж": 2 },
          { "Отдел": "Маркетинг", "Сотрудник": "Сидорова", "Зарплата": 80000, "Стаж": 5 },
          { "Отдел": "Маркетинг", "Сотрудник": "Козлова", "Зарплата": 75000, "Стаж": 4 },
          { "Отдел": "ИТ", "Сотрудник": "Смирнов", "Зарплата": 120000, "Стаж": 7 }
        ];
      } else {
        mockData = [
          { "Категория": "Категория A", "Значение": 42, "Группа": "Группа 1" },
          { "Категория": "Категория B", "Значение": 28, "Группа": "Группа 1" },
          { "Категория": "Категория A", "Значение": 35, "Группа": "Группа 2" },
          { "Категория": "Категория B", "Значение": 16, "Группа": "Группа 2" }
        ];
      }
      
      resolve({
        name: file.name,
        data: mockData,
        columns: Object.keys(mockData[0] || {})
      });
    }, 100);
  });
};
