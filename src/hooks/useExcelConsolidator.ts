import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { FileData, ConsolidationSettings } from '@/types/excel';
import { 
  consolidateExcelFiles, 
  downloadAsExcel, 
  extractAvailableColumns,
  readExcelFile,
  prepareChartData
} from '@/utils/excelConsolidator';

/**
 * Хук для управления логикой сведения Excel-файлов
 */
export function useExcelConsolidator() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<any[] | null>(null);
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [settings, setSettings] = useState<ConsolidationSettings>({
    consolidationType: "append",
    preserveHeaders: true,
    skipEmptyRows: true,
    aggregationFunction: "sum",
    groupByColumn: null,
    valueColumns: []
  });
  
  const { toast } = useToast();

  // Обновление доступных столбцов при изменении списка файлов
  useEffect(() => {
    const columns = extractAvailableColumns(files);
    setAvailableColumns(columns);
    
    // Если текущий groupByColumn больше не доступен, сбрасываем его
    if (settings.groupByColumn && !columns.includes(settings.groupByColumn)) {
      setSettings(prev => ({ ...prev, groupByColumn: null }));
    }
    
    // Обновляем список выбранных столбцов для значений
    setSettings(prev => ({
      ...prev,
      valueColumns: prev.valueColumns.filter(col => columns.includes(col))
    }));
  }, [files]);

  /**
   * Обработчик загрузки файлов
   */
  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    
    const newFiles: FileData[] = [];
    
    try {
      for (const file of files) {
        try {
          const fileData = await readExcelFile(file);
          
          newFiles.push({
            id: crypto.randomUUID(),
            name: fileData.name,
            data: fileData.data,
            columns: fileData.columns,
            selected: true
          });
          
          toast({
            title: "Файл загружен",
            description: `Файл "${file.name}" успешно загружен`,
          });
        } catch (error) {
          toast({
            title: "Ошибка",
            description: `Не удалось прочитать файл "${file.name}". Проверьте формат Excel.`,
            variant: "destructive",
          });
        }
      }
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка при обработке файлов",
        variant: "destructive",
      });
    }
  };

  /**
   * Обработчик консолидации файлов
   */
  const handleConsolidateFiles = () => {
    const selectedFiles = files.filter(file => file.selected);
    
    if (selectedFiles.length === 0) {
      toast({
        title: "Нет выбранных файлов",
        description: "Выберите хотя бы один файл для обработки",
        variant: "destructive",
      });
      return;
    }
    
    // Проверяем настройки
    if (settings.consolidationType !== "append" && !settings.groupByColumn) {
      toast({
        title: "Неполные настройки",
        description: "Для сводки или сводной таблицы необходимо выбрать столбец для группировки",
        variant: "destructive",
      });
      return;
    }
    
    if ((settings.consolidationType === "summary" || settings.consolidationType === "pivot") && 
        settings.valueColumns.length === 0) {
      toast({
        title: "Неполные настройки",
        description: "Необходимо выбрать хотя бы один столбец со значениями",
        variant: "destructive",
      });
      return;
    }
    
    // Выполняем консолидацию
    const result = consolidateExcelFiles(selectedFiles, settings);
    
    if (!result) {
      toast({
        title: "Ошибка консолидации",
        description: "Не удалось объединить данные",
        variant: "destructive",
      });
      return;
    }
    
    setConsolidatedData(result);
    
    // Подготавливаем данные для диаграммы
    if (settings.groupByColumn) {
      const chartData = prepareChartData(result, settings.groupByColumn);
      setChartData(chartData);
    }
    
    toast({
      title: "Данные обработаны",
      description: `Успешно обработано ${selectedFiles.length} файлов`,
    });
  };

  /**
   * Обработчик скачивания консолидированного файла
   */
  const handleDownloadConsolidated = () => {
    if (!consolidatedData) return;
    
    try {
      downloadAsExcel(consolidatedData);
      
      toast({
        title: "Файл сохранен",
        description: "Консолидированный файл успешно скачан",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить файл",
        variant: "destructive",
      });
    }
  };

  /**
   * Переключение выбора файла
   */
  const toggleFileSelection = (id: string) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, selected: !file.selected } : file
    ));
  };

  /**
   * Удаление файла
   */
  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  /**
   * Выбор всех файлов
   */
  const selectAllFiles = (selected: boolean) => {
    setFiles(files.map(file => ({ ...file, selected })));
  };

  /**
   * Обновление настроек консолидации
   */
  const updateSettings = (newSettings: Partial<ConsolidationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    files,
    consolidatedData,
    chartData,
    availableColumns,
    settings,
    handleFileUpload,
    handleConsolidateFiles,
    handleDownloadConsolidated,
    toggleFileSelection,
    removeFile,
    selectAllFiles,
    updateSettings
  };
}
