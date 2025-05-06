import { useContext, useEffect, useState, useRef } from 'react';
import { WebSocketContext } from '@/provider/WebSocketProvider';

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'uninstantiated';

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  const [status, setStatus] = useState<WebSocketStatus>('uninstantiated');

  useEffect(() => {
    if (!context) return;
    
    const { socket } = context;    
    // Set initial status
    if (socket) {
      switch (socket.readyState) {
        case WebSocket.CONNECTING:
          setStatus('connecting');
          break;
        case WebSocket.OPEN:
          setStatus('open');
          break;
        case WebSocket.CLOSING:
          setStatus('closing');
          break;
        case WebSocket.CLOSED:
          setStatus('closed');
          break;
        default:
          setStatus('uninstantiated');
      }
    }
    // Update status on socket events
    const handleOpen = () => setStatus('open');
    const handleClose = () => setStatus('closed');
    const handleError = () => setStatus('closed');

    if (socket) {
      socket.addEventListener('open', handleOpen);
      socket.addEventListener('close', handleClose);
      socket.addEventListener('error', handleError);
    }

    return () => {
      if (socket) {
        socket.removeEventListener('open', handleOpen);
        socket.removeEventListener('close', handleClose);
        socket.removeEventListener('error', handleError);
      }
    };
  }, [context]);

  // Provide a fallback when not within the context
  if (!context) {
    return {
      socket: null,
      sendMessage: () => console.warn('WebSocket not available'),
      lastMessage: null,
      status: 'uninstantiated' as WebSocketStatus,
      isConnected: false
    };
  }

  return {
    ...context,
    status,
    isConnected: status === 'open'
  };
}
