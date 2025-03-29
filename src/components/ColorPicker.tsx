
import React, { useState, useEffect } from 'react';
import { Droplet, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "@/components/ui/use-toast";

interface PickedColor {
  color: string;
  element: string;
}

const ColorPicker = () => {
  const [isPicking, setIsPicking] = useState(false);
  const [pickedColors, setPickedColors] = useState<PickedColor[]>([]);
  
  const startPicking = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'TOGGLE_COLOR_PICKER', value: true },
            () => {
              setIsPicking(true);
            }
          );
        }
      });
    } else {
      console.log('Chrome extension API not available in this environment');
    }
  };
  
  // Listen for color picked event
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      const listener = (message: any) => {
        if (message.type === 'COLOR_PICKED') {
          setPickedColors(prev => [message.data, ...prev].slice(0, 5));
          setIsPicking(false);
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
  
  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      toast({
        title: "Color copied to clipboard",
        description: color,
        duration: 2000,
      });
    });
  };
  
  const parseRgb = (rgbStr: string) => {
    const regex = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/;
    const match = rgbStr.match(regex);
    
    if (!match) return null;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;
    
    return { r, g, b, a };
  };
  
  const rgbToHex = (rgb: string) => {
    const color = parseRgb(rgb);
    if (!color) return '';
    
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
    
    return hex.toUpperCase();
  };
  
  const getTextColor = (bg: string) => {
    const color = parseRgb(bg);
    if (!color) return 'text-black';
    
    // Calculate relative luminance
    const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
    
    return luminance < 140 ? 'text-white' : 'text-black';
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Droplet size={18} /> Color Picker
        </CardTitle>
        <CardDescription>
          Pick colors from any element on the page
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pickedColors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Droplet size={48} className="text-teal-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Colors Picked Yet</h3>
            <p className="text-muted-foreground mb-4">
              Click the button below and select an element to pick its color
            </p>
            <Button 
              onClick={startPicking} 
              disabled={isPicking}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isPicking ? 'Picking...' : 'Pick a Color'}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {pickedColors.map((item, index) => {
                const hexColor = rgbToHex(item.color);
                const textColor = getTextColor(item.color);
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded flex items-center justify-center ${textColor}`}
                      style={{ backgroundColor: item.color }}
                    >
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(item.color)}
                        className="opacity-70 hover:opacity-100"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-mono">{hexColor}</div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyToClipboard(hexColor)}
                          className="h-6 w-6"
                        >
                          <Copy size={12} />
                        </Button>
                      </div>
                      <div className="text-sm font-mono">{item.color}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {item.element}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              onClick={startPicking} 
              disabled={isPicking}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {isPicking ? 'Picking...' : 'Pick Another Color'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ColorPicker;
