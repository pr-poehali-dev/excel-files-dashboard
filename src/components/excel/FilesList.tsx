import { FileData } from "@/types/excel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, Trash, AlertTriangle } from "lucide-react";

interface FilesListProps {
  files: FileData[];
  onToggleFileSelection: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onClearAllFiles: () => void;
}

/**
 * Компонент для отображения списка загруженных файлов
 */
const FilesList = ({ 
  files, 
  onToggleFileSelection, 
  onRemoveFile,
  onClearAllFiles 
}: FilesListProps) => {
  if (files.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <AlertTriangle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Нет загруженных файлов</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Загруженные файлы</CardTitle>
        {files.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAllFiles}
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            Очистить все
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  id={`file-${file.id}`}
                  checked={file.selected}
                  onCheckedChange={() => onToggleFileSelection(file.id)}
                  className="mt-1"
                />
                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <label 
                      htmlFor={`file-${file.id}`} 
                      className="font-medium text-sm cursor-pointer hover:underline"
                    >
                      {file.name}
                    </label>
                    <div className="text-xs text-muted-foreground">
                      <span>{file.columns.length} столбцов</span>
                      <span className="mx-1">•</span>
                      <span>{file.data.length} строк</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-[300px] truncate">
                      Столбцы: {file.columns.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemoveFile(file.id)}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilesList;
