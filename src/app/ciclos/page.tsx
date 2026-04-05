import prisma from "@/lib/prisma"
import AddCicloForm from "@/components/AddCicloForm"
import { Badge } from "@/components/ui/badge"

export default async function CiclosPage() {
  const ciclos = await prisma.ciclo.findMany({
    orderBy: { dataInicio: 'desc' },
    include: { pedidos: true }
  })

  // Formatter for Dates
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="p-4 md:p-8 flex flex-col">
      
      {/* Form Area */}
      <AddCicloForm />

      {/* Table Area */}
      <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col mt-2 border border-slate-100">
         <div className="p-5 border-b border-slate-100/50 flex justify-between items-center bg-[#fbfcfd]">
           <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#3a4651]">Histórico de Ciclos</h3>
           <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Visão Geral Completa</Badge>
         </div>
         
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead className="bg-[#fbfcfd]">
               <tr className="border-b border-slate-100/80">
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Campanha / Código</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Período de Atuação</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-center">Faturamento</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-center">Tamanho</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-right">Status do Ciclo</th>
               </tr>
             </thead>
             <tbody className="text-sm">
               {ciclos.map((c) => {
                  const lucroTotal = c.pedidos.reduce((acc, curr) => acc + curr.lucro, 0);
                  const faturamentoTotal = c.pedidos.reduce((acc, curr) => acc + curr.valorTotal, 0);
                  const isAberto = c.status === 'ABERTO';

                  return (
                    <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${!isAberto ? 'bg-slate-50/30' : ''}`}>
                      <td className="py-4 px-6">
                         <div className="font-bold text-[#3a4651] text-[14px]">{c.codigo}</div>
                         <div className="text-[10px] text-slate-400 font-semibold tracking-wider mt-0.5">Criado em: {dateFormatter.format(c.createdAt)}</div>
                      </td>
                      <td className="py-4 px-6 text-[#6b778c] font-semibold text-[13px]">
                         {dateFormatter.format(c.dataInicio)} <span className="text-slate-300 mx-1">→</span> {dateFormatter.format(c.dataFim)}
                      </td>
                      <td className="py-4 px-6 text-center">
                         <div className="text-[#3a4651] font-extrabold text-[13px]">{currencyFormatter.format(faturamentoTotal)}</div>
                         {faturamentoTotal > 0 && <div className="text-[10px] text-[#2d7ff9] font-bold tracking-wider mt-0.5">LUCRO: {currencyFormatter.format(lucroTotal)}</div>}
                      </td>
                      <td className="py-4 px-6 text-center">
                         <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#f4f7f6] text-[#3a4651] font-bold text-[11px] border border-slate-200">
                           {c.pedidos.length}
                         </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center justify-center min-w-[70px] uppercase px-3 py-1.5 rounded-[4px] text-[10px] font-bold tracking-widest ${isAberto ? 'bg-[#2d7ff9] text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                           {isAberto ? 'Aberto' : 'Fechado'}
                        </span>
                      </td>
                    </tr>
                  )
               })}
               {ciclos.length === 0 && (
                 <tr>
                   <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">Não há ciclos abertos. Inicie o seu primeiro para começar!</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

    </div>
  )
}
