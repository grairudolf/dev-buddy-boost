
import React, { useState } from 'react';
import { Code, Eye, FileJson, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ElementInfo {
  tagName: string;
  id: string;
  classList: string[];
  attributes: { name: string; value: string }[];
  styles: Record<string, string>;
  box: Record<string, number>;
  innerHTML?: string;
  outerHTML?: string;
  textContent?: string;
}

const DOMInspector = () => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [elementInfo, setElementInfo] = useState<ElementInfo | null>(null);
  const [activeTab, setActiveTab] = useState('properties');

  const startInspecting = () => {
    // Check if we're in a browser extension context
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'TOGGLE_INSPECTOR', value: true },
            () => {
              setIsInspecting(true);
            }
          );
        }
      });
    } else {
      console.log('Chrome extension API not available in this environment');
    }
  };

  // Listen for selected element info
  React.useEffect(() => {
    // Only set up the listener if we're in a browser extension context
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      const listener = (message: any) => {
        if (message.type === 'ELEMENT_SELECTED') {
          setElementInfo(message.data);
          setIsInspecting(false);
        }
        return true;
      };

      chrome.runtime.onMessage.addListener(listener);
      return () => {
        chrome.runtime.onMessage.removeListener(listener);
      };
    }
    
    return undefined;
  }, []);

  const renderElementSelector = () => {
    if (!elementInfo) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <Eye size={48} className="text-purple-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
          <p className="text-muted-foreground mb-4">
            Click the inspect button and select an element on the page to see its details
          </p>
          <Button 
            onClick={startInspecting} 
            disabled={isInspecting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isInspecting ? 'Selecting...' : 'Inspect Element'}
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderElementInfo = () => {
    if (!elementInfo) return null;

    return (
      <>
        <div className="mb-4 p-3 bg-purple-50 rounded-md">
          <h3 className="text-sm font-mono mb-2 flex items-center gap-2">
            <Badge className="bg-purple-600">{elementInfo.tagName.toLowerCase()}</Badge>
            {elementInfo.id && <Badge variant="outline">#{elementInfo.id}</Badge>}
            {elementInfo.classList.map((cls, i) => (
              <Badge key={i} variant="secondary">.{cls}</Badge>
            ))}
          </h3>
          <div className="text-xs text-muted-foreground">
            {elementInfo.box.width.toFixed(0)} × {elementInfo.box.height.toFixed(0)} px
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
            <TabsTrigger value="styles" className="flex-1">Styles</TabsTrigger>
            <TabsTrigger value="html" className="flex-1">HTML</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="mt-2">
            <ScrollArea className="h-[240px]">
              <div className="space-y-2">
                {elementInfo.attributes.map((attr, i) => (
                  <div key={i} className="grid grid-cols-3 text-sm">
                    <div className="font-medium">{attr.name}</div>
                    <div className="col-span-2 font-mono text-xs overflow-hidden text-ellipsis">{attr.value}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="styles" className="mt-2">
            <ScrollArea className="h-[240px]">
              <div className="space-y-2">
                {Object.entries(elementInfo.styles).map(([key, value], i) => (
                  <div key={i} className="grid grid-cols-3 text-sm">
                    <div className="font-medium">{key}</div>
                    <div className="col-span-2 font-mono text-xs overflow-hidden text-ellipsis">
                      {value}
                      {key.includes('color') && value !== 'transparent' && !value.includes('rgba(0, 0, 0, 0)') && (
                        <div 
                          className="w-3 h-3 rounded-full inline-block ml-2" 
                          style={{ backgroundColor: value }} 
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="html" className="mt-2">
            <ScrollArea className="h-[240px]">
              <pre className="text-xs font-mono p-2 bg-slate-50 rounded border whitespace-pre-wrap">
                {elementInfo.outerHTML?.slice(0, 5000)}
                {elementInfo.outerHTML && elementInfo.outerHTML.length > 5000 && '...'}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={startInspecting} 
            disabled={isInspecting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isInspecting ? 'Selecting...' : 'Select New Element'}
          </Button>
        </div>
      </>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search size={18} /> DOM Inspector
        </CardTitle>
        <CardDescription>
          Inspect and analyze DOM elements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderElementSelector()}
        {renderElementInfo()}
      </CardContent>
    </Card>
  );
};

export default DOMInspector;
