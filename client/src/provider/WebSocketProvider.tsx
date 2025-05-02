import { createContext, useEffect, useState, ReactNode, useRef } from 'react';

interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (data: any) => void;
  lastMessage: any;
}

// Create context with default values to avoid null checks
const defaultContextValue: WebSocketContextType = {
  socket: null,
  sendMessage: () => console.warn('WebSocket not initialized'),
  lastMessage: null
};

export const WebSocketContext = createContext<WebSocketContextType>(defaultContextValue);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWebSocket = () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      // Create WebSocket connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      const webSocket = new WebSocket(wsUrl);
      
      // Store socket in ref for cleanup
      socketRef.current = webSocket;
      
      // Handle incoming messages
      webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // Handle successful connection
      webSocket.onopen = () => {
        console.log('WebSocket connected successfully');
        setSocket(webSocket);
        setIsConnecting(false);
      };
      
      // Handle WebSocket errors
      webSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };
      
      // Reconnect logic
      webSocket.onclose = () => {
        console.log('WebSocket connection closed');
        setSocket(null);
        setIsConnecting(false);
        
        // Try to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setIsConnecting(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect after error...');
        connectWebSocket();
      }, 5000);
    }
  };

  useEffect(() => {
    // Initial connection
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Send message helper function
  const sendMessage = (data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected, cannot send message');
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
