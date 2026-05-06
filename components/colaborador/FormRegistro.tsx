'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
        <Input type="date" {...register('data_producao')} />
        {errors.data_producao && <p className="text-red-500 text-xs mt-1">{errors.data_producao.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
        <Input placeholder="Ex: Hering" {...register('marca')} />
        {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
        <Input placeholder="Ex: 30x45" {...register('tamanho')} />
        {errors.tamanho && <p className="text-red-500 text-xs mt-1">{errors.tamanho.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cores</label>
          <Input type="number" min={1} {...register('cores')} />
          {errors.cores && <p className="text-red-500 text-xs mt-1">{errors.cores.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
          <Input type="number" min={1} placeholder="0" {...register('quantidade')} />
          {errors.quantidade && <p className="text-red-500 text-xs mt-1">{errors.quantidade.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parceiro de Trabalho</label>
        <select
          {...register('parceiro_id')}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Selecione o parceiro</option>
          {parceiros.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        {errors.parceiro_id && <p className="text-red-500 text-xs mt-1">{errors.parceiro_id.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Registrar Produção'}
      </Button>
    </form>
  )
}
