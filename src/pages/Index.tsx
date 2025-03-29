
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Palette, Database, Router, Monitor } from 'lucide-react';
import DOMInspector from "@/components/DOMInspector";
import ColorPicker from "@/components/ColorPicker";
import JsonFormatter from "@/components/JsonFormatter";
import RequestLogger from "@/components/RequestLogger";
import StorageViewer from "@/components/StorageViewer";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dom-inspector");

  return (
    <div className="min-h-screen bg-gray-50 w-[600px] p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-800">
          <Monitor className="h-6 w-6" />
          DevBuddy Boost
        </h1>
        <p className="text-slate-500">Web Developer Productivity Tools</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="dom-inspector" className="flex items-center gap-1">
            <Code size={16} /> Inspector
          </TabsTrigger>
          <TabsTrigger value="color-picker" className="flex items-center gap-1">
            <Palette size={16} /> Colors
          </TabsTrigger>
          <TabsTrigger value="json-formatter" className="flex items-center gap-1">
            <Code size={16} /> JSON
          </TabsTrigger>
          <TabsTrigger value="request-logger" className="flex items-center gap-1">
            <Router size={16} /> Network
          </TabsTrigger>
          <TabsTrigger value="storage-viewer" className="flex items-center gap-1">
            <Database size={16} /> Storage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dom-inspector" className="mt-0">
          <DOMInspector />
        </TabsContent>
        
        <TabsContent value="color-picker" className="mt-0">
          <ColorPicker />
        </TabsContent>
        
        <TabsContent value="json-formatter" className="mt-0">
          <JsonFormatter />
        </TabsContent>
        
        <TabsContent value="request-logger" className="mt-0">
          <RequestLogger />
        </TabsContent>
        
        <TabsContent value="storage-viewer" className="mt-0">
          <StorageViewer />
        </TabsContent>
      </Tabs>
      
      <footer className="mt-6 text-center text-xs text-slate-400">
        DevBuddy Boost v1.0.0 • Made with ❤️ for web developers
      </footer>
    </div>
  );
};

export default Index;
