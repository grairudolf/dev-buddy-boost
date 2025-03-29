
import React, { useState, useEffect } from 'react';
import { ActivitySquare, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface RequestLog {
  url: string;
  method: string;
  status: number;
  statusText: string;
  duration: string;
  timestamp: string;
  contentType?: string;
  error?: boolean;
}

const RequestLogger = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  
  const fetchLogs = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['requestLogs'], (result) => {
        const requestLogs = result.requestLogs || [];
        setLogs(requestLogs);
      });
    } else {
      console.log('Chrome storage API not available in this environment');
    }
  };
  
  const clearLogs = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ requestLogs: [] }, () => {
        setLogs([]);
      });
    } else {
      console.log('Chrome storage API not available in this environment');
    }
  };
  
  useEffect(() => {
    fetchLogs();
    
    // Listen for new logs
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      const listener = (message: any) => {
        if (message.type === 'LOG_REQUEST') {
          fetchLogs(); // Refresh logs when a new request is logged
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
  
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    if (status >= 500) return 'bg-red-500';
    return 'bg-gray-500'; // For unknown status codes or errors
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  const getUrlDisplay = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.pathname}${urlObj.search}`;
    } catch {
      return url;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ActivitySquare size={18} /> Request Logger
            </CardTitle>
            <CardDescription>
              Track network requests made by the page
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw size={14} />
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No requests logged yet. Browse the page to capture network activity.
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="p-2 text-sm border rounded hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium truncate max-w-[70%]" title={log.url}>
                      {getUrlDisplay(log.url)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{log.duration} ms</Badge>
                      <Badge 
                        className={`${getStatusColor(log.status)} ${log.error ? 'bg-red-500' : ''}`}
                      >
                        {log.method} {log.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>{log.contentType ? log.contentType.split(';')[0] : 'unknown'}</div>
                    <div>{formatTime(log.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestLogger;
