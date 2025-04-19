import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Trash } from "lucide-react";

interface FileData {
  id: string;
  name: string;
  data: any[];
  selected: boolean;
}

interface ExcelFileListProps {
  files: FileData[];
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const ExcelFileList: React.FC<ExcelFileListProps> = ({ 
  files, 
  onToggleSelect, 
  onRemove 
}) => {
  if (files.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Нет загруженных файлов. Загрузите файлы Excel для начала работы.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Выбор</TableHead>
            <TableHead>Название</TableHead>
            <TableHead className="hidden sm:table-cell">Строк</TableHead>
            <TableHead className="w-20 text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <input 
                  type="checkbox" 
                  checked={file.selected}
                  onChange={() => onToggleSelect(file.id)}
                  className="w-4 h-4"
                />
              </TableCell>
              <TableCell className="font-medium flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                {file.name}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {file.data.length}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onRemove(file.id)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExcelFileList;