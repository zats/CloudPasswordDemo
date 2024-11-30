class EventTarget {}

let window = {}
let self = {}
let connectNativeOnMessageCallbacks = [];

// Window stubs
window.matchMedia = function(query) {
  console.log('matchMedia called with query:', query);
  return {
    matches: false,
    addEventListener: function(event, callback) {
      console.log('matchMedia.addEventListener:', { event, hasCallback: !!callback });
    }
  };
};

self.crypto = {
  getRandomValues: function(array) {
    console.log('crypto.getRandomValues called with array length:', array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * Math.pow(2, 32));
    }
    return array;
  }
};

performance = {
  now: function() {
    const timestamp = Date.now();
    console.log('performance.now returned:', timestamp);
    return timestamp;
  }
};

// Chrome API stubs
chrome = {
  storage: {
    local: {
      get: function(keys, callback) {
        console.log('chrome.storage.local.get:', { keys: JSON.stringify(keys) });
        callback({});
      },
      set: function(items, callback) {
        console.log('chrome.storage.local.set:', { items: JSON.stringify(items) });
        callback && callback();
      },
      remove: function(keys, callback) {
        console.log('chrome.storage.local.remove:', { keys: JSON.stringify(keys) });
        callback && callback();
      }
    },
    sync: {
      get: function(keys, callback) {
        console.log('chrome.storage.sync.get:', { keys: JSON.stringify(keys) });
        callback({});
      },
      set: function(items, callback) {
        console.log('chrome.storage.sync.set:', { items: JSON.stringify(items) });
        callback && callback();
      },
      remove: function(keys, callback) {
        console.log('chrome.storage.sync.remove:', { keys: JSON.stringify(keys) });
        callback && callback();
      }
    }
  },
  
  tabs: {
    query: function(options, callback) {
      console.log('chrome.tabs.query:', { options: JSON.stringify(options) });
      callback([{
        id: 1,
        url: 'https://example.com',
        status: 'complete'
      }]);
    },
    onCreated: {
      addListener: function(callback) {
        console.log('chrome.tabs.onCreated.addListener registered');
      }
    },
    onUpdated: {
      addListener: function(callback) {
        console.log('chrome.tabs.onUpdated.addListener registered');
      }
    },
    onActivated: {
      addListener: function(callback) {
        console.log('chrome.tabs.onActivated.addListener registered');
      }
    },
    onRemoved: {
      addListener: function(callback) {
        console.log('chrome.tabs.onRemoved.addListener registered');
      }
    },
    sendMessage: function(tabId, message, options, callback) {
      bridgeFunctionCall(getFunctionInfo(this, arguments));
      console.log('chrome.tabs.sendMessage:', {
        tabId,
        message: JSON.stringify(message),
        options: JSON.stringify(options)
      });
      callback && callback();
    }
  },
  
  webNavigation: {
    getAllFrames: function(details, callback) {
      console.log('chrome.webNavigation.getAllFrames:', { details: JSON.stringify(details) });
      callback([{
        frameId: 0,
        url: 'https://example.com'
      }]);
    },
    onBeforeNavigate: {
      addListener: function(callback) {
        console.log('chrome.webNavigation.onBeforeNavigate.addListener registered');
      }
    },
    onCompleted: {
      addListener: function(callback) {
        console.log('chrome.webNavigation.onCompleted.addListener registered');
      }
    },
    onHistoryStateUpdated: {
      addListener: function(callback) {
        console.log('chrome.webNavigation.onHistoryStateUpdated.addListener registered');
      }
    },
    onTabReplaced: {
      addListener: function(callback) {
        console.log('chrome.webNavigation.onTabReplaced.addListener registered');
      }
    },
    getFrame: function(details, callback) {
      console.log('chrome.webNavigation.getFrame:', { details: JSON.stringify(details) });
      callback({
        frameId: details.frameId,
        url: 'https://example.com',
        parentFrameId: -1
      });
    }
  },
  
  i18n: {
    getMessage: function(messageName, substitutions) {
      console.log('chrome.i18n.getMessage:', { 
        messageName, 
        substitutions: substitutions ? JSON.stringify(substitutions) : undefined 
      });
      return messageName;
    }
  },
  
  action: {
    setIcon: function(details) {
      console.log('chrome.action.setIcon:', { details: JSON.stringify(details) });
    }
  },
  
  browserAction: {
    setIcon: function(details) {
      console.log('chrome.browserAction.setIcon:', { details: JSON.stringify(details) });
    }
  },
  
  contextMenus: {
    create: function(properties) {
      console.log('chrome.contextMenus.create:', { properties: JSON.stringify(properties) });
    },
    removeAll: function() {
      console.log('chrome.contextMenus.removeAll called');
    },
    onClicked: {
      addListener: function(callback) {
        console.log('chrome.contextMenus.onClicked.addListener registered');
      }
    }
  },
  
  windows: {
    onFocusChanged: {
      addListener: function(callback) {
        console.log('chrome.windows.onFocusChanged.addListener registered');
      }
    },
    WINDOW_ID_NONE: -1
  },
  
  scripting: {
    executeScript: function(details) {
      console.log('chrome.scripting.executeScript:', { details: JSON.stringify(details) });
      return Promise.resolve([]);
    }
  },
  
  runtime: {
    connectNative: function(name) {
      console.log('chrome.runtime.connectNative called with name:', name);
      return {
        postMessage: function(msg) {
          console.log(getFunctionInfo(this, arguments));
          console.log('port.postMessage:', JSON.stringify(msg, null, 2));
          bridgeFunctionCall(getFunctionInfo(this, arguments));
        },
        onMessage: {
          addListener: function(callback) {
            connectNativeOnMessageCallbacks.push(callback);
            console.log('port.onMessage.addListener registered');
          }
        },
        onDisconnect: {
          addListener: function(callback) {
            console.log('port.onDisconnect.addListener registered');
          }
        }
      };
    },

    onConnect: {
      addListener: function(callback) {
        console.log('chrome.runtime.onConnect.addListener registered');
      }
    },

    onInstalled: {
      addListener: function(callback) {
        console.log('chrome.runtime.onInstalled.addListener registered');
      }
    },
    onSuspend: {
      addListener: function(callback) {
        console.log('chrome.runtime.onSuspend.addListener registered');
      }
    },
    onSuspendCanceled: {
      addListener: function(callback) {
        console.log('chrome.runtime.onSuspendCanceled.addListener registered');
      }
    },
    onUpdateAvailable: {
      addListener: function(callback) {
        console.log('chrome.runtime.onUpdateAvailable.addListener registered');
      }
    },
    onMessage: {
      addListener: function(callback) {
        console.log('chrome.runtime.onMessage.addListener registered');
      }
    },
    getManifest: function() {
      return {
        content_scripts: [{
          js: ['content.js']
        }]
      };
    }
  },
  
  privacy: {
    services: {
      passwordSavingEnabled: {
        get: function(details) {
          console.log('chrome.privacy.services.passwordSavingEnabled.get:', { details: JSON.stringify(details) });
          return Promise.resolve({ value: false, levelOfControl: 'controllable_by_this_extension' });
        },
        set: function(details) {
          console.log('chrome.privacy.services.passwordSavingEnabled.set:', { details: JSON.stringify(details) });
          return Promise.resolve();
        },
        clear: function(details) {
          console.log('chrome.privacy.services.passwordSavingEnabled.clear:', { details: JSON.stringify(details) });
          return Promise.resolve();
        },
        onChange: {
          addListener: function(callback) {
            console.log('chrome.privacy.services.passwordSavingEnabled.onChange.addListener registered');
          }
        }
      },
      autofillCreditCardEnabled: {
        get: function(details) {
          console.log('chrome.privacy.services.autofillCreditCardEnabled.get:', { details: JSON.stringify(details) });
          return Promise.resolve({ value: false, levelOfControl: 'controllable_by_this_extension' });
        },
        set: function(details) {
          console.log('chrome.privacy.services.autofillCreditCardEnabled.set:', { details: JSON.stringify(details) });
          return Promise.resolve();
        },
        clear: function(details) {
          console.log('chrome.privacy.services.autofillCreditCardEnabled.clear:', { details: JSON.stringify(details) });
          return Promise.resolve();
        },
        onChange: {
          addListener: function(callback) {
            console.log('chrome.privacy.services.autofillCreditCardEnabled.onChange.addListener registered');
          }
        }
      },
      autofillAddressEnabled: {
        get: function(details) {
          console.log('chrome.privacy.services.autofillAddressEnabled.get:', { details: JSON.stringify(details) });
          return Promise.resolve({ value: false, levelOfControl: 'controllable_by_this_extension' });
        },
        set: function(details) {
          console.log('chrome.privacy.services.autofillAddressEnabled.set:', { details: JSON.stringify(details) });
          return Promise.resolve();
        },
        clear: function(details) {
          console.log('chrome.privacy.services.autofillAddressEnabled.clear:', { details: JSON.stringify(details) });
          return Promise.resolve();
        },
        onChange: {
          addListener: function(callback) {
            console.log('chrome.privacy.services.autofillAddressEnabled.onChange.addListener registered');
          }
        }
      }
    }
  }
};

