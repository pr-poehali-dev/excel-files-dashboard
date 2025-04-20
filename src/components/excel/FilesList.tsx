import { FileData } from "@/types/excel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSpreadsheet, Trash2, Database } from "lucide-react";

interface FilesListProps {
  files: FileData[];
  onToggleSelection: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
}

/**
 * Компонент для отображения списка загруженных файлов
 */
const FilesList = ({ 
  files, 
  onToggleSelection, 
  onRemoveFile,
  onSelectAll
}: FilesListProps) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Database className="h-8 w-8 mx-auto mb-2" />
        <p>Нет загруженных файлов</p>
      </div>
    );
  }

  const allSelected = files.every(file => file.selected);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all" 
            checked={allSelected} 
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          <label 
            htmlFor="select-all" 
            className="text-sm cursor-pointer"
          >
            Выбрать все файлы
          </label>
        </div>
        <span className="text-sm text-muted-foreground">
          Всего файлов: {files.length}
        </span>
      </div>

      <ScrollArea className="h-[240px] rounded-md border p-2">
        <div className="space-y-2">
          {files.map(file => (
            <div 
              key={file.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted group"
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  id={`file-${file.id}`}
                  checked={file.selected}
                  onCheckedChange={() => onToggleSelection(file.id)}
                />
                <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <label
                    htmlFor={`file-${file.id}`}
                    className="block font-medium text-sm truncate cursor-pointer"
                    title={file.name}
                  >
                    {file.name}
                  </label>
                  <div className="text-xs text-muted-foreground">
                    {file.columns.length} столбцов, {file.data.length} строк
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFile(file.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FilesList;
