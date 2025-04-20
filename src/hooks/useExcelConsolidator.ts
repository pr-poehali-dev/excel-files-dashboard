import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { FileData, ConsolidationSettings } from '@/types/excel';
import { 
  consolidateExcelFiles, 
  downloadAsExcel, 
  extractAvailableColumns,
  readExcelFile 
} from '@/utils/excelConsolidator';

/**
 * Хук для управления логикой сведения Excel-файлов
 */
export function useExcelConsolidator() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<any[] | null>(null);
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
    setAvailableColumns(extractAvailableColumns(files));
  }, [files]);

  /**
   * Обработчик загрузки файлов
   */
  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (!uploadedFiles.length) return;
    
    const newFiles: FileData[] = [];
    
    try {
      for (const file of uploadedFiles) {
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
        description: "Выберите хотя бы один файл для консолидации",
        variant: "destructive",
      });
      return;
    }
    
    // Валидация настроек для сводки и сводной таблицы
    if (
      (settings.consolidationType === "summary" || settings.consolidationType === "pivot") && 
      (!settings.groupByColumn || settings.valueColumns.length === 0)
    ) {
      toast({
        title: "Недостаточно параметров",
        description: "Выберите столбец для группировки и столбцы значений",
        variant: "destructive",
      });
      return;
    }
    
    // Выполняем консолидацию
    const result = consolidateExcelFiles(selectedFiles, settings);
    
    if (!result || result.length === 0) {
      toast({
        title: "Ошибка консолидации",
        description: "Не удалось консолидировать файлы или результат пуст",
        variant: "destructive",
      });
      return;
    }
    
    setConsolidatedData(result);
    
    toast({
      title: "Файлы консолидированы",
      description: `Успешно консолидировано ${selectedFiles.length} файлов`,
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
    setSettings({ ...settings, ...newSettings });
  };

  return {
    files,
    consolidatedData,
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
