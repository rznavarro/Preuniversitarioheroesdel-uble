import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { VORTEX_PROFILES } from '../data/profiles';
import { UserProfile } from '../types';
import { Send, Users, ChevronLeft, X, Paperclip } from 'lucide-react';

interface Message {
  id: string;
  from_code: string;
  from_name: string;
  to_code: string | null; // null = broadcast (grupo)
  text: string | null;
  image_url: string | null;
  created_at: string;
}

interface ModuleChatProps {
  currentUser: UserProfile;
}

const ALL_USERS = Object.values(VORTEX_PROFILES).filter(p => p.code !== 'VX-13');

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(code: string) {
  const colors = [
    'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-amber-600',
    'bg-pink-600', 'bg-cyan-600', 'bg-red-600', 'bg-indigo-600',
    'bg-teal-600', 'bg-orange-600', 'bg-rose-600', 'bg-emerald-600',
  ];
  const idx = parseInt(code.replace('VX-', ''), 10) % colors.length;
  return colors[idx];
}

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ModuleChat({ currentUser }: ModuleChatProps) {
  const [selectedContact, setSelectedContact] = useState<UserProfile | 'group' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Load messages when contact changes
  useEffect(() => {
    if (!selectedContact) return;
    setLoadingMsgs(true);
    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel('chat_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const msg = payload.new as Message;
        if (isRelevantMessage(msg)) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function isRelevantMessage(msg: Message): boolean {
    if (!selectedContact) return false;
    if (selectedContact === 'group') return msg.to_code === null;
    const contactCode = selectedContact.code;
    return (
      (msg.from_code === currentUser.code && msg.to_code === contactCode) ||
      (msg.from_code === contactCode && msg.to_code === currentUser.code)
    );
  }

  async function loadMessages() {
    try {
      let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true });

      if (selectedContact === 'group') {
        query = query.is('to_code', null);
      } else if (selectedContact) {
        const contactCode = (selectedContact as UserProfile).code;
        query = query.or(
          `and(from_code.eq.${currentUser.code},to_code.eq.${contactCode}),and(from_code.eq.${contactCode},to_code.eq.${currentUser.code})`
        );
      }

      const { data, error } = await query.limit(100);
      if (!error && data) setMessages(data as Message[]);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  }

  function handleImageSelect(e: Event & { target: HTMLInputElement }) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSend(e: SubmitEvent) {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || sending) return;

    setSending(true);
    let image_url: string | null = null;

    try {
      // Upload image if present
      if (imageFile) {
        const fileName = `chat/${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, imageFile, { contentType: imageFile.type });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(fileName);
          image_url = urlData.publicUrl;
        } else {
          // Fallback: store as base64 in message
          image_url = imagePreview;
        }
      }

      const toCode = selectedContact === 'group' ? null : (selectedContact as UserProfile)?.code ?? null;

      const { error } = await supabase.from('chat_messages').insert([{
        from_code: currentUser.code,
        from_name: currentUser.name,
        to_code: toCode,
        text: text.trim() || null,
        image_url,
      }]);

      if (!error) {
        setText('');
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }

  // Group messages by date
  function groupByDate(msgs: Message[]) {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    msgs.forEach(msg => {
      const d = formatDate(msg.created_at);
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    return groups;
  }

  const contactName = selectedContact === 'group'
    ? 'Grupo — Los Héroes de Ñuble'
    : (selectedContact as UserProfile)?.name ?? '';

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-slate-800 bg-vortex-surface/20">

      {/* LEFT: Contact List */}
      <div className={`w-full md:w-72 flex-shrink-0 border-r border-slate-800 flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-vortex-surface/50">
          <h2 className="text-lg font-serif italic text-white">Chat</h2>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">
            {currentUser.name} — {currentUser.code}
          </p>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          {/* Group Chat */}
          <button
            onClick={() => setSelectedContact('group')}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 ${selectedContact === 'group' ? 'bg-vortex-accent/10 border-l-2 border-l-vortex-accent' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vortex-accent to-red-900 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Grupo General</p>
              <p className="text-[10px] text-slate-500 truncate">Todos los integrantes</p>
            </div>
          </button>

          {/* Individual contacts */}
          {ALL_USERS.filter(u => u.code !== currentUser.code).map(user => (
            <button
              key={user.code}
              onClick={() => setSelectedContact(user)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800/30 ${
                (selectedContact as UserProfile)?.code === user.code
                  ? 'bg-vortex-accent/10 border-l-2 border-l-vortex-accent'
                  : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.code)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-bold text-white">{getInitials(user.name)}</span>
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.code} // {user.targetInstitution}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
        {!selectedContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700 gap-4">
            <Users className="w-16 h-16 opacity-20" />
            <p className="text-sm font-mono italic">Selecciona un contacto para chatear</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-800 bg-vortex-surface/50 flex items-center gap-3">
              <button
                className="md:hidden text-slate-400 hover:text-white"
                onClick={() => setSelectedContact(null)}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {selectedContact === 'group' ? (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vortex-accent to-red-900 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className={`w-9 h-9 rounded-full ${getAvatarColor((selectedContact as UserProfile).code)} flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white">{getInitials((selectedContact as UserProfile).name)}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{contactName}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {selectedContact === 'group' ? `${ALL_USERS.length} integrantes` : (selectedContact as UserProfile).targetInstitution}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-vortex-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-3">
                  <Send className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-mono italic">No hay mensajes aún. ¡Sé el primero!</p>
                </div>
              ) : (
                groupByDate(messages).map(group => (
                  <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest capitalize">{group.date}</span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>
                    {group.messages.map((msg, idx) => {
                      const isMe = msg.from_code === currentUser.code;
                      return (
                        <AnimatePresence key={msg.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-end gap-2 mb-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            {/* Avatar */}
                            {!isMe && (
                              <div className={`w-7 h-7 rounded-full ${getAvatarColor(msg.from_code)} flex items-center justify-center flex-shrink-0 self-end`}>
                                <span className="text-[10px] font-bold text-white">{getInitials(msg.from_name)}</span>
                              </div>
                            )}
                            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                              {/* Sender name (group only, not me) */}
                              {!isMe && selectedContact === 'group' && (
                                <span className="text-[10px] text-slate-500 font-mono mb-1 px-1">{msg.from_name}</span>
                              )}
                              <div
                                className={`rounded-2xl px-4 py-2.5 shadow ${
                                  isMe
                                    ? 'bg-vortex-accent text-white rounded-br-sm'
                                    : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                                }`}
                              >
                                {msg.image_url && (
                                  <img
                                    src={msg.image_url}
                                    alt="Imagen compartida"
                                    className="max-w-full rounded-lg mb-2 max-h-48 object-cover cursor-pointer"
                                    onClick={() => window.open(msg.image_url!, '_blank')}
                                  />
                                )}
                                {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                              </div>
                              <span className={`text-[10px] text-slate-600 mt-1 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-4 py-2 border-t border-slate-800 bg-vortex-surface/50">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover border border-slate-700" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="px-4 py-3 border-t border-slate-800 bg-vortex-surface/70 flex items-center gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleImageSelect}
                id="chat-file-input"
              />
              <label
                htmlFor="chat-file-input"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-800 hover:border-vortex-accent/50 text-slate-500 hover:text-vortex-accent cursor-pointer transition-colors"
                title="Adjuntar imagen o archivo"
              >
                <Paperclip className="w-4 h-4" />
              </label>

              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Mensaje a ${contactName}...`}
                className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-vortex-accent/50 transition-colors placeholder:text-slate-600"
              />

              <motion.button
                type="submit"
                disabled={sending || (!text.trim() && !imageFile)}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-vortex-accent hover:bg-red-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </motion.button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
