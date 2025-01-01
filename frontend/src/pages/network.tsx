import { ScoreStats } from '../types/types';
import { useEffect, useState, useReducer } from 'react';

const statsReducer = (state: ScoreStats, action: {type:string,payload:number}): ScoreStats => {
  switch (action.type) {
    case 'ADD_SCORE':
      const newCount = state.count + 1;
      const newTotal = state.total + action.payload;
      return {
        count: newCount,
        total: newTotal,
        average: newTotal / newCount
      };
    default:
      return state;
  }
};

export default function Network() {
  const [events, setEvents] = useState<number[]>([]);
  const [stats, dispatch] = useReducer(statsReducer, {
    average: 0,
    count: 0,
    total: 0
  });

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:3001/api/ws');

    ws.onmessage = (message) => {
      const score = JSON.parse(message.data);
      if (typeof score === 'number') {
        setEvents(prev => [...prev.slice(-29), score]);
        dispatch({ type: 'ADD_SCORE', payload: score });
      }
    };

    ws.onopen = () => console.log('WebSocket connection established');
    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onclose = () => console.log('WebSocket closed');

    return () => ws.close();
  }, []);

  return (
    <div className="p-4 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-600">Real-Time Sentiment Analysis</h1>
      
      <div className="mb-6 p-6 bg-gray-100 rounded-lg shadow-sm">
        <p className="text-xl mb-3">
          <span className="font-semibold text-gray-700">Average Sentiment: </span>
          <span className={`ml-2 text-2xl font-bold ${
            stats.average > 0 
              ? 'text-green-600' 
              : stats.average < 0 
                ? 'text-red-600' 
                : 'text-gray-600'
          }`}>
            {stats.average.toFixed(3)}
          </span>
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-medium">Total Scores Analyzed: </span>
          <span className="font-semibold">{stats.count}</span>
        </p>
      </div>

      <div className="space-y-3">
        {events.map((score, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg shadow-sm text-lg font-medium ${
              score > 0 
                ? 'bg-green-100 text-green-900' 
                : score < 0 
                  ? 'bg-red-100 text-red-900' 
                  : 'bg-gray-100 text-gray-900'
            }`}
          >
            Score: {score.toFixed(3)}
          </div>
        ))}
      </div>
    </div>
  );
}