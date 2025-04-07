
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface CommandOutputProps {
  output: string;
  maxLines?: number;
}

const CommandOutput: React.FC<CommandOutputProps> = ({ output, maxLines = 10 }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const lines = output.split('\n');
  const isLongOutput = lines.length > maxLines;
  const displayedOutput = isLongOutput ? lines.slice(0, maxLines).join('\n') : output;
  
  const highlightSearchText = (text: string) => {
    if (!searchText.trim()) return text;
    
    const regex = new RegExp(`(${searchText})`, 'gi');
    return text.split(regex).map((part, i) => {
      if (part.toLowerCase() === searchText.toLowerCase()) {
        return <span key={i} className="bg-yellow-300 text-black">{part}</span>;
      }
      return part;
    });
  };
  
  return (
    <div className="relative">
      <pre className="p-4 bg-gray-900 text-green-400 rounded overflow-x-auto whitespace-pre-wrap font-mono text-sm">
        {highlightSearchText(displayedOutput)}
      </pre>
      
      {isLongOutput && (
        <Button 
          variant="link" 
          onClick={() => setIsModalOpen(true)} 
          className="mt-1 text-xs text-blue-400"
        >
          Show full output ({lines.length} lines)
        </Button>
      )}
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Command Output</DialogTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in output..."
                className="pl-8"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <pre className="p-4 bg-gray-900 text-green-400 rounded whitespace-pre-wrap font-mono text-sm h-full">
              {highlightSearchText(output)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommandOutput;
