import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { FileData, ConsolidationSettings } from '@/types/excel';
import { 
  consolidateExcelFiles, 
  downloadAsExcel, 
  readExcelFile 
} from '@/utils/excelConsolidator';

/**
 * Хук для управления логикой сведения Excel-файлов
 */
export function useExcelConsolidator() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<any[] | null>(null);
  const [settings, setSettings] = useState<ConsolidationSettings>({
    consolidationType: "append",
    preserveHeaders: true,
    skipEmptyRows: true,
    aggregationFunction: "sum"
  });
  
  const { toast } = useToast();

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
   * Обработчик удаления файла
   */
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  /**
   * Обработчик очистки всех файлов
   */
  const clearAllFiles = () => {
    setFiles([]);
    setConsolidatedData(null);
  };

  /**
   * Обработчик консолидации файлов
   */
  const handleConsolidate = () => {
    const selectedFiles = files.filter(file => file.selected);
    
    if (selectedFiles.length < 1) {
      toast({
        title: "Нет файлов для сведения",
        description: "Загрузите хотя бы один файл для сведения",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = consolidateExcelFiles(selectedFiles, settings);
      
      if (!result || result.length === 0) {
        toast({
          title: "Ошибка сведения",
          description: "Не удалось свести данные. Проверьте файлы и настройки.",
          variant: "destructive",
        });
        return;
      }
      
      setConsolidatedData(result);
      
      toast({
        title: "Данные сведены",
        description: `Успешно обработано ${selectedFiles.length} файлов`,
      });
    } catch (error) {
      toast({
        title: "Ошибка сведения",
        description: "Произошла ошибка при сведении данных",
        variant: "destructive",
      });
    }
  };

  /**
   * Обработчик скачивания сведенного файла
   */
  const handleDownload = () => {
    if (!consolidatedData) return;
    
    try {
      downloadAsExcel(consolidatedData, 'consolidated_data.xlsx');
      
      toast({
        title: "Файл сохранен",
        description: "Сведенный файл успешно скачан",
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
   * Обновление настроек сведения
   */
  const updateSettings = (newSettings: Partial<ConsolidationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  /**
   * Переключение выбора файла
   */
  const toggleFileSelection = (id: string) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, selected: !file.selected } : file
    ));
  };

  return {
    files,
    settings,
    consolidatedData,
    handleFileUpload,
    removeFile,
    clearAllFiles,
    handleConsolidate,
    handleDownload,
    updateSettings,
    toggleFileSelection
  };
}
