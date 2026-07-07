'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Megaphone, 
  Headphones, 
  BarChart3,
  Crown,
  Send,
  User,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageCircle,
  Phone,
  Bell,
  FileText,
  MessageSquare,
  RefreshCcw,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/lib/supabase';

// TODO: Implement real auth and dynamic business switching
const BUSINESS_ID = "11111111-1111-1111-1111-111111111111"; 

const AGENTS = [
  { id: 'sales', name: 'Sales AI', icon: TrendingUp },
  { id: 'finance', name: 'Finance AI', icon: DollarSign },
  { id: 'inventory', name: 'Inventory AI', icon: Package },
  { id: 'marketing', name: 'Marketing AI', icon: Megaphone },
  { id: 'support', name: 'Support AI', icon: Headphones },
  { id: 'analysis', name: 'Analysis AI', icon: BarChart3 },
];

type ActionLog = {
  channel: string;
  target: string;
  message: string;
};

type Message = {
  id: string;
  role: 'user' | 'ceo';
  content: string;
  agentDetails?: Record<string, string>;
  actionsTaken?: { executed: ActionLog[]; failed: ActionLog[] };
  isError?: boolean;
  isRetryable?: boolean;
};

type NotificationLog = {
  id: string;
  created_at: string;
  channel: string;
  customer_id: string | null;
  status: string;
  message: string;
};

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<Record<string, 'idle' | 'working' | 'done'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [showLatencyWarning, setShowLatencyWarning] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadLogs() {
      if (activeTab === 'logs') {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('business_id', BUSINESS_ID)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data && mounted) setLogs(data);
      }
    }
    loadLogs();
    return () => { mounted = false; };
  }, [activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryOverride?: string) => {
    const query = queryOverride || input;
    if (!query.trim() || loading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!queryOverride) setInput('');
    setLoading(true);
    setAgentStatus({});
    setShowLatencyWarning(false);

    const latencyTimer = setTimeout(() => {
      setShowLatencyWarning(true);
    }, 20000);

    try {
      const response = await fetch('/api/orchestrate?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ businessId: BUSINESS_ID, query: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          clearTimeout(latencyTimer);
          setShowLatencyWarning(false);
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.substring(6);
              try {
                const event = JSON.parse(dataStr);
                if (event.type === 'agents_selected') {
                  const newStatus: Record<string, 'idle' | 'working' | 'done'> = {};
                  event.agents.forEach((a: string) => { newStatus[a] = 'working'; });
                  setAgentStatus(prev => ({ ...prev, ...newStatus }));
                } else if (event.type === 'agent_complete') {
                  setAgentStatus(prev => ({ ...prev, [event.agent]: 'done' }));
                } else if (event.type === 'final') {
                  setMessages(prev => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      role: 'ceo',
                      content: event.finalResponse,
                      agentDetails: event.agentResponses
                    }
                  ]);
                  setTimeout(() => setAgentStatus({}), 2000);
                } else if (event.type === 'actions_taken') {
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg && lastMsg.role === 'ceo') {
                      lastMsg.actionsTaken = { executed: event.executed, failed: event.failed };
                    }
                    return newMsgs;
                  });
                } else if (event.error) {
                  console.error("Event error:", event.error);
                  setMessages(prev => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      role: 'ceo',
                      content: `Error: ${event.error}`
                    }
                  ]);
                  setTimeout(() => setAgentStatus({}), 2000);
                }
              } catch (e) {
                console.error("Failed to parse SSE event", e);
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error(err);
      clearTimeout(latencyTimer);
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(), 
        role: 'ceo', 
        content: "CEO AI is having trouble reaching the team right now — try again in a moment.",
        isError: true,
        isRetryable: true
      }]);
      setAgentStatus({});
    } finally {
      setLoading(false);
      clearTimeout(latencyTimer);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-[260px] flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Crown className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">NexusOS AI</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="space-y-1 mb-6">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'chat' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">CEO Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'logs' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Action Logs</span>
            </button>
          </div>
          
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-2">AI Employees</h2>
          {AGENTS.map(agent => {
            const Icon = agent.icon;
            const status = agentStatus[agent.id] || 'idle';
            return (
              <div key={agent.id} className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-slate-800/50 transition-colors">
                <Icon className="w-5 h-5 text-slate-400" />
                <span className="flex-1 text-sm font-medium text-slate-300">{agent.name}</span>
                <div className="relative flex h-2.5 w-2.5">
                  {status === 'working' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-all duration-300 ${
                    status === 'idle' ? 'bg-slate-600' :
                    status === 'working' ? 'bg-yellow-500' :
                    'bg-emerald-500'
                  }`}></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Header */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-900/50 backdrop-blur-sm z-10">
          <h2 className="text-lg font-semibold text-white">Bella Vista Restaurant</h2>
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-slate-400 hover:text-white">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Demo
          </Button>
        </div>

        {activeTab === 'logs' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-xl font-semibold mb-6 text-slate-100">Recent Automated Actions</h3>
            <div className="border border-slate-800 rounded-md bg-slate-900/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-900/80">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Time</TableHead>
                    <TableHead className="text-slate-400">Channel</TableHead>
                    <TableHead className="text-slate-400">Target</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow className="border-slate-800">
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">No actions taken yet.</TableCell>
                    </TableRow>
                  ) : (
                    logs.map(log => (
                      <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="text-slate-300 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-slate-300 capitalize">{log.channel}</TableCell>
                        <TableCell className="text-slate-300 font-medium">
                          {log.customer_id ? 'Customer' : 'System/Supplier'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={log.status === 'sent' ? 'border-emerald-500/30 text-emerald-500' : 'border-amber-500/30 text-amber-500'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs max-w-xs truncate" title={log.message}>
                          {log.message}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <Crown className="w-16 h-16 text-slate-800" />
              <p className="text-lg font-medium text-slate-400">Ask your AI Workforce a question to get started.</p>
              <p className="text-sm text-slate-600 text-center max-w-sm">
                Try asking about recent revenue, feedback on food quality, or if any items need restocking.
              </p>
            </div>
          )}
          
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="shrink-0 pt-1">
                {msg.role === 'user' ? (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
                    <Crown className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
              </div>
              
              <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`px-5 py-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' 
                    : msg.isError
                    ? 'bg-slate-900 border border-amber-900/50 text-amber-200 rounded-tl-sm shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                }`}>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-slate-100 mt-4 mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-slate-100 mt-3 mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-200 mt-2 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="marker:text-slate-500" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-slate-200" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto mb-3"><table className="w-full text-left border-collapse" {...props} /></div>,
                        th: ({node, ...props}) => <th className="border-b border-slate-700 py-2 px-3 font-semibold text-slate-300" {...props} />,
                        td: ({node, ...props}) => <td className="border-b border-slate-800 py-2 px-3 text-slate-400" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.isRetryable && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSend([...messages].reverse().find(m => m.role === 'user')?.content)} 
                      className="mt-3 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Retry Query
                    </Button>
                  )}
                </div>

                {msg.agentDetails && Object.keys(msg.agentDetails).length > 0 && (
                  <Collapsible className="w-full mt-2 group">
                    <CollapsibleTrigger className="h-8 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 p-2 flex items-center gap-1 rounded-md transition-colors w-max">
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      Show agent details
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-3 animate-in slide-in-from-top-1">
                      {Object.entries(msg.agentDetails).map(([agent, response]) => (
                        <Card key={agent} className="bg-slate-900/50 border-slate-800 p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                              {agent.toUpperCase()} AI
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-base font-bold text-slate-200 mt-3 mb-1" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-sm font-bold text-slate-200 mt-2 mb-1" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-semibold text-slate-200" {...props} />
                              }}
                            >
                              {response}
                            </ReactMarkdown>
                          </div>
                        </Card>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {msg.actionsTaken && (msg.actionsTaken.executed.length > 0 || msg.actionsTaken.failed.length > 0) && (
                  <Collapsible className="w-full mt-2 group">
                    <CollapsibleTrigger className="h-9 text-xs text-slate-300 border border-slate-700 bg-slate-900/50 hover:bg-slate-800 p-2 flex items-center gap-2 rounded-md w-full justify-start transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {msg.actionsTaken.executed.length} actions taken
                      {msg.actionsTaken.failed.length > 0 && (
                        <span className="text-amber-500 ml-1">({msg.actionsTaken.failed.length} failed)</span>
                      )}
                      <ChevronDown className="w-4 h-4 ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 animate-in slide-in-from-top-1">
                      {msg.actionsTaken.executed.map((action, i) => (
                        <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-md p-3 flex gap-3 text-xs shadow-sm">
                          <div className="shrink-0 mt-0.5 text-emerald-500">
                            {action.channel === 'email' ? <Mail className="w-4 h-4" /> :
                             action.channel === 'whatsapp' ? <MessageCircle className="w-4 h-4" /> :
                             action.channel === 'sms' ? <Phone className="w-4 h-4" /> :
                             <Bell className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 text-slate-300">
                            <span className="font-semibold text-slate-200 block mb-1">To: {action.target}</span>
                            <div className="text-slate-400 whitespace-pre-wrap">{action.message}</div>
                          </div>
                        </div>
                      ))}
                      {msg.actionsTaken.failed.map((action, i) => (
                        <div key={`fail-${i}`} className="bg-slate-900/80 border border-amber-900/50 rounded-md p-3 flex gap-3 text-xs shadow-sm">
                          <div className="shrink-0 mt-0.5 text-amber-500">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 text-slate-300">
                            <span className="font-semibold text-amber-500/80 block mb-1">Failed to send via {action.channel}</span>
                            <div className="text-slate-400 whitespace-pre-wrap">{action.message}</div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="shrink-0 pt-1">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
                  <Crown className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="px-5 py-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-sm shadow-sm flex items-center min-w-[120px] h-[52px]">
                  <div className="flex items-center gap-1.5 h-5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
                {showLatencyWarning && (
                  <span className="text-xs text-slate-500 italic ml-1">Still working on it — complex questions take a bit longer</span>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 shrink-0 relative z-20">
          {messages.length === 0 && (
            <div className="max-w-4xl mx-auto flex flex-wrap gap-2 mb-4">
              {[
                "Why did our revenue drop this month?",
                "How is my business performing today?",
                "Which products should I restock?",
                "Any customers we should follow up with?"
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="max-w-4xl mx-auto relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask your AI Workforce..."
              className="w-full bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-14 pl-5 pr-14 rounded-full focus-visible:ring-indigo-500 shadow-xl text-base"
              disabled={loading}
            />
            <Button 
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="absolute right-2 h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 disabled:bg-slate-700 disabled:text-slate-500"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
