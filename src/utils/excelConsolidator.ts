import { FileData, ConsolidationSettings } from "@/types/excel";

/**
 * Объединяет данные из выбранных файлов согласно указанным настройкам консолидации
 * 
 * @param selectedFiles Массив выбранных файлов для консолидации
 * @param settings Настройки консолидации
 * @returns Объединенный набор данных или null в случае ошибки
 */
export const consolidateExcelFiles = (
  selectedFiles: FileData[],
  settings: ConsolidationSettings
): any[] | null => {
  if (selectedFiles.length === 0) return null;

  // Базовое объединение (добавление данных из каждого файла)
  if (settings.consolidationType === "append") {
    const result: any[] = [];
    
    selectedFiles.forEach(file => {
      const fileData = settings.skipEmptyRows 
        ? file.data.filter(row => !isEmptyRow(row))
        : file.data;
      
      // Добавляем источник данных если сохраняем заголовки
      const dataWithSource = fileData.map(row => ({
        ...(settings.preserveHeaders ? { Источник: file.name } : {}),
        ...row
      }));
      
      result.push(...dataWithSource);
    });
    
    return result;
  }
  
  // Сводка с группировкой и агрегацией
  if (settings.consolidationType === "summary") {
    if (!settings.groupByColumn || settings.valueColumns.length === 0) {
      return null;
    }
    
    const groupedData = new Map<string, any>();
    
    selectedFiles.forEach(file => {
      file.data.forEach(row => {
        const groupValue = row[settings.groupByColumn!];
        if (!groupValue && settings.skipEmptyRows) return;
        
        const key = String(groupValue || "Не указано");
        
        if (!groupedData.has(key)) {
          groupedData.set(key, { 
            [settings.groupByColumn!]: groupValue || "Не указано",
            _count: 0
          });
          
          // Инициализируем значения для всех выбранных столбцов
          settings.valueColumns.forEach(col => {
            groupedData.get(key)[col] = 0;
          });
        }
        
        const group = groupedData.get(key);
        group._count++;
        
        // Агрегируем значения по выбранным столбцам
        settings.valueColumns.forEach(col => {
          const value = Number(row[col]) || 0;
          
          if (settings.aggregationFunction === "sum" || settings.aggregationFunction === "average") {
            group[col] += value;
          } else if (settings.aggregationFunction === "max") {
            group[col] = Math.max(group[col], value);
          } else if (settings.aggregationFunction === "min") {
            if (group._count === 1) {
              group[col] = value;
            } else {
              group[col] = Math.min(group[col], value);
            }
          } else if (settings.aggregationFunction === "count") {
            group[col] = group._count;
          }
        });
      });
    });
    
    // Применяем среднее значение для average
    if (settings.aggregationFunction === "average") {
      groupedData.forEach(group => {
        settings.valueColumns.forEach(col => {
          group[col] = group[col] / group._count;
        });
      });
    }
    
    // Преобразуем Map в массив и удаляем вспомогательное поле _count
    return Array.from(groupedData.values()).map(group => {
      const { _count, ...rest } = group;
      return rest;
    });
  }
  
  // Сводная таблица (pivot)
  if (settings.consolidationType === "pivot") {
    if (!settings.groupByColumn || settings.valueColumns.length === 0) {
      return null;
    }
    
    const pivotData: Record<string, any> = {};
    const uniqueValues = new Set<string>();
    
    // Собираем уникальные значения по файлам для колонок сводной таблицы
    selectedFiles.forEach(file => {
      const fileName = file.name.replace(/\.\w+$/, ''); // Удаляем расширение файла
      uniqueValues.add(fileName);
    });
    
    // Создаем сводную таблицу
    selectedFiles.forEach(file => {
      const fileName = file.name.replace(/\.\w+$/, '');
      
      file.data.forEach(row => {
        const groupValue = row[settings.groupByColumn!];
        if (!groupValue && settings.skipEmptyRows) return;
        
        const key = String(groupValue || "Не указано");
        
        if (!pivotData[key]) {
          pivotData[key] = { 
            [settings.groupByColumn!]: groupValue || "Не указано" 
          };
          
          // Инициализируем значения для всех файлов и столбцов
          Array.from(uniqueValues).forEach(fileKey => {
            settings.valueColumns.forEach(col => {
              pivotData[key][`${fileKey} - ${col}`] = null;
            });
          });
        }
        
        // Заполняем значениями для текущего файла
        settings.valueColumns.forEach(col => {
          const value = row[col];
          pivotData[key][`${fileName} - ${col}`] = value;
        });
      });
    });
    
    return Object.values(pivotData);
  }
  
  return null;
};

/**
 * Проверяет, является ли строка пустой (не содержит значимых данных)
 */
function isEmptyRow(row: any): boolean {
  return Object.values(row).every(value => 
    value === null || value === undefined || value === ''
  );
}

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
      // Генерируем случайные тестовые данные на основе имени файла
      let mockData: Record<string, any>[] = [];
      
      if (file.name.includes("sales")) {
        mockData = [
          { "Регион": "Москва", "Продажи": 10500, "Затраты": 7200, "Прибыль": 3300 },
          { "Регион": "Санкт-Петербург", "Продажи": 8900, "Затраты": 5800, "Прибыль": 3100 },
          { "Регион": "Казань", "Продажи": 5600, "Затраты": 3700, "Прибыль": 1900 },
          { "Регион": "Новосибирск", "Продажи": 6200, "Затраты": 4100, "Прибыль": 2100 }
        ];
      } else if (file.name.includes("expenses")) {
        mockData = [
          { "Регион": "Москва", "Маркетинг": 2100, "Логистика": 3400, "Персонал": 5600 },
          { "Регион": "Санкт-Петербург", "Маркетинг": 1800, "Логистика": 2800, "Персонал": 4900 },
          { "Регион": "Казань", "Маркетинг": 1200, "Логистика": 1500, "Персонал": 3200 },
          { "Регион": "Екатеринбург", "Маркетинг": 1500, "Логистика": 2300, "Персонал": 3800 }
        ];
      } else if (file.name.includes("inventory")) {
        mockData = [
          { "Категория": "Электроника", "Количество": 350, "Стоимость": 2800000 },
          { "Категория": "Одежда", "Количество": 780, "Стоимость": 980000 },
          { "Категория": "Книги", "Количество": 1200, "Стоимость": 420000 },
          { "Категория": "Спорттовары", "Количество": 530, "Стоимость": 730000 }
        ];
      } else {
        // Данные по умолчанию
        mockData = [
          { "Категория": "Тип A", "Значение1": Math.floor(Math.random() * 1000), "Значение2": Math.floor(Math.random() * 500) },
          { "Категория": "Тип B", "Значение1": Math.floor(Math.random() * 1000), "Значение2": Math.floor(Math.random() * 500) },
          { "Категория": "Тип C", "Значение1": Math.floor(Math.random() * 1000), "Значение2": Math.floor(Math.random() * 500) }
        ];
      }
      
      resolve({
        name: file.name,
        data: mockData,
        columns: Object.keys(mockData[0])
      });
    }, 100);
  });
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
