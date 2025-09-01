import { useState, useEffect } from 'react';
import { isSamsungInternet, getSamsungBrowserInfo } from '../utils/samsungBrowserDebug';
import { testSamsungConnectivity } from '../utils/samsungNetworkFix';
import { API_URL } from '../lib/config';

const SamsungDebugPanel = ({ isVisible = false }) => {
  const [logs, setLogs] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);

  const testConnectivity = async () => {
    setIsTestingConnectivity(true);
    try {
      const result = await testSamsungConnectivity(API_URL);
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, {
        type: result.success ? 'log' : 'error',
        message: `Connectivity Test: ${result.message}`,
        timestamp
      }]);
      
      // Add detailed results
      if (result.results) {
        result.results.forEach(test => {
          setLogs(prev => [...prev, {
            type: test.success ? 'log' : 'error',
            message: `${test.name}: ${test.success ? '✅ ' + test.status : '❌ ' + test.error}`,
            timestamp
          }]);
          
          // Also log the URL being tested
          setLogs(prev => [...prev, {
            type: 'log',
            message: `  URL: ${test.url}`,
            timestamp
          }]);
        });
      }
    } catch (error) {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, {
        type: 'error',
        message: `Connectivity Test Failed: ${error.message}`,
        timestamp
      }]);
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  useEffect(() => {
    if (isSamsungInternet()) {
      setBrowserInfo(getSamsungBrowserInfo());
      
      // Override console.log for Samsung browsers to capture logs
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      
      const addLog = (type, message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-20), { // Keep only last 20 logs
          type,
          message: typeof message === 'object' ? JSON.stringify(message) : String(message),
          timestamp
        }]);
      };
      
      console.log = (...args) => {
        originalLog(...args);
        if (args[0] && args[0].includes && args[0].includes('🔍 Samsung Browser')) {
          addLog('log', args.join(' '));
        }
      };
      
      console.error = (...args) => {
        originalError(...args);
        if (args[0] && args[0].includes && args[0].includes('🔍 Samsung Browser')) {
          addLog('error', args.join(' '));
        }
      };
      
      console.warn = (...args) => {
        originalWarn(...args);
        if (args[0] && args[0].includes && args[0].includes('Samsung Browser')) {
          addLog('warn', args.join(' '));
        }
      };
      
      // Cleanup
      return () => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  if (!isSamsungInternet() || !isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      right: '10px',
      backgroundColor: '#1a1a1a',
      color: '#00ff00',
      border: '1px solid #333',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '11px',
      zIndex: 9999,
      maxHeight: isExpanded ? '300px' : '60px',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease'
    }}>
      {/* Header */}
      <div 
        style={{
          padding: '8px',
          backgroundColor: '#333',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>🔍 Samsung Debug Panel</span>
        <span>{isExpanded ? '▼' : '▲'}</span>
      </div>
      
      {/* Browser Info */}
      {isExpanded && browserInfo && (
        <div style={{ padding: '8px', borderBottom: '1px solid #333' }}>
          <div><strong>Browser:</strong> Samsung {browserInfo.version}</div>
          <div><strong>Features:</strong></div>
          <div style={{ marginLeft: '10px', fontSize: '10px' }}>
            localStorage: {browserInfo.supportedFeatures.localStorage ? '✅' : '❌'}<br/>
            cookies: {browserInfo.supportedFeatures.cookies ? '✅' : '❌'}<br/>
            fetch: {browserInfo.supportedFeatures.fetch ? '✅' : '❌'}
          </div>
        </div>
      )}
      
      {/* Logs */}
      {isExpanded && (
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#666' }}>No debug logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                style={{
                  marginBottom: '4px',
                  color: log.type === 'error' ? '#ff6b6b' : 
                        log.type === 'warn' ? '#ffd93d' : '#00ff00',
                  fontSize: '10px',
                  wordBreak: 'break-word'
                }}
              >
                <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Action buttons */}
      {isExpanded && (
        <div style={{ padding: '8px', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
          <button 
            onClick={testConnectivity}
            disabled={isTestingConnectivity}
            style={{
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: isTestingConnectivity ? 'not-allowed' : 'pointer',
              opacity: isTestingConnectivity ? 0.6 : 1
            }}
          >
            {isTestingConnectivity ? 'Testing...' : 'Test Connection'}
          </button>
          
          {logs.length > 0 && (
            <button 
              onClick={() => setLogs([])}
              style={{
                backgroundColor: '#444',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Clear Logs
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SamsungDebugPanel;