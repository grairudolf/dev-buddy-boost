import React, { useState, useEffect } from 'react';
import { Database, Edit, Save, X, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from "@/components/ui/use-toast";

interface StorageItem {
  key: string;
  value: any;
  editing?: boolean;
  editValue?: string;
}

const StorageViewer = () => {
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newItemKey, setNewItemKey] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  
  const fetchStorageItems = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'GET_LOCAL_STORAGE' },
            (response) => {
              if (response && response.success) {
                const items = Object.entries(response.data).map(([key, value]) => ({
                  key,
                  value,
                  editing: false
                }));
                setStorageItems(items);
              }
            }
          );
        }
      });
    } else {
      console.log('Chrome extension API not available in this environment');
    }
  };
  
  useEffect(() => {
    fetchStorageItems();
  }, []);
  
  const startEditing = (index: number) => {
    const newItems = [...storageItems];
    const item = newItems[index];
    
    item.editing = true;
    item.editValue = typeof item.value === 'object' 
      ? JSON.stringify(item.value, null, 2)
      : String(item.value);
      
    setStorageItems(newItems);
  };
  
  const cancelEditing = (index: number) => {
    const newItems = [...storageItems];
    newItems[index].editing = false;
    delete newItems[index].editValue;
    setStorageItems(newItems);
  };
  
  const saveChanges = (index: number) => {
    const item = storageItems[index];
    
    let parsedValue = item.editValue;
    // Try to parse as JSON if it looks like an object or array
    if (
      (item.editValue?.trim().startsWith('{') && item.editValue?.trim().endsWith('}')) ||
      (item.editValue?.trim().startsWith('[') && item.editValue?.trim().endsWith(']'))
    ) {
      try {
        parsedValue = JSON.parse(item.editValue || '');
      } catch (e) {
        // If parsing fails, use the raw string value
        console.error('Failed to parse JSON:', e);
      }
    }
    
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { 
              action: 'SET_LOCAL_STORAGE',
              key: item.key,
              value: parsedValue
            },
            (response) => {
              if (response && response.success) {
                const newItems = [...storageItems];
                newItems[index].value = parsedValue;
                newItems[index].editing = false;
                delete newItems[index].editValue;
                setStorageItems(newItems);
                
                toast({
                  title: "Storage Updated",
                  description: `Key "${item.key}" has been updated`,
                  duration: 2000,
                });
              }
            }
          );
        }
      });
    } else {
      console.log('Chrome extension API not available in this environment');
    }
  };
  
  const addNewItem = () => {
    if (!newItemKey.trim()) {
      toast({
        title: "Error",
        description: "Key cannot be empty",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    
    let parsedValue = newItemValue;
    // Try to parse as JSON if it looks like an object or array
    if (
      (newItemValue.trim().startsWith('{') && newItemValue.trim().endsWith('}')) ||
      (newItemValue.trim().startsWith('[') && newItemValue.trim().endsWith(']'))
    ) {
      try {
        parsedValue = JSON.parse(newItemValue);
      } catch (e) {
        // If parsing fails, use the raw string value
        console.error('Failed to parse JSON:', e);
      }
    }
    
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { 
              action: 'SET_LOCAL_STORAGE',
              key: newItemKey,
              value: parsedValue
            },
            (response) => {
              if (response && response.success) {
                fetchStorageItems();
                setIsOpen(false);
                setNewItemKey('');
                setNewItemValue('');
                
                toast({
                  title: "Storage Updated",
                  description: `Key "${newItemKey}" has been added`,
                  duration: 2000,
                });
              }
            }
          );
        }
      });
    } else {
      console.log('Chrome extension API not available in this environment');
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database size={18} /> Local Storage
            </CardTitle>
            <CardDescription>
              View and edit browser's localStorage
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchStorageItems}>
              <RefreshCw size={14} />
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={14} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Storage Item</DialogTitle>
                  <DialogDescription>
                    Create a new entry in the page's localStorage
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key</label>
                    <Input 
                      value={newItemKey} 
                      onChange={(e) => setNewItemKey(e.target.value)} 
                      placeholder="Enter key name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Textarea 
                      value={newItemValue} 
                      onChange={(e) => setNewItemValue(e.target.value)} 
                      placeholder="Enter value (string or JSON)"
                      className="font-mono text-sm"
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button onClick={addNewItem}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {storageItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No localStorage items found on this page.
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {storageItems.map((item, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{item.key}</div>
                    {!item.editing ? (
                      <Button variant="ghost" size="sm" onClick={() => startEditing(index)}>
                        <Edit size={14} />
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => saveChanges(index)}>
                          <Save size={14} className="text-green-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => cancelEditing(index)}>
                          <X size={14} className="text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {!item.editing ? (
                    <div className="text-sm font-mono bg-slate-50 p-2 rounded max-h-[100px] overflow-auto">
                      {typeof item.value === 'object' 
                        ? JSON.stringify(item.value, null, 2)
                        : String(item.value)
                      }
                    </div>
                  ) : (
                    <Textarea 
                      value={item.editValue} 
                      onChange={(e) => {
                        const newItems = [...storageItems];
                        newItems[index].editValue = e.target.value;
                        setStorageItems(newItems);
                      }}
                      className="font-mono text-sm"
                      rows={4}
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageViewer;
