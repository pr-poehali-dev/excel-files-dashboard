import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadAreaProps {
  onFilesUpload: (files: File[]) => void;
}

/**
 * Компонент области загрузки файлов с поддержкой drag & drop
 */
const FileUploadArea = ({ onFilesUpload }: FileUploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Обработчик начала перетаскивания файлов
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Обработчик окончания перетаскивания файлов (без сброса)
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Обработчик сброса файлов в область загрузки
   */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(
        file => file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
               file.type === "application/vnd.ms-excel" ||
               file.name.endsWith('.xlsx') || 
               file.name.endsWith('.xls')
      );
      
      if (filesArray.length > 0) {
        onFilesUpload(filesArray);
      }
    }
  };

  /**
   * Обработчик выбора файлов через проводник
   */
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesUpload(filesArray);
      // Сброс input после обработки
      e.target.value = '';
    }
  };

  /**
   * Открытие диалога выбора файлов
   */
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card 
      className={`border-2 border-dashed transition-colors ${
        isDragging ? "border-primary bg-muted/50" : "border-muted-foreground/20"
      }`}
    >
      <CardContent 
        className="flex flex-col items-center justify-center py-10 text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleOpenFileDialog}
      >
        <FileSpreadsheet className="h-10 w-10 mb-4 text-muted-foreground" />
        
        <h3 className="text-lg font-medium mb-2">
          Перетащите Excel файлы сюда
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          или нажмите для выбора файлов
        </p>
        
        <Button 
          variant="secondary" 
          className="flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenFileDialog();
          }}
        >
          <Upload className="h-4 w-4" />
          Выбрать файлы
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
        
        <p className="text-xs text-muted-foreground mt-4">
          Поддерживаемые форматы: .xlsx, .xls
        </p>
      </CardContent>
    </Card>
  );
};

export default FileUploadArea;
