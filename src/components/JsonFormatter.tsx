
import React, { useState } from 'react';
import { FileJson, Copy, Check, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/components/ui/use-toast";

const JsonFormatter = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatJson = () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON to format');
      setFormattedJson('');
      return;
    }

    try {
      // Try to parse the JSON
      const parsed = JSON.parse(jsonInput);
      // Format with 2 spaces indentation
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
      setError('');
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setFormattedJson('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "JSON has been copied to your clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const clearJson = () => {
    setJsonInput('');
    setFormattedJson('');
    setError('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileJson size={18} /> JSON Formatter
        </CardTitle>
        <CardDescription>
          Format and validate JSON data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Textarea 
              placeholder="Paste your JSON here..." 
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="font-mono text-sm h-[120px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={formatJson} 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Format JSON
            </Button>
            <Button 
              variant="outline" 
              onClick={clearJson}
              className="px-3"
            >
              <Trash size={16} />
            </Button>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}
          
          {formattedJson && (
            <div className="rounded border relative">
              <div className="absolute right-2 top-2 z-10">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={copyToClipboard}
                  className="h-8 w-8"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              <ScrollArea className="h-[200px]">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all bg-slate-50 rounded">
                  {formattedJson}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonFormatter;
