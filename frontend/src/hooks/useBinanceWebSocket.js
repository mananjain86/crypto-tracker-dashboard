import { useState, useEffect, useRef, useCallback } from 'react';

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

/**
 * Custom hook for Binance WebSocket live price updates.
 * Subscribes to miniTicker streams for the given symbols.
 * Falls back gracefully if WebSocket fails.
 *
 * @param {string[]} symbols - Array of coin symbols (e.g., ['BTC', 'ETH', 'SOL'])
 * @param {boolean} enabled - Whether to connect (default true)
 * @returns {{ prices: Object, connected: boolean }}
 */
export function useBinanceWebSocket(symbols = [], enabled = true) {
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const symbolsKey = symbols.sort().join(',');

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnection on intentional close
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) return;

    cleanup();

    // Build combined stream URL for all symbols
    const streams = symbols
      .map(s => `${s.toLowerCase()}usdt@miniTicker`)
      .join('/');

    const wsUrl = `${BINANCE_WS_BASE}/${streams}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.s) {
            // Single stream
            const symbol = data.s.replace('USDT', '');
            setPrices(prev => ({
              ...prev,
              [symbol]: {
                lastPrice: data.c,
                priceChangePercent: ((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o) * 100).toFixed(2),
                quoteVolume: data.q,
                highPrice: data.h,
                lowPrice: data.l,
                symbol: data.s,
              }
            }));
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        // Will trigger onclose
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;

        // Exponential backoff reconnection
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          reconnectTimer.current = setTimeout(connect, delay);
        }
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  }, [symbolsKey, enabled, cleanup]);

  useEffect(() => {
    if (enabled && symbols.length > 0) {
      connect();
    }

    return cleanup;
  }, [symbolsKey, enabled]);

  return { prices, connected };
}