// Constants
window.WindowsVersion = {
  Higher: "Higher",
  Eleven: "Eleven",
  Ten: "Ten",
  Vista: "Vista",
  XPOrLower: "XPOrLower",
  NotWindows: "NotWindows",
  Other: "Other"
};

window.WBSAutoFillFormTypeUndetermined = 0;
window.WBSAutoFillFormTypeAutoFillableStandard = 1;
window.WBSAutoFillFormTypeNonAutoFillable = 2;
window.WBSAutoFillFormTypeAutoFillableLogin = 3;
window.WBSAutoFillFormTypeNewAccount = 4;
window.WBSAutoFillFormTypeChangePassword = 5;
window.WBSAutoFillFormTypeFoundTOTPURI = 6;

window.RememberIC = {
  NoValueSet: "NoValueSet",
  UnknownPage: "UnknownPage",
  DoNotRemember: "DoNotRemember",
  RememberLoginAndPassword: "RememberLoginAndPassword"
};

// Navigator stub
navigator = {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  platform: "MacIntel"
};


/// Native communication related
function getFunctionInfo(thiss, arguments) {
    return {
        this: thiss,
        name: arguments.callee.name,
        arguments: Array.from(arguments)
    };
}

function onMessageReceived(info) {
  console.log('onMessageReceived:', info);
  connectNativeOnMessageCallbacks.forEach(callback => callback(info));
}
