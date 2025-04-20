import { FileData, ConsolidationSettings } from "@/types/excel";

/**
 * Консолидирует данные из выбранных файлов согласно указанным настройкам
 * 
 * @param selectedFiles Массив выбранных файлов для консолидации
 * @param settings Настройки консолидации
 * @returns Консолидированный набор данных или null в случае ошибки
 */
export const consolidateExcelFiles = (
  selectedFiles: FileData[],
  settings: ConsolidationSettings
): any[] | null => {
  if (selectedFiles.length === 0) {
    return null;
  }

  // Простое объединение всех данных
  if (settings.consolidationType === "append") {
    let allData: any[] = [];
    
    selectedFiles.forEach(file => {
      const fileData = [...file.data];
      
      // Добавляем информацию об источнике данных
      const dataWithSource = fileData.map(row => ({
        "Источник": file.name,
        ...row
      }));
      
      allData = [...allData, ...dataWithSource];
    });
    
    return allData;
  }
  
  // Сводка по выбранным столбцам
  if (settings.consolidationType === "summary") {
    if (!settings.groupByColumn || settings.valueColumns.length === 0) {
      return null;
    }
    
    const groupedData = new Map();
    
    selectedFiles.forEach(file => {
      file.data.forEach(row => {
        // Пропускаем пустые строки, если настройка включена
        if (settings.skipEmptyRows && !row[settings.groupByColumn!]) {
          return;
        }
        
        const groupValue = String(row[settings.groupByColumn!] || 'Не указано');
        
        if (!groupedData.has(groupValue)) {
          groupedData.set(groupValue, {});
          settings.valueColumns.forEach(col => {
            groupedData.get(groupValue)[col] = [];
          });
        }
        
        // Добавляем значения для каждого выбранного столбца
        settings.valueColumns.forEach(col => {
          const value = Number(row[col]) || 0;
          groupedData.get(groupValue)[col].push(value);
        });
      });
    });
    
    // Применяем выбранную функцию агрегации
    const result: any[] = [];
    
    groupedData.forEach((values, groupValue) => {
      const resultRow: any = {
        [settings.groupByColumn!]: groupValue
      };
      
      settings.valueColumns.forEach(col => {
        const numValues = values[col];
        
        switch (settings.aggregationFunction) {
          case "sum":
            resultRow[`${col} (Сумма)`] = numValues.reduce((a: number, b: number) => a + b, 0);
            break;
          case "average":
            resultRow[`${col} (Среднее)`] = numValues.length > 0 
              ? numValues.reduce((a: number, b: number) => a + b, 0) / numValues.length
              : 0;
            break;
          case "max":
            resultRow[`${col} (Максимум)`] = numValues.length > 0 
              ? Math.max(...numValues)
              : 0;
            break;
          case "min":
            resultRow[`${col} (Минимум)`] = numValues.length > 0 
              ? Math.min(...numValues)
              : 0;
            break;
          case "count":
            resultRow[`${col} (Количество)`] = numValues.length;
            break;
        }
      });
      
      result.push(resultRow);
    });
    
    return result;
  }
  
  // Сводная таблица
  if (settings.consolidationType === "pivot") {
    if (!settings.groupByColumn || settings.valueColumns.length === 0) {
      return null;
    }
    
    // Пример простой сводной таблицы
    const fileSources = selectedFiles.map(file => file.name);
    const pivotData = new Map();
    
    selectedFiles.forEach(file => {
      file.data.forEach(row => {
        // Пропускаем пустые строки, если настройка включена
        if (settings.skipEmptyRows && !row[settings.groupByColumn!]) {
          return;
        }
        
        const groupValue = String(row[settings.groupByColumn!] || 'Не указано');
        
        if (!pivotData.has(groupValue)) {
          const newRow: any = {
            [settings.groupByColumn!]: groupValue
          };
          
          // Инициализируем значения для всех файлов и колонок
          fileSources.forEach(source => {
            settings.valueColumns.forEach(col => {
              newRow[`${source} - ${col}`] = 0;
            });
          });
          
          pivotData.set(groupValue, newRow);
        }
        
        // Обновляем значения для текущего файла
        settings.valueColumns.forEach(col => {
          const pivotKey = `${file.name} - ${col}`;
          const value = Number(row[col]) || 0;
          
          switch (settings.aggregationFunction) {
            case "sum":
            case "count":
              pivotData.get(groupValue)[pivotKey] += value;
              break;
            case "max":
              pivotData.get(groupValue)[pivotKey] = Math.max(
                pivotData.get(groupValue)[pivotKey], 
                value
              );
              break;
            case "min":
              // Если значение еще не установлено или новое значение меньше
              if (pivotData.get(groupValue)[pivotKey] === 0 || 
                  value < pivotData.get(groupValue)[pivotKey]) {
                pivotData.get(groupValue)[pivotKey] = value;
              }
              break;
            case "average":
              // Для среднего нужно накапливать сумму и количество
              if (!pivotData.get(groupValue)[`${pivotKey}_sum`]) {
                pivotData.get(groupValue)[`${pivotKey}_sum`] = 0;
                pivotData.get(groupValue)[`${pivotKey}_count`] = 0;
              }
              pivotData.get(groupValue)[`${pivotKey}_sum`] += value;
              pivotData.get(groupValue)[`${pivotKey}_count`] += 1;
              pivotData.get(groupValue)[pivotKey] = 
                pivotData.get(groupValue)[`${pivotKey}_sum`] / 
                pivotData.get(groupValue)[`${pivotKey}_count`];
              break;
          }
        });
      });
    });
    
    // Удаляем временные ключи для вычисления среднего
    if (settings.aggregationFunction === "average") {
      pivotData.forEach((row) => {
        Object.keys(row).forEach(key => {
          if (key.endsWith('_sum') || key.endsWith('_count')) {
            delete row[key];
          }
        });
      });
    }
    
    return Array.from(pivotData.values());
  }
  
  return null;
};

