import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Send, Trash2, AtSign, Clock, MessageSquare, ShieldCheck } from 'lucide-react';
import { Note, Application } from '../../data/applications';
import { mockApi, User } from '../../lib/api/mockApi';

interface InternalNotesProps {
  application: Application;
  onUpdate: () => void;
}

export function InternalNotes({ application, onUpdate }: InternalNotesProps) {
  const [notes, setNotes] = useState<Note[]>(application.notes || []);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [agents, setAgents] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotes(application.notes || []);
    const user = mockApi.getCurrentUser();
    setCurrentUser(user);
    loadAgents();
  }, [application.id, application.notes]);

  // Scroll to bottom is now manually triggered after adding a note
  // to prevent annoying auto-scroll on mount/other updates.

  const loadAgents = async () => {
    const allUsers = await mockApi.getUsers();
    setAgents(allUsers.filter(u => u.role === 'admin' || u.role === 'agent'));
  };

  const scrollToBottom = () => {
    notesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const note = await mockApi.addNote(application.id, newNote);
      if (note) {
        setNewNote('');
        onUpdate();
        
        // Only scroll to bottom when the user explicitly sends a message
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        
        // Handle mentions in console for demo
        const mentions = newNote.match(/@(\w+)/g);
        if (mentions) {
          console.log("System Notification: Agent mentioned in note", mentions);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this internal note?")) return;
    const ok = await mockApi.deleteNote(application.id, noteId);
    if (ok) onUpdate();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewNote(value);

    // Mention logic
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && !textBeforeCursor.slice(lastAt + 1).includes(' ')) {
      setShowMentions(true);
      setMentionQuery(textBeforeCursor.slice(lastAt + 1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (agent: User) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeAt = newNote.slice(0, newNote.lastIndexOf('@', cursorPosition - 1));
    const textAfterCursor = newNote.slice(cursorPosition);
    
    setNewNote(`${textBeforeAt}@${agent.firstName} ${textAfterCursor}`);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredAgents = agents.filter(a => 
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(mentionQuery)
  );

  return (
    <div className="flex flex-col h-[500px] bg-white border border-black/5 rounded-[32px] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 border-b border-black/5 flex items-center justify-between bg-black/[0.01]">
        <div className="flex items-center gap-3">
          <MessageSquare size={16} className="text-black/40" />
          <h3 className="text-[10px] items-center gap-2 uppercase tracking-widest font-bold flex">
            Internal Communications
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full lowercase text-[9px] font-medium tracking-normal">
              <Lock size={10} /> internal only
            </span>
          </h3>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-black/10 text-[10px] font-bold uppercase tracking-widest gap-4 opacity-50">
            <ShieldCheck size={48} />
            No internal notes for this case
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-10 h-10 rounded-2xl bg-black/5 flex items-center justify-center shrink-0 border border-black/5 overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.authorName}${note.authorId}`} 
                  alt={note.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{note.authorName}</span>
                    <span className="text-[10px] text-black/20 flex items-center gap-1 font-medium">
                      <Clock size={10} /> {timeAgo(note.createdAt)}
                    </span>
                  </div>
                  {(note.authorId === currentUser?.id || currentUser?.role === 'admin') && (
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="text-[13px] text-black/70 leading-relaxed font-medium whitespace-pre-wrap">
                  {note.text.split(/(@\w+\s\w+|@\w+)/g).map((part, i) => (
                    part.startsWith('@') ? (
                      <span key={i} className="text-blue-600 font-bold bg-blue-500/5 px-1 rounded">
                        {part}
                      </span>
                    ) : part
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={notesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-black/[0.01] border-t border-black/5 relative">
        <AnimatePresence>
          {showMentions && filteredAgents.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-6 mb-2 w-64 bg-white border border-black/5 rounded-2xl shadow-2xl overflow-hidden z-20"
            >
              <div className="p-3 border-b border-black/5 bg-black/[0.02]">
                <p className="text-[8px] uppercase tracking-widest font-bold text-black/40">Mention Team Member</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => insertMention(agent)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-black/5 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-black/5 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.email}`} alt={agent.firstName} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">{agent.firstName} {agent.lastName}</span>
                      <span className="text-[8px] text-black/40 uppercase tracking-widest">{agent.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3 bg-white p-4 border border-black/5 rounded-[24px] shadow-sm">
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            placeholder="Type your note... use @ to mention"
            className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium placeholder:text-black/20 resize-none max-h-32 min-h-[40px] p-0"
          />
          <button 
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSubmitting}
            className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shrink-0 shadow-lg shadow-black/10"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
