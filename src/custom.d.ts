
declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  const content: any;
  export default content;
}

interface Chrome {
  tabs: {
    query: (queryInfo: any, callback: (tabs: any[]) => void) => void;
    sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => void;
  };
  runtime: {
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: any) => boolean | void) => void;
      removeListener: (callback: (message: any, sender: any, sendResponse: any) => boolean | void) => void;
    };
    sendMessage: (message: any, callback?: (response: any) => void) => void;
  };
  storage: {
    local: {
      get: (keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void) => void;
      set: (items: object, callback?: () => void) => void;
    };
  };
  scripting: {
    executeScript: (injection: any) => Promise<any>;
  };
}

declare var chrome: Chrome;
