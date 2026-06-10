'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from(Array.from(raw).map((c) => c.charCodeAt(0)))
}

export function BotaoNotificacoes() {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('loading')
  const [modalVisivel, setModalVisivel] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    ).catch(() => setStatus('unsubscribed'))
  }, [])

  // Abre o modal sempre que o colaborador ainda não ativou
  useEffect(() => {
    if (status === 'unsubscribed' && Notification.permission === 'default') {
      setModalVisivel(true)
    }
  }, [status])

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      const key = sub.getKey('p256dh')
      const auth = sub.getKey('auth')
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: key ? btoa(String.fromCharCode(...Array.from(new Uint8Array(key)))) : '',
          auth: auth ? btoa(String.fromCharCode(...Array.from(new Uint8Array(auth)))) : '',
        }),
      })
      setStatus('subscribed')
      setModalVisivel(false)
    } catch {
      setModalVisivel(false)
    }
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
    }
    setStatus('unsubscribed')
  }

  if (status === 'loading' || status === 'unsupported') return null
  if (status === 'denied') return null

  return (
    <>
      {/* Modal centralizado */}
      {modalVisivel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl flex flex-col items-center text-center">
            <div className="bg-brand-blue/10 rounded-full p-4 mb-4">
              <BellRing size={32} className="text-brand-blue" />
            </div>
            <h2 className="font-display font-bold text-brand-dark text-xl mb-2">
              Ative as notificações
            </h2>
            <p className="text-brand-dark/55 text-sm leading-relaxed mb-6">
              Receba um aviso no celular assim que o seu pagamento for confirmado. Assim você fica sabendo na hora, sem precisar abrir o app.
            </p>
            <button
              onClick={subscribe}
              className="w-full bg-brand-blue text-white font-semibold py-3.5 rounded-2xl text-sm mb-3 active:opacity-80 transition-opacity"
            >
              Ativar notificações
            </button>
            <button
              onClick={() => setModalVisivel(false)}
              className="text-brand-dark/40 text-sm py-1"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Botão sino no header */}
      <button
        onClick={status === 'subscribed' ? unsubscribe : () => setModalVisivel(true)}
        title={status === 'subscribed' ? 'Desativar notificações' : 'Ativar notificações'}
        className={`p-2 rounded-full transition-colors ${
          status === 'subscribed'
            ? 'text-brand-blue bg-brand-blue/10'
            : 'text-brand-dark/40 hover:text-brand-dark/70 hover:bg-black/[0.05]'
        }`}
      >
        {status === 'subscribed' ? <Bell size={16} /> : <BellOff size={16} />}
      </button>
    </>
  )
}