/**
 * Функция для преобразования и сохранения данных в Excel-файл
 * 
 * @param data Данные для сохранения
 * @param fileName Имя файла (по умолчанию 'consolidated_data.xlsx')
 */
export const downloadAsExcel = (data: any[], fileName: string = 'consolidated_data.xlsx'): void => {
  // В реальной реализации здесь была бы логика сохранения Excel-файла
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
 * 
 * @param file Файл для чтения
 * @returns Объект с данными и метаданными файла
 */
export const readExcelFile = async (file: File): Promise<Omit<FileData, 'id' | 'selected'>> => {
  // Имитация асинхронного чтения файла
  return new Promise((resolve) => {
    setTimeout(() => {
      // Генерируем случайные тестовые данные для примера
      const mockData = [
        { "Регион": "Москва", "Продажи": 1250000, "Клиенты": 350, "Менеджеры": 12 },
        { "Регион": "Санкт-Петербург", "Продажи": 950000, "Клиенты": 280, "Менеджеры": 9 },
        { "Регион": "Краснодар", "Продажи": 540000, "Клиенты": 145, "Менеджеры": 6 }
      ];
      
      // Добавляем дополнительную строку для имитации разных данных
      if (file.name.includes("2")) {
        mockData.push({ "Регион": "Екатеринбург", "Продажи": 680000, "Клиенты": 198, "Менеджеры": 7 });
      } else if (file.name.includes("3")) {
        mockData.push({ "Регион": "Новосибирск", "Продажи": 720000, "Клиенты": 215, "Менеджеры": 8 });
      }
      
      resolve({
        name: file.name,
        data: mockData,
        columns: Object.keys(mockData[0])
      });
    }, 200);
  });
};

/**
 * Преобразование данных для отображения в диаграммах
 * 
 * @param data Консолидированные данные
 * @param groupByColumn Столбец для группировки
 * @returns Массив данных для диаграммы
 */
export const prepareChartData = (data: any[], groupByColumn: string | null): any[] => {
  if (!data || !groupByColumn) return [];
  
  // Получаем все столбцы, кроме столбца группировки
  const firstRow = data[0] || {};
  const valueColumns = Object.keys(firstRow).filter(key => key !== groupByColumn);
  
  // Форматируем данные для диаграммы
  return data.map(row => {
    const chartRow: any = {
      name: row[groupByColumn!]
    };
    
    valueColumns.forEach(col => {
      chartRow[col] = Number(row[col]) || 0;
    });
    
    return chartRow;
  });
};
