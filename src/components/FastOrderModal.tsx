import { useState, useEffect } from 'react'
import { parseFastOrder, ParsedItem } from '@/actions/parseNLP'
import { confirmGridOrder } from '@/actions/pedidos'
import { getSubConsultores } from '@/actions/subconsultores'
import { getCiclos, getCicloAtivo } from '@/actions/ciclos'
import { X, Loader2, Sparkles, ArrowRight, CheckCircle2, Trash, User, Calendar, Plus } from 'lucide-react'

export default function FastOrderModal({ customButton = false }: { customButton?: boolean }) {
  const [open, setOpen] = useState(false)
  
  // Lists for selection
  const [subConsultores, setSubConsultores] = useState<any[]>([])
  const [ciclos, setCiclos] = useState<any[]>([])
  
  // Selections
  const [selectedSubId, setSelectedSubId] = useState('')
  const [selectedCicloId, setSelectedCicloId] = useState('')

  // UI state
  const [showSmartInput, setShowSmartInput] = useState(false)

  // Step 1: Parsing
  const [text, setText] = useState('')
  const [loadingParse, setLoadingParse] = useState(false)
  
  // Step 2: Grid confirmation
  const [step, setStep] = useState<1 | 2>(1)
  const [parsedData, setParsedData] = useState<{
    subConsultorId: string, 
    subConsultorNome: string,
    subConsultorComissao: number,
    cicloId: string,
    cicloNome: string,
    items: ParsedItem[]
  } | null>(null)
  
  const [margemMaster, setMargemMaster] = useState<number>(35) 
  const [loadingConfirm, setLoadingConfirm] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success', msg: string } | null>(null)

  // -- FETCH DATA --
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const [subs, cics, activeCiclo] = await Promise.all([
          getSubConsultores(),
          getCiclos(),
          getCicloAtivo()
        ])
        setSubConsultores(subs)
        setCiclos(cics)
        if (activeCiclo) setSelectedCicloId(activeCiclo.id)
      }
      fetchData()
    }
  }, [open])

  // -- STEP 1 ACTIONS --
  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoadingParse(true)
    setFeedback(null)
    
    const res = await parseFastOrder(text)
    
    setLoadingParse(false)
    if (res.success && res.subConsultor && res.ciclo && res.items) {
      setParsedData({
         subConsultorId: res.subConsultor.id,
         subConsultorNome: res.subConsultor.nome,
         subConsultorComissao: res.subConsultor.comissao,
         cicloId: res.ciclo.id,
         cicloNome: res.ciclo.codigo,
         items: res.items
      })
      setSelectedSubId(res.subConsultor.id)
      setSelectedCicloId(res.ciclo.id)
      setStep(2)
    } else {
      setFeedback({ type: 'error', msg: res.message! })
    }
  }

  const handleNextStep = () => {
    if (!selectedSubId || !selectedCicloId) {
      setFeedback({ type: 'error', msg: 'Selecione o consultor e o ciclo primeiro.' })
      return
    }

    const sub = subConsultores.find(s => s.id === selectedSubId)
    const ciclo = ciclos.find(c => c.id === selectedCicloId)

    if (sub && ciclo) {
      setParsedData({
        subConsultorId: sub.id,
        subConsultorNome: sub.nome,
        subConsultorComissao: sub.comissao,
        cicloId: ciclo.id,
        cicloNome: ciclo.codigo,
        items: [{ id: Math.random().toString(), quantidade: 1, nome: '', codigo: '', valorUnico: 0, valorTotal: 0 }] // Start with empty items if manual
      })
      setStep(2)
    }
  }

  // -- STEP 2 ACTIONS --
  const updateItem = (id: string, field: keyof ParsedItem, value: string | number) => {
    if(!parsedData) return;
    const newItems = parsedData.items.map(i => {
      if(i.id === id) {
        const updated = { ...i, [field]: value }
        if(field === 'quantidade' || field === 'valorUnico') {
          updated.valorTotal = updated.quantidade * updated.valorUnico;
        }
        return updated;
      }
      return i;
    })
    setParsedData({ ...parsedData, items: newItems })
  }

  const removeItem = (id: string) => {
    if(!parsedData) return;
    setParsedData({ ...parsedData, items: parsedData.items.filter(i => i.id !== id) })
  }

  const handleConfirm = async () => {
    if(!parsedData || parsedData.items.length === 0) return;
    setLoadingConfirm(true)
    setFeedback(null)

    // Ensure types matching the server action
    const itemsPayload = parsedData.items.map(i => ({
       nome: i.nome,
       codigo: i.codigo || '',
       quantidade: i.quantidade,
       valorUnico: i.valorUnico,
       valorTotal: i.valorTotal
    }))

    const res = await confirmGridOrder(
      parsedData.cicloId,
      parsedData.subConsultorId,
      margemMaster,
      itemsPayload,
      text // pass pure text as observation
    )

    setLoadingConfirm(false)
    if (res.success) {
      setFeedback({ type: 'success', msg: 'Pedido confirmado e registrado com sucesso!' })
      setTimeout(() => {
        setOpen(false)
        setStep(1)
        setText('')
        setParsedData(null)
        setFeedback(null)
      }, 2000)
    } else {
      setFeedback({ type: 'error', msg: res.error as string })
    }
  }

  const totalCarrinho = parsedData?.items.reduce((acc, curr) => acc + curr.valorTotal, 0) || 0;
  const lucroPrevisto = totalCarrinho * ((margemMaster - (parsedData?.subConsultorComissao || 0)) / 100);

     const lucroSubConsultor = totalCarrinho * ((parsedData?.subConsultorComissao || 0) / 100);
    
  const totalAPagarSubConsultor = totalCarrinho * (1 - ((parsedData?.subConsultorComissao || 0) / 100)); // O que o Master vai pagar no boleto da Natura

  const totalAPagarReal = totalCarrinho * (1 - (margemMaster / 100)); // O que o Master vai pagar no boleto da Natura

  return (
    <>
      {customButton ? (
         <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-md px-4 py-1.5 transition-colors text-sm font-semibold border border-white/10 shadow-sm">
           <Sparkles className="w-4 h-4" /> Carrinho Inteligente
         </button>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          className="bg-[#2d7ff9] hover:bg-[#1e61cc] text-white rounded-md px-6 py-2 transition-all shadow-sm flex items-center"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Carrinho Inteligente
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded border border-slate-200 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-[#eaedf1] bg-[#fbfcfd]">
              <h2 className="text-base font-extrabold uppercase tracking-widest flex items-center gap-2 text-[#3a4651]">
                {step === 1 ? '1. Extração de Itens' : '2. Confirmação do Carrinho'}
              </h2>
              <button 
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
              
              {step === 1 && (
                <div className="p-8 flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sub-consultor Select */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
                        <User size={12} className="text-[#2d7ff9]" /> Selecionar Sub-Consultor(a)
                      </label>
                      <select 
                        value={selectedSubId}
                        onChange={(e) => setSelectedSubId(e.target.value)}
                        className="w-full p-3 bg-[#f4f7f6] border border-slate-200 outline-none rounded text-sm font-bold text-[#3a4651] focus:border-[#2d7ff9] transition-all cursor-pointer"
                      >
                        <option value="">Selecione...</option>
                        {subConsultores.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.nome}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ciclo Select */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2">
                        <Calendar size={12} className="text-[#2d7ff9]" /> Ciclo Disponível
                      </label>
                      <select 
                        value={selectedCicloId}
                        onChange={(e) => setSelectedCicloId(e.target.value)}
                        className="w-full p-3 bg-[#f4f7f6] border border-slate-200 outline-none rounded text-sm font-bold text-[#3a4651] focus:border-[#2d7ff9] transition-all cursor-pointer"
                      >
                        <option value="">Selecione...</option>
                        {ciclos.map(cic => (
                          <option key={cic.id} value={cic.id}>{cic.codigo} ({cic.status})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Smart Input Toggle */}
                  <div className="border-t border-slate-100 pt-6">
                    <button 
                      onClick={() => setShowSmartInput(!showSmartInput)}
                      className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#2d7ff9] tracking-widest hover:opacity-80 transition-all"
                    >
                      <Sparkles size={14} /> 
                      {showSmartInput ? 'Esconder Modo Inteligente' : 'Possui o pedido em texto? (Usar Modo Inteligente)'}
                    </button>

                    {showSmartInput && (
                      <form onSubmit={handleParse} className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-[10px] text-slate-400 mb-3 font-medium uppercase tracking-tight">
                          Cole o texto do pedido abaixo para extração automática:
                        </p>
                        <textarea 
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Ex: Maria ciclo 6, 2 perfumes cod 123, 1 sabonete..."
                          className="w-full min-h-[120px] p-4 bg-[#f4f7f6] border border-slate-200 focus:border-[#2d7ff9] outline-none rounded text-[#3a4651] font-medium text-sm shadow-inner transition-all"
                          autoFocus
                        ></textarea>
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            type="submit" 
                            disabled={loadingParse || !text.trim()}
                            className="px-6 py-2 bg-[#2d7ff9] hover:bg-[#1e61cc] text-white font-bold text-[10px] uppercase tracking-widest rounded flex items-center shadow-sm disabled:opacity-50 transition-all"
                          >
                            {loadingParse ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                            {loadingParse ? 'Processando...' : 'Processar Texto e Avançar'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {feedback && step === 1 && !showSmartInput && (
                    <div className="p-3 bg-red-50 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider text-center">
                      {feedback.msg}
                    </div>
                  )}

                  {!showSmartInput && (
                    <div className="mt-auto pt-6 flex justify-end">
                      <button 
                        onClick={handleNextStep}
                        className="px-8 py-3 bg-[#3a4651] hover:bg-[#2c353d] text-white font-extrabold text-[11px] uppercase tracking-widest rounded flex items-center shadow-md transition-all group"
                      >
                        Próximo Passo: Montar Carrinho
                        <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && parsedData && (
                <div className="p-6 flex flex-col gap-6 ">
                  
                  {/* Context Header */}
                  <div className="flex flex-wrap gap-4 p-4 bg-[#f4f7f6] rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Consultor(a) Identificado</span>
                      <span className="text-sm font-extrabold text-[#3a4651]">{parsedData.subConsultorNome} <span className="text-slate-400 font-medium">({parsedData.subConsultorComissao}%)</span></span>
                    </div>
                    <div className="w-px bg-slate-300"></div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Ciclo Destino</span>
                      <span className="text-sm font-extrabold text-[#3a4651]">{parsedData.cicloNome}</span>
                    </div>
                    <div className="w-px bg-slate-300"></div>
                    {/* <div>
                      <span className="text-[10px] uppercase font-bold text-[#e15526] block tracking-widest">Sua Margem Master (%)</span>
                      <input 
                         type="number"
                         value={margemMaster}
                         onChange={(e) => setMargemMaster(parseFloat(e.target.value) || 0)}
                         className="w-20 bg-white border border-[#e15526]/30 rounded px-2 py-0.5 text-sm font-bold text-[#e15526] outline-none"
                      />
                    </div> */}
                  </div>

                  {/* Editable Grid */}
                  <div className="border border-[#eaedf1] rounded overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-[#fbfcfd]">
                          <tr className="border-b border-[#eaedf1]">
                            <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-bold text-slate-500 w-16">Qtd</th>
                            <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-bold text-slate-500">Produto</th>
                            <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-bold text-slate-500 w-24">Código</th>
                            <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-bold text-slate-500 w-32">Valor (Un)</th>
                            <th className="py-3 px-4 text-[10px] uppercase tracking-wider font-bold text-[#3a4651] w-32">Total Linha</th>
                            <th className="py-3 px-4 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.items.map((item) => (
                             <tr key={item.id} className="border-b border-slate-50">
                               <td className="p-2">
                                 <input type="number" min="1" value={item.quantidade} onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value)||1)} className="w-full p-2 bg-[#f4f7f6] outline-none text-[#3a4651] font-semibold text-center text-sm rounded border border-transparent focus:border-[#2d7ff9]"/>
                               </td>
                               <td className="p-2">
                                 <input type="text" value={item.nome} onChange={(e) => updateItem(item.id, 'nome', e.target.value)} className="w-full p-2 bg-[#f4f7f6] outline-none text-[#3a4651] font-medium text-sm rounded border border-transparent focus:border-[#2d7ff9]"/>
                               </td>
                               <td className="p-2">
                                 <input type="text" placeholder="--" value={item.codigo} onChange={(e) => updateItem(item.id, 'codigo', e.target.value)} className="w-full p-2 bg-[#f4f7f6] outline-none text-[#3a4651] text-sm font-mono rounded border border-transparent focus:border-[#2d7ff9]"/>
                               </td>
                               <td className="p-2">
                                 <div className="relative">
                                   <span className="absolute left-3 top-2.5 text-xs font-bold text-[#3a4651]/50">R$</span>
                                   <input type="number" step="0.01" value={item.valorUnico} onChange={(e) => updateItem(item.id, 'valorUnico', parseFloat(e.target.value)||0)} className="w-full p-2 pl-8 bg-[#f4f7f6] outline-none text-sm font-bold text-[#3a4651] rounded border border-transparent focus:border-[#2d7ff9]"/>
                                 </div>
                               </td>
                               <td className="p-4 font-extrabold text-[#3a4651] text-sm">
                                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal)}
                               </td>
                               <td className="p-2 text-center">
                                 <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"><Trash className="w-4 h-4"/></button>
                               </td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Add manual line btn */}
                    <button 
                      onClick={() => setParsedData({...parsedData, items: [...parsedData.items, { id: Math.random().toString(), quantidade: 1, nome: '', codigo: '', valorUnico: 0, valorTotal: 0 }]})}
                      className="w-full py-3 bg-white text-xs font-bold uppercase tracking-widest text-[#2d7ff9] hover:bg-[#f4f7f6] transition-colors"
                    >
                      + Adicionar Linha Manual
                    </button>
                  </div>

                  {/* Resumo Final */}
                  <div className="flex justify-end pt-4">
                    <div className="w-[340px] bg-[#fbfcfd] border border-slate-200 rounded p-5 flex flex-col gap-3 shadow-sm">
                       
                       <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider pb-2 border-b border-slate-100">
                         <span>Valor de Catálogo</span>
                         <span className="text-[#3a4651] font-extrabold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCarrinho)}</span>
                       </div>

                       <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold  tracking-wider">
                         <span>Lucro da(o) Consultor(a)</span>
                         <span className="text-[#3a4651] font-extrabold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroSubConsultor)}</span>
                       </div>

                       <div className="flex justify-between items-center text-sm text-slate-500 font-bold  tracking-wider">
                         <span>A Pagar ( {parsedData.subConsultorNome} )</span>
                         <span className="text-[#e15526] font-extrabold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAPagarSubConsultor)}</span>
                       </div>                        
                        
                      <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold  tracking-wider">
                         <span>Boleto real da Natura</span>
                         <span className="text-[#e15526] font-extrabold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAPagarReal)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold  tracking-wider pt-2 border-t border-slate-100">
                         <span className="text-[#48a84c]">Lucro (Admin)</span>
                         <span className="text-[#48a84c] font-extrabold text-sm">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroPrevisto)}</span>
                       </div>
                     

                    </div>
                  </div>

                  {feedback && (
                    <div className={`p-3 rounded text-xs font-bold text-center ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {feedback.msg}
                    </div>
                  )}

                  <div className="mt-2 flex justify-between items-center pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setStep(1)} 
                      className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded"
                    >
                      Voltar ao Texto
                    </button>
                    
                    <button 
                      onClick={handleConfirm}
                      disabled={loadingConfirm || parsedData.items.length === 0}
                      className="px-8 py-3 bg-[#48a84c] hover:bg-[#3d9140] text-white font-extrabold text-xs uppercase tracking-widest rounded flex items-center shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {loadingConfirm ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      {loadingConfirm ? 'Salvando...' : 'Confirmar Pedido'}
                    </button>
                  </div>
                  
                </div>
              )}

            </div>
            
          </div>
        </div>
      )}
    </>
  )
}
