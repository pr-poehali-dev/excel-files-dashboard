import { FileData, ConsolidationSettings } from "@/types/excel";

/**
 * Функция для сведения данных из нескольких Excel-файлов
 * 
 * @param files - Массив файлов для сведения
 * @param settings - Настройки сведения
 * @returns Сведенные данные или null в случае ошибки
 */
export const consolidateExcelFiles = (
  files: FileData[],
  settings: ConsolidationSettings
): any[] | null => {
  if (files.length === 0) {
    return null;
  }

  try {
    switch (settings.consolidationType) {
      case "append":
        return appendData(files, settings);
      case "summary":
        return createSummary(files, settings);
      case "pivot":
        return createPivot(files, settings);
      default:
        return null;
    }
  } catch (error) {
    console.error("Ошибка при сведении файлов:", error);
    return null;
  }
};

/**
 * Объединение данных из файлов путем добавления всех строк
 */
const appendData = (files: FileData[], settings: ConsolidationSettings): any[] => {
  // Получаем все уникальные столбцы из всех файлов
  const allColumns = new Set<string>();
  files.forEach(file => {
    file.columns.forEach(column => allColumns.add(column));
  });

  const result: any[] = [];

  files.forEach(file => {
    file.data.forEach(row => {
      // Пропускаем пустые строки, если настройка включена
      if (settings.skipEmptyRows && isEmptyRow(row)) {
        return;
      }

      const newRow: any = {};
      
      // Заполняем все возможные столбцы
      allColumns.forEach(column => {
        // Если нужно сохранять заголовки, добавляем имя файла к имени столбца
        if (settings.preserveHeaders && column in row) {
          const columnName = `${column} (${file.name})`;
          newRow[columnName] = row[column];
        } else {
          newRow[column] = column in row ? row[column] : null;
        }
      });
      
      result.push(newRow);
    });
  });

  return result;
};

/**
 * Создание сводной таблицы с итогами по файлам
 */
const createSummary = (files: FileData[], settings: ConsolidationSettings): any[] => {
  // Находим числовые столбцы для агрегации
  const numericColumns: Record<string, boolean> = {};
  const firstFileWithData = files.find(f => f.data.length > 0);
  
  if (!firstFileWithData) return [];
  
  // Определяем числовые столбцы на основе первого файла
  Object.keys(firstFileWithData.data[0]).forEach(column => {
    const value = firstFileWithData.data[0][column];
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      numericColumns[column] = true;
    }
  });
  
  // Создаем сводную таблицу
  const summary: any[] = [];
  
  files.forEach(file => {
    const fileStats: any = {
      "Файл": file.name,
      "Количество строк": file.data.length
    };
    
    // Агрегируем числовые данные
    Object.keys(numericColumns).forEach(column => {
      const values = file.data
        .map(row => typeof row[column] === 'number' ? row[column] : parseFloat(row[column]))
        .filter(val => !isNaN(val));
      
      if (values.length === 0) {
        fileStats[`${column} (${settings.aggregationFunction})`] = 0;
        return;
      }
      
      let aggregatedValue: number;
      
      switch (settings.aggregationFunction) {
        case "sum":
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case "average":
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case "count":
          aggregatedValue = values.length;
          break;
        case "min":
          aggregatedValue = Math.min(...values);
          break;
        case "max":
          aggregatedValue = Math.max(...values);
          break;
        default:
          aggregatedValue = 0;
      }
      
      fileStats[`${column} (${settings.aggregationFunction})`] = aggregatedValue;
    });
    
    summary.push(fileStats);
  });
  
  return summary;
};

/**
 * Создание сводной таблицы с группировкой (pivot)
 */
const createPivot = (files: FileData[], settings: ConsolidationSettings): any[] => {
  // Упрощенная реализация сводной таблицы для демонстрации
  // В реальном приложении здесь была бы более сложная логика создания pivot table
  
  // Находим все категориальные столбцы (тип string)
  const categories = new Set<string>();
  const metrics = new Set<string>();
  
  // Определяем категории и метрики
  files.forEach(file => {
    if (file.data.length === 0) return;
    
    Object.entries(file.data[0]).forEach(([key, value]) => {
      if (typeof value === 'string' && !isNumeric(value)) {
        categories.add(key);
      } else {
        metrics.add(key);
      }
    });
  });
  
  // Берем первые две категории для группировки
  const categoryColumns = Array.from(categories).slice(0, 2);
  const metricColumns = Array.from(metrics).slice(0, 3);
  
  if (categoryColumns.length === 0 || metricColumns.length === 0) {
    return createSummary(files, settings);
  }
  
  // Объединяем все данные
  const allData = files.flatMap(file => file.data);
  
  // Группируем по первой категории
  const groupedData: Record<string, any[]> = {};
  
  allData.forEach(row => {
    const categoryValue = String(row[categoryColumns[0]] || 'Прочее');
    
    if (!groupedData[categoryValue]) {
      groupedData[categoryValue] = [];
    }
    
    groupedData[categoryValue].push(row);
  });
  
  // Создаем сводку для каждой группы
  const pivotResult: any[] = [];
  
  Object.entries(groupedData).forEach(([category, rows]) => {
    const pivotRow: any = {
      [categoryColumns[0]]: category,
      "Количество": rows.length
    };
    
    // Добавляем агрегированные метрики
    metricColumns.forEach(metric => {
      const values = rows
        .map(row => {
          const val = row[metric];
          return typeof val === 'number' ? val : parseFloat(val);
        })
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        pivotRow[`${metric} (сумма)`] = values.reduce((sum, val) => sum + val, 0);
        pivotRow[`${metric} (среднее)`] = values.reduce((sum, val) => sum + val, 0) / values.length;
      } else {
        pivotRow[`${metric} (сумма)`] = 0;
        pivotRow[`${metric} (среднее)`] = 0;
      }
    });
    
    pivotResult.push(pivotRow);
  });
  
  return pivotResult;
};

/**
 * Проверка, является ли строка пустой (все значения null, undefined или пустые строки)
 */
const isEmptyRow = (row: any): boolean => {
  return Object.values(row).every(
    value => value === null || value === undefined || value === ''
  );
};

/**
 * Проверка, является ли строка числовым значением
 */
const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};
