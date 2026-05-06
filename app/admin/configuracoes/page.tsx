export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Configurações</h2>

      <div className="grid gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-medium text-gray-700 mb-1">Colaboradores</h3>
          <p className="text-sm text-gray-500">Cadastro e gestão de pintores e ajudantes — em construção.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-medium text-gray-700 mb-1">Valores por Função</h3>
          <p className="text-sm text-gray-500">Definição do valor unitário para pintores e ajudantes — em construção.</p>
        </div>
      </div>
    </div>
  )
}
