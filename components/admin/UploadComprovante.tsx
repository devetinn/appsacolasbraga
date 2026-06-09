'use client'

import { useRef, useState } from 'react'
import { Paperclip, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UploadComprovanteProps {
  payoutId: string
  comprovanteUrl: string | null
  onUpload: () => void
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,application/pdf'
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export function UploadComprovante({ payoutId, comprovanteUrl, onUpload }: UploadComprovanteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      setErro('Arquivo muito grande. Máximo: 5MB.')
      return
    }

    setErro('')
    setUploading(true)

    try {
      // 1. Obter signed URL do servidor
      const res = await fetch('/api/pagamentos/comprovante/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, contentType: file.type }),
      })

      if (!res.ok) throw new Error('Erro ao obter URL de upload')

      const { token, path } = await res.json()

      // 2. Upload direto ao Supabase Storage via token
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('documentos-pagamentos')
        .uploadToSignedUrl(path, token, file, { contentType: file.type, upsert: true })

      if (uploadError) throw uploadError

      // 3. Salvar path no payout
      const patchRes = await fetch('/api/pagamentos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payoutId, comprovante_url: path }),
      })

      if (!patchRes.ok) throw new Error('Erro ao salvar comprovante')

      onUpload()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : comprovanteUrl ? (
          <CheckCircle2 size={12} className="text-green-500" />
        ) : (
          <Paperclip size={12} />
        )}
        {uploading
          ? 'Enviando...'
          : comprovanteUrl
          ? 'Substituir Comprovante'
          : 'Anexar Comprovante'}
      </button>

      {erro && (
        <p className="text-[10px] text-red-500 mt-1">{erro}</p>
      )}
    </div>
  )
}
