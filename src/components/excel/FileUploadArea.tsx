import React, { useRef, useState } from "react";
import { Upload, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileUploadAreaProps {
  onFileUpload: (files: File[]) => void;
}

/**
 * Компонент для загрузки Excel файлов с поддержкой drag-and-drop
 */
const FileUploadArea = ({ onFileUpload }: FileUploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      );
      
      if (files.length > 0) {
        onFileUpload(files);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(Array.from(e.target.files));
      
      // Сбрасываем input для возможности загрузки тех же файлов повторно
      e.target.value = '';
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-muted p-3">
          <Upload className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Перетащите файлы сюда</h3>
          <p className="text-sm text-muted-foreground">
            Или нажмите на кнопку ниже для выбора файлов
          </p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <FileUp className="h-4 w-4" />
          Выбрать Excel файлы
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
        
        <p className="text-xs text-muted-foreground">
          Поддерживаемые форматы: .xlsx, .xls
        </p>
      </div>
    </div>
  );
};

export default FileUploadArea;
