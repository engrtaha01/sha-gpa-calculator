import { useEffect, useRef, useState, useCallback } from 'react';
import { Course, Semester } from '../types/gpa';

export interface RealtimeAppState {
  courses: Course[];
  prevCgpa: number;
  prevCredits: number;
  semesters: Semester[];
  currentNotes: string;
}

export function useRealtimeSync(
  initialState: RealtimeAppState,
  onRemoteStateChange: (patch: Partial<RealtimeAppState>) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [clientCount, setClientCount] = useState(1);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string>(
    'client_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36)
  );
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'sync:init') {
            if (msg.state) {
              onRemoteStateChange({
                courses: msg.state.courses,
                prevCgpa: msg.state.prevCgpa,
                prevCredits: msg.state.prevCredits,
                semesters: msg.state.semesters,
                currentNotes: msg.state.currentNotes,
              });
            }
            if (typeof msg.clientCount === 'number') {
              setClientCount(msg.clientCount);
            }
            setLastSyncTime(Date.now());
          } else if (msg.type === 'state:patched') {
            // Only apply if not sent by this client
            if (msg.sourceClientId !== clientIdRef.current && msg.payload) {
              setIsSyncing(true);
              onRemoteStateChange(msg.payload);
              setLastSyncTime(Date.now());
              setTimeout(() => setIsSyncing(false), 600);
            }
          } else if (msg.type === 'presence:update') {
            if (typeof msg.clientCount === 'number') {
              setClientCount(msg.clientCount);
            }
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt auto-reconnect after 2 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    }
  }, [onRemoteStateChange]);

  useEffect(() => {
    connect();

    // Heartbeat ping every 25 seconds
    const pingInterval = window.setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    return () => {
      window.clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const broadcastPatch = useCallback(
    (patch: Partial<RealtimeAppState>) => {
      setIsSyncing(true);
      setLastSyncTime(Date.now());
      setTimeout(() => setIsSyncing(false), 400);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'state:patch',
            payload: patch,
            clientId: clientIdRef.current,
            timestamp: Date.now(),
          })
        );
      }
    },
    []
  );

  return {
    isConnected,
    clientCount,
    lastSyncTime,
    isSyncing,
    broadcastPatch,
  };
}
