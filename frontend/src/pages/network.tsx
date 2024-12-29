import { useEffect, useState } from 'react';

export default function Network() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:3001/api/ws'); // WebSocket endpoint

    ws.onmessage = (message) => {
      console.log("in websocket");
      const event = JSON.parse(message.data); // Parse incoming data
      setEvents((prev) => [...prev, event]); // Append to the list of events
    };

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => ws.close(); // Cleanup on component unmount
  }, []);

  return (
    <div>
      <h1>Real-Time Events</h1>
        {events.map((event, index) => (
          <h1 key={index}>{event}</h1>
        ))}
    </div>
  );
}