import { FileData } from "@/types/excel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Trash } from "lucide-react";

interface FilesTableProps {
  files: FileData[];
  onToggleFileSelection: (id: string) => void;
  onRemoveFile: (id: string) => void;
  onSelectAllFiles: (selected: boolean) => void;
}

/**
 * Компонент для отображения списка файлов в виде таблицы
 */
const FilesTable = ({ 
  files, 
  onToggleFileSelection, 
  onRemoveFile,
  onSelectAllFiles
}: FilesTableProps) => {
  const allSelected = files.every(f => f.selected);
  
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Checkbox 
          id="selectAll" 
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAllFiles(!!checked)}
        />
        <label htmlFor="selectAll" className="text-sm cursor-pointer">
          Выбрать все файлы
        </label>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Выбор</TableHead>
              <TableHead>Название</TableHead>
              <TableHead className="hidden sm:table-cell">Столбцы</TableHead>
              <TableHead className="hidden sm:table-cell">Строк</TableHead>
              <TableHead className="w-20 text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <Checkbox 
                    checked={file.selected}
                    onCheckedChange={() => onToggleFileSelection(file.id)}
                    id={`file-${file.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <label htmlFor={`file-${file.id}`} className="cursor-pointer">
                    {file.name}
                  </label>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {file.columns.length}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {file.data.length}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onRemoveFile(file.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default FilesTable;
