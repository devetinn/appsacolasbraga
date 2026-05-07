'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  data_producao: z.string().min(1, 'Data é obrigatória'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  tamanho: z.string().min(1, 'Tamanho é obrigatório'),
  cores: z.coerce.number().int().min(1, 'Mínimo 1 cor'),
  quantidade: z.coerce.number().int().min(1, 'Quantidade deve ser maior que 0'),
  parceiro_id: z.string().min(1, 'Selecione um parceiro'),
})

type FormData = z.infer<typeof schema>

interface FormRegistroProps {
  parceiros: { id: string; nome: string }[]
  onSubmit: (data: FormData) => Promise<void>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-brand-dark/40">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-sans text-red-500">{error}</p>}
    </div>
  )
}

const inputClass = 'w-full rounded-xl border border-black/[0.08] bg-brand-cream px-4 py-3 text-sm font-sans text-brand-dark placeholder-brand-dark/25 focus:outline-none focus:ring-2 focus:ring-brand-blue/25 focus:border-brand-blue/50 transition-all'

export function FormRegistro({ parceiros, onSubmit }: FormRegistroProps) {
  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { data_producao: today, cores: 1 },
    })

  async function handleFormSubmit(data: FormData) {
    await onSubmit(data)
    reset({ data_producao: today, cores: 1 })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field label="Data" error={errors.data_producao?.message}>
        <input type="date" {...register('data_producao')} className={inputClass} />
      </Field>

      <Field label="Marca" error={errors.marca?.message}>
        <input placeholder="Ex: Hering" {...register('marca')} className={inputClass} />
      </Field>

      <Field label="Tamanho" error={errors.tamanho?.message}>
        <input placeholder="Ex: 30x45" {...register('tamanho')} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cores" error={errors.cores?.message}>
          <input type="number" min={1} {...register('cores')} className={inputClass} />
        </Field>
        <Field label="Quantidade" error={errors.quantidade?.message}>
          <input type="number" min={1} placeholder="0" {...register('quantidade')} className={inputClass} />
        </Field>
      </div>

      <Field label="Parceiro" error={errors.parceiro_id?.message}>
        <select {...register('parceiro_id')} className={inputClass}>
          <option value="">Selecione o parceiro</option>
          {parceiros.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-blue text-white font-sans font-semibold rounded-xl py-3.5 text-sm hover:bg-brand-blue/90 active:scale-[0.98] transition-all disabled:opacity-60 shadow-md shadow-brand-blue/15 mt-2"
      >
        {isSubmitting ? 'Salvando...' : 'Registrar Produção'}
      </button>
    </form>
  )
}
