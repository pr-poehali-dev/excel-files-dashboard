import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FileUploadAreaProps {
  onFilesUpload: (files: FileList) => void;
  isProcessing: boolean;
}

/**
 * Компонент для загрузки файлов с областью перетаскивания
 */
const FileUploadArea = ({ onFilesUpload, isProcessing }: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesUpload(e.target.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="space-y-2 w-full max-w-xs mx-auto">
            <h3 className="font-medium">Обработка файлов...</h3>
            <Progress value={66} className="h-2 w-full" />
          </div>
        </div>
      ) : (
        <>
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Перетащите Excel файлы сюда</h3>
          <p className="text-muted-foreground mb-4">
            или выберите файлы на вашем компьютере
          </p>
          <Button onClick={handleButtonClick}>
            <Upload className="h-4 w-4 mr-2" />
            Выбрать файлы
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </>
      )}
    </div>
  );
};

export default FileUploadArea;
