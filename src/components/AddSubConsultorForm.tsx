'use client'

import { useRef, useState } from 'react'
import { createSubConsultor } from '@/actions/subconsultores'
import { Loader2, Plus, Users } from 'lucide-react'

export default function AddSubConsultorForm() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'error' | 'success', msg: string} | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const formData = new FormData(e.currentTarget)
    const nome = formData.get('nome') as string
    const telefone = formData.get('telefone') as string
    const comissao = parseFloat(formData.get('comissao') as string)

    const res = await createSubConsultor(nome, telefone, comissao)
    
    setLoading(false)
    if (res.success) {
      setFeedback({ type: 'success', msg: 'Adicionado com sucesso!' })
      formRef.current?.reset()
      setTimeout(() => setFeedback(null), 3000)
    } else {
      setFeedback({ type: 'error', msg: res.error as string })
    }
  }

  return (
    <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col p-6 rounded-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#f4f7f6] flex items-center justify-center">
            <Users className="w-4 h-4 text-[#2d7ff9]" />
        </div>
        <div>
           <h3 className="text-sm uppercase tracking-widest font-extrabold text-[#3a4651]">Novo Membro</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Adicionar um novo sub-consultor à equipe</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
          <input 
            type="text" 
            name="nome" 
            required
            placeholder="Ex: Ana Maria"
            className="w-full px-4 py-2 bg-[#f4f7f6] text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d7ff9] border border-transparent focus:border-[#2d7ff9] transition-all rounded-sm"
          />
        </div>
        
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Telefone (Opcional)</label>
          <input 
            type="text" 
            name="telefone" 
            placeholder="Ex: 11999999999"
            className="w-full px-4 py-2 bg-[#f4f7f6] text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d7ff9] border border-transparent focus:border-[#2d7ff9] transition-all rounded-sm"
          />
        </div>

        <div className="w-full md:w-32 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Comissão (%)</label>
          <input 
            type="number" 
            name="comissao" 
            required
            step="0.1"
            placeholder="Ex: 25"
            className="w-full px-4 py-2 bg-[#f4f7f6] text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d7ff9] border border-transparent focus:border-[#2d7ff9] transition-all rounded-sm font-semibold"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full md:w-auto mt-4 md:mt-0 h-[38px] px-6 bg-[#48a84c] hover:bg-[#3d9140] text-white font-bold tracking-wider text-[11px] uppercase rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Lançar
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
