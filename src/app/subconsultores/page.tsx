import prisma from "@/lib/prisma"
import AddSubConsultorForm from "@/components/AddSubConsultorForm"
import { Users, Ban, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function SubConsultoresPage() {
  const subs = await prisma.subConsultor.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Basic stats
  const ativos = subs.filter(s => s.status === 'ATIVO').length;
  const inativos = subs.length - ativos;

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden border border-slate-100">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2d7ff9]"></div>
           <h3 className="text-3xl font-extrabold text-[#3a4651] tracking-tight">{subs.length}</h3>
           <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-bold">Total na Equipe</p>
         </div>

         <div className="bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden border border-slate-100">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#48a84c]"></div>
           <h3 className="text-3xl font-extrabold text-[#3a4651] tracking-tight">{ativos}</h3>
           <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-bold">Consultores Ativos</p>
         </div>

         <div className="bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden border border-slate-100">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e15526]"></div>
           <h3 className="text-3xl font-extrabold text-[#3a4651] tracking-tight">{inativos}</h3>
           <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-bold">Consultores Inativos</p>
         </div>
      </div>

      {/* Form Area */}
      <AddSubConsultorForm />

      {/* Table Area */}
      <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col mt-2 border border-slate-100">
         <div className="p-5 border-b border-slate-100/50 flex justify-between items-center bg-[#fbfcfd]">
           <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#3a4651]">Lista de Membros</h3>
           <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Atualizado Dinamicamente</Badge>
         </div>
         
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead className="bg-[#fbfcfd]">
               <tr className="border-b border-slate-100/80">
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Nome do Integrante</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Telefone Contato</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Margem Com./Lucro</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-center">Status</th>
                 <th className="py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-right">Data Início</th>
               </tr>
             </thead>
             <tbody className="text-sm">
               {subs.map((s) => (
                  <tr key={s.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${s.status === 'INATIVO' ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f4f7f6] text-[#2d7ff9] flex items-center justify-center font-bold text-xs">
                             {s.nome.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                             <p className="font-bold text-[#3a4651] text-[13px]">{s.nome}</p>
                             <p className="text-[10px] text-slate-400 font-semibold tracking-wider">ID: {s.id.substring(s.id.length-4)}</p>
                          </div>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-[#6b778c] font-medium text-[13px]">{s.telefone || 'Não Registrado'}</td>
                    <td className="py-4 px-6 text-[#3a4651] font-bold text-[13px]">{s.comissao}%</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${s.status === 'ATIVO' ? 'bg-[#48a84c]/10 text-[#48a84c]' : 'bg-[#e15526]/10 text-[#e15526]'} `}>
                         {s.status === 'ATIVO' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                         {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#6b778c] text-[12px] font-medium text-right">
                       {s.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
               ))}
               {subs.length === 0 && (
                 <tr>
                   <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">Nenhum membro cadastrado ainda.</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

    </div>
  )
}
