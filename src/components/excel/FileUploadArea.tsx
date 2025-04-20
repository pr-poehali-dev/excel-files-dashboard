import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";

interface FileUploadAreaProps {
  onFileUpload: (files: File[]) => void;
}

/**
 * Компонент области загрузки файлов с поддержкой drag&drop
 */
const FileUploadArea = ({ onFileUpload }: FileUploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    
    // Сбрасываем значение input, чтобы можно было загрузить тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (fileList: FileList) => {
    const files = Array.from(fileList);
    const excelFiles = files.filter(file => {
      const isExcel = 
        file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx') || 
        file.name.endsWith('.xls');
        
      if (!isExcel) {
        toast({
          title: "Неподдерживаемый формат",
          description: `Файл "${file.name}" не является Excel-файлом`,
          variant: "destructive",
        });
      }
      
      return isExcel;
    });
    
    if (excelFiles.length > 0) {
      onFileUpload(excelFiles);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
      
      <h3 className="text-lg font-medium mb-2">
        {isDragging ? 'Отпустите файлы для загрузки' : 'Перетащите Excel файлы сюда'}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4">
        или воспользуйтесь стандартным диалогом выбора файлов
      </p>
      
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        variant="outline"
        className="mx-auto flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Выбрать файлы
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls"
        multiple
        onChange={handleFileInput}
      />
      
      <p className="text-xs text-muted-foreground mt-4">
        Поддерживаемые форматы: .xlsx, .xls
      </p>
    </div>
  );
};

export default FileUploadArea;
