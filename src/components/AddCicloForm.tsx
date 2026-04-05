'use client'

import { useRef, useState } from 'react'
import { createCiclo } from '@/actions/ciclos'
import { Loader2, Plus, RefreshCw } from 'lucide-react'

export default function AddCicloForm() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'error' | 'success', msg: string} | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const formData = new FormData(e.currentTarget)
    const codigo = formData.get('codigo') as string
    const dataInicio = new Date(formData.get('dataInicio') as string)
    const dataFim = new Date(formData.get('dataFim') as string)

    // Compensa fuso se necessário (Data pega "00:00:00" do UTC)
    // Para simplificar, enviaremos do jeito que vem do form.
    const res = await createCiclo(codigo, dataInicio, dataFim)
    
    setLoading(false)
    if (res.success) {
      setFeedback({ type: 'success', msg: 'Ciclo iniciado com sucesso!' })
      formRef.current?.reset()
      setTimeout(() => setFeedback(null), 3000)
    } else {
      setFeedback({ type: 'error', msg: res.error as string })
    }
  }

  return (
    <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col p-6 rounded-sm border border-slate-100 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#f4f7f6] flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-[#2d7ff9]" />
        </div>
        <div>
           <h3 className="text-sm uppercase tracking-widest font-extrabold text-[#3a4651]">Novo Ciclo de Vendas</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Definir o período de uma nova campanha</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Código / Nome</label>
          <input 
            type="text" 
            name="codigo" 
            required
            placeholder="Ex: Ciclo 05/2026 ou Dia das Mães"
            className="w-full px-4 py-2 bg-[#f4f7f6] text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d7ff9] border border-transparent focus:border-[#2d7ff9] transition-all rounded-sm"
          />
        </div>
        
        <div className="w-full md:w-36 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data de Início</label>
          <input 
            type="date" 
            name="dataInicio" 
            required
            className="w-full px-4 py-2 bg-[#f4f7f6] text-slate-700 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2d7ff9] border border-transparent focus:border-[#2d7ff9] transition-all rounded-sm"
          />
        </div>

        <div className="w-full md:w-36 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data de Término</label>
          <input 
            type="date" 
            name="dataFim" 
            required
            className="w-full px-4 py-2 bg-[#f4f7f6] text-slate-700 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2d7ff9] border border-transparent focus:border-[#2d7ff9] transition-all rounded-sm"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full md:w-auto mt-4 md:mt-0 h-[38px] px-6 bg-[#48a84c] hover:bg-[#3d9140] text-white font-bold tracking-wider text-[11px] uppercase rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Abrir Ciclo
        </button>
      </form>

      {feedback && (
        <div className={`mt-4 w-full p-3 text-xs font-bold rounded-sm border ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {feedback.msg}
        </div>
      )}
    </div>
  )
}
