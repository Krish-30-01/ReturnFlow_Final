import React, { useState } from 'react';
import { X, Send, Phone, ShieldCheck, UserCheck } from 'lucide-react';
import { ChatMessage, Persona } from '../../types/logistics';

interface ChatDrawerProps {
  isOpen: boolean;
  messages: ChatMessage[];
  currentPersona: Persona;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  messages,
  currentPersona,
  onClose,
  onSendMessage
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const isDriver = currentPersona === 'driver';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickTemplates = isDriver
    ? ['Arrived at pickup dock.', 'Current transit checkpoint: On time.', 'Unloading completed at destination.']
    : ['Please share expected dock arrival time.', 'Forklift is ready at Bay 4.', 'Cargo is packaged and ready.'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 500,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--surface-2)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isDriver ? 'var(--brand-amber)' : 'var(--brand-teal)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9375rem'
              }}
            >
              {isDriver ? 'PS' : 'RK'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.9375rem' }}>
                {isDriver ? 'Priya Sharma (Retailer)' : 'Rajesh Kumar (Driver)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={12} />
                <span>Verified Cross-State Channel</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              className="btn-outline-navy btn-sm"
              style={{ width: '32px', height: '32px', padding: 0 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--brand-teal-light)',
            color: 'var(--brand-teal)',
            fontSize: '0.75rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={14} />
          <span>Active Escrow Protected Booking: TS-07-EA-9912 (NH44 Corridor)</span>
        </div>

        {/* Messages List */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {messages.map((msg) => {
            const isMe = (isDriver && msg.senderRole === 'driver') || (!isDriver && msg.senderRole === 'customer');

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <div
                  style={{
                    backgroundColor: isMe ? (isDriver ? 'var(--brand-teal)' : 'var(--brand-amber)') : 'var(--surface-3)',
                    color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '0.875rem',
                    lineHeight: 1.45,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                    textAlign: isMe ? 'right' : 'left'
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Templates */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {quickTemplates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(tpl)}
              style={{
                fontSize: '0.6875rem',
                padding: '4px 8px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                border: '1px solid var(--border-color)'
              }}
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'var(--surface-2)'
          }}
        >
          <input
            type="text"
            className="form-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message to driver / retailer..."
            style={{ flex: 1, height: '42px' }}
          />
          <button
            type="submit"
            className={isDriver ? 'btn-primary-teal' : 'btn-primary-amber'}
            style={{ height: '42px', padding: '0 16px' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
