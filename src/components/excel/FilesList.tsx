import { FileData } from "@/types/excel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  FileSpreadsheet, 
  Trash, 
  Eye, 
  EyeOff 
} from "lucide-react";

interface FilesListProps {
  files: FileData[];
  onToggleFileSelection: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onSelectAllFiles: (selected: boolean) => void;
}

/**
 * Компонент для отображения списка загруженных файлов
 */
const FilesList = ({ 
  files, 
  onToggleFileSelection, 
  onRemoveFile,
  onSelectAllFiles
}: FilesListProps) => {
  if (files.length === 0) {
    return (
      <div className="border rounded-md p-6 text-center bg-muted/10">
        <p className="text-muted-foreground">
          Нет загруженных файлов. Загрузите файлы для начала работы.
        </p>
      </div>
    );
  }

  const allSelected = files.every(f => f.selected);
  const someSelected = files.some(f => f.selected);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="selectAll" 
            checked={allSelected}
            className={someSelected && !allSelected ? "opacity-70" : ""}
            onCheckedChange={(checked) => onSelectAllFiles(!!checked)}
          />
          <label htmlFor="selectAll" className="text-sm cursor-pointer">
            Выбрать все файлы
          </label>
        </div>
        
        <Badge variant="outline">
          {files.filter(f => f.selected).length} из {files.length} выбрано
        </Badge>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Название файла</TableHead>
              <TableHead className="hidden md:table-cell">Столбцы</TableHead>
              <TableHead className="hidden md:table-cell">Строки</TableHead>
              <TableHead className="w-20 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id} className={!file.selected ? "opacity-60" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={file.selected}
                    onCheckedChange={() => onToggleFileSelection(file.id)}
                    id={`file-${file.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {file.columns.length}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {file.data.length}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onToggleFileSelection(file.id)}
                      title={file.selected ? "Исключить файл" : "Включить файл"}
                    >
                      {file.selected ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-blue-500" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onRemoveFile(file.id)}
                      title="Удалить файл"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FilesList;
