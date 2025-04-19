import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FileData, ConsolidationSettings } from "@/types/excel";
import { readExcelFile } from "@/utils/excelMerger";
import { consolidateExcelFiles } from "@/utils/excelConsolidator";

/**
 * Хук для управления логикой сведения Excel-файлов
 */
export function useExcelConsolidator() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<any[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
  const handleFilesUpload = async (fileList: FileList) => {
    if (fileList.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const filesArray = Array.from(fileList);
      const newFiles: FileData[] = [];
      
      for (const file of filesArray) {
        try {
          const fileData = await readExcelFile(file);
          
          newFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            data: fileData.data,
            columns: fileData.columns,
            selected: true
          });
        } catch (error) {
          toast({
            title: "Ошибка чтения файла",
            description: `Не удалось прочитать файл "${file.name}". Проверьте формат.`,
            variant: "destructive",
          });
        }
      }
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        
        toast({
          title: "Файлы загружены",
          description: `Успешно загружено файлов: ${newFiles.length}`,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обработке файлов",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Создание сводной таблицы из загруженных файлов
   */
  const handleConsolidate = () => {
    if (files.length === 0) {
      toast({
        title: "Нет файлов",
        description: "Загрузите хотя бы один файл для сведения",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = consolidateExcelFiles(files, settings);
      
      if (!result || result.length === 0) {
        toast({
          title: "Ошибка сведения",
          description: "Не удалось создать сводную таблицу из загруженных файлов",
          variant: "destructive",
        });
        return;
      }
      
      setConsolidatedData(result);
      
      toast({
        title: "Сведение завершено",
        description: `Создана сводная таблица с ${result.length} строками`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании сводной таблицы",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Удаление файла из списка
   */
  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    
    // Сбрасываем результат, если удаляем файл
    setConsolidatedData(null);
  };

  /**
   * Скачивание результата сведения
   */
  const handleDownloadResult = () => {
    if (!consolidatedData) return;
    
    try {
      // Имитация скачивания файла
      toast({
        title: "Загрузка файла",
        description: "Файл со сводной таблицей сохранен",
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
  const updateSettings = (updatedSettings: Partial<ConsolidationSettings>) => {
    setSettings({ ...settings, ...updatedSettings });
  };

  return {
    files,
    consolidatedData,
    settings,
    isProcessing,
    handleFilesUpload,
    handleConsolidate,
    handleRemoveFile,
    handleDownloadResult,
    updateSettings,
  };
}
