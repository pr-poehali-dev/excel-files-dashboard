import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileUploadButtonProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Компонент для загрузки Excel файлов
 */
const FileUploadButton = ({ onFileUpload }: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Загрузить файлы
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        multiple
        className="hidden"
        onChange={onFileUpload}
      />
    </>
  );
};

export default FileUploadButton;
