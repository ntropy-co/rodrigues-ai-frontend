import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DOCUMENT_TYPES, DocumentTypeId } from "./types";
import { useState } from "react";

interface DocumentTypeSelectorProps {
  selectedType: DocumentTypeId;
  onSelect: (type: DocumentTypeId) => void;
}

export function DocumentTypeSelector({ selectedType, onSelect }: DocumentTypeSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedDoc = DOCUMENT_TYPES.find((doc) => doc.id === selectedType);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">Tipo de Documento</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedDoc ? selectedDoc.name : "Selecione o tipo..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Procurar tipo..." />
            <CommandList>
              <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
              <CommandGroup>
                {DOCUMENT_TYPES.map((doc) => (
                  <CommandItem
                    key={doc.id}
                    value={doc.id}
                    onSelect={(currentValue) => {
                      onSelect(currentValue as DocumentTypeId);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedType === doc.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{doc.name}</span>
                      <span className="text-xs text-muted-foreground">{doc.description}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedDoc && (
        <p className="text-xs text-slate-500 mt-1">
          {selectedDoc.description}
        </p>
      )}
    </div>
  );
}
