'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Bot, Shield, Loader2 } from 'lucide-react';
import { SafetyAssessment, Location } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface IntelligenceAssistantProps {
  location: Location | null;
  assessment: SafetyAssessment | null;
}

export function IntelligenceAssistant({ location, assessment }: IntelligenceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      const locationName = location?.name || 'Global';
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Welcome to ${locationName}! I'm your AI travel assistant. Ask me about safety, weather, local tips, or anything about this destination.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [location, messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          location,
          assessment
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        // Fallback to simple response
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getSimpleResponse(inputValue, assessment),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      setError('Failed to connect. Using offline mode.');
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimpleResponse(inputValue, assessment),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-slate-900/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">AI Travel Assistant</h3>
          <p className="text-xs text-slate-400">
            {location ? `About ${location.name}` : 'Select a destination'}
          </p>
        </div>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/50'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${
                msg.role === 'user' ? 'text-white/60' : 'text-slate-500'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 rounded-2xl px-4 py-3 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
          <p className="text-xs text-amber-400">{error}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-700/50 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about safety, weather, tips..."
            disabled={isLoading}
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}

function getSimpleResponse(query: string, assessment: SafetyAssessment | null): string {
  const q = query.toLowerCase();

  if (!assessment) {
    return "Please select a destination first so I can provide relevant information.";
  }

  if (q.includes('safe') || q.includes('risk') || q.includes('danger')) {
    return `The safety score for this area is ${assessment.score}/100 (${assessment.rating}). ${assessment.summary}`;
  }

  if (q.includes('weather') || q.includes('temperature') || q.includes('temp')) {
    const temp = assessment.weather?.data?.temperature || 'N/A';
    const condition = assessment.weather?.data?.condition || 'Unknown';
    return `Current weather: ${temp}°C, ${condition}. Would you like more details?`;
  }

  if (q.includes('emergency') || q.includes('police') || q.includes('hospital')) {
    return `Emergency contacts: Police ${assessment.emergency?.police || 'N/A'}, Ambulance ${assessment.emergency?.ambulance || 'N/A'}`;
  }

  if (q.includes('tip') || q.includes('advice') || q.includes('recommend')) {
    return assessment.tips?.[0] || "Stay aware of your surroundings and keep valuables secure.";
  }

  if (q.includes('food') || q.includes('restaurant') || q.includes('eat')) {
    return "Local cuisine recommendations depend on your tastes. Would you like safety tips about dining?";
  }

  if (q.includes('transport') || q.includes('taxi') || q.includes('uber') || q.includes('bus')) {
    return "Public transport is generally safe. For taxis, use licensed services and confirm prices upfront.";
  }

  return `I can help with safety, weather, emergency contacts, and travel tips. What would you like to know?`;
}
