import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { FileData, MergeOptions } from '@/types/excel';
import { 
  mergeExcelFiles, 
  downloadAsExcel, 
  extractAvailableColumns,
  readExcelFile 
} from '@/utils/excelMerger';

/**
 * Хук для управления логикой объединения Excel-файлов
 */
export function useExcelMerger() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [mergedData, setMergedData] = useState<any[] | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [mergeOptions, setMergeOptions] = useState<MergeOptions>({
    mergeType: "vertical",
    ignoreEmptyCells: false,
    keyColumn: null
  });
  
  const { toast } = useToast();

  // Обновление доступных столбцов при изменении списка файлов
  useEffect(() => {
    setAvailableColumns(extractAvailableColumns(files));
  }, [files]);

  /**
   * Обработчик загрузки файлов
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const newFiles: FileData[] = [];
    const filesArray = Array.from(event.target.files);
    
    try {
      for (const file of filesArray) {
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
      
      // Сбрасываем input
      event.target.value = "";
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка при обработке файлов",
        variant: "destructive",
      });
    }
  };

  /**
   * Обработчик объединения файлов
   */
  const handleMergeFiles = () => {
    const selectedFiles = files.filter(file => file.selected);
    
    if (selectedFiles.length < 2) {
      toast({
        title: "Недостаточно файлов",
        description: "Выберите минимум два файла для объединения",
        variant: "destructive",
      });
      return;
    }
    
    // Проверяем настройки для горизонтального объединения
    if (mergeOptions.mergeType === "horizontal" && !mergeOptions.keyColumn) {
      toast({
        title: "Требуется ключевой столбец",
        description: "Для горизонтального объединения необходимо выбрать ключевой столбец",
        variant: "destructive",
      });
      return;
    }
    
    // Выполняем объединение
    const result = mergeExcelFiles(selectedFiles, mergeOptions);
    
    if (!result) {
      toast({
        title: "Ошибка объединения",
        description: "Не удалось объединить файлы",
        variant: "destructive",
      });
      return;
    }
    
    setMergedData(result);
    
    toast({
      title: "Файлы объединены",
      description: `Успешно объединено ${selectedFiles.length} файлов`,
    });
  };

  /**
   * Обработчик скачивания объединенного файла
   */
  const handleDownloadMerged = () => {
    if (!mergedData) return;
    
    try {
      downloadAsExcel(mergedData);
      
      toast({
        title: "Файл сохранен",
        description: "Объединенный файл успешно скачан",
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
   * Обновление настроек объединения
   */
  const updateMergeOptions = (options: Partial<MergeOptions>) => {
    setMergeOptions({ ...mergeOptions, ...options });
  };

  return {
    files,
    mergedData,
    availableColumns,
    mergeOptions,
    handleFileUpload,
    handleMergeFiles,
    handleDownloadMerged,
    toggleFileSelection,
    removeFile,
    selectAllFiles,
    updateMergeOptions
  };
}
