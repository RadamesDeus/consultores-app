import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Paperclip, Ban, Lock, ClipboardList } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function Dashboard() {
  // 1. Fetch data
  const cicloAtual = await prisma.ciclo.findFirst({
    where: { status: 'ABERTO' },
    orderBy: { dataInicio: 'desc' }
  })

  let totalLucro = 0;
  let qtdVendas = 0;
  let pendencias = 0;
  let percentualAtivos = 0;
  let pedidosRecentes: any[] = [];
  let ranking: any[] = [];

  if (cicloAtual) {
    const pedidos = await prisma.pedido.findMany({
      where: { cicloId: cicloAtual.id },
      include: { subConsultor: true },
      orderBy: { dataPedido: 'desc' }
    });

    totalLucro = pedidos.reduce((acc, curr) => acc + curr.lucro, 0);
    qtdVendas = pedidos.length;
    pendencias = pedidos.filter(p => p.status === 'LANCADO').length;

    const totalSubs = await prisma.subConsultor.count()
    const activeSubs = await prisma.subConsultor.count({ where: { status: 'ATIVO' } })
    percentualAtivos = totalSubs > 0 ? (activeSubs / totalSubs) * 100 : 0;

    pedidosRecentes = pedidos.slice(0, 10); // Extrato longo estilo Active Orders

    const rankMap: Record<string, { nome: string, totalValor: number }> = {}
    pedidos.forEach(p => {
      if(!rankMap[p.subConsultorId]) {
        rankMap[p.subConsultorId] = { nome: p.subConsultor.nome, totalValor: 0 }
      }
      rankMap[p.subConsultorId].totalValor += p.valorTotal
    })
    ranking = Object.values(rankMap).sort((a, b) => b.totalValor - a.totalValor).slice(0, 7)
  }

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      
      {/* Welcome & Info Strip */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex justify-between items-center relative overflow-hidden">
           {/* Barra sutil lado esquerdo */}
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2d7ff9]"></div>
           <div>
             <h2 className="text-xl text-[#6b778c] font-light tracking-wide">
               Bem Vindo <span className="text-[#2d7ff9] font-semibold">Rita Rosy</span>
             </h2>
             <p className="text-xs text-slate-400 uppercase mt-1 tracking-widest font-bold">Resumo Financeiro</p>
           </div>
           <div className="text-3xl font-extrabold text-[#3a4651] tracking-tight">R$ {(totalLucro*4).toFixed(0)}</div>
        </div>

        <div className="flex-1 bg-white p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex justify-between items-center relative overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200"></div>
           <div>
             <h2 className="text-xl text-[#6b778c] font-light tracking-wide">
               Ciclo Ativo
             </h2>
             <p className="text-xs text-slate-400 uppercase mt-1 tracking-widest font-bold">Validade</p>
           </div>
           <div className="text-3xl font-extrabold text-[#3a4651] tracking-tight">{cicloAtual?.codigo || '---'}</div>
        </div>
      </div>

      {/* 4 Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 - Blue */}
        <div className="bg-white  shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
           <div className="p-5 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#3a4651] tracking-tight">{BRL.format(totalLucro)}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Lucro Líquido</p>
              </div>
              <div className="w-10 h-10 border-2 border-slate-100 rounded flex flex-col items-center justify-center opacity-40">
                <Paperclip className="w-5 h-5 text-slate-400" />
              </div>
           </div>
           <div className="bg-[#445b9a] text-white/90 text-xs py-2 px-4 flex justify-between items-center font-bold tracking-wide mt-auto">
             <span>Lançamentos Recentes</span>
             <div className="flex gap-1 items-end">
               <div className="w-1.5 h-3 bg-white/60"></div>
               <div className="w-1.5 h-4 bg-white/80"></div>
               <div className="w-1.5 h-2 bg-white/50"></div>
             </div>
           </div>
        </div>

        {/* Card 2 - Orange/Red */}
        <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
           <div className="p-5 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#e15526] tracking-tight">{pendencias}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Pendências Totais</p>
              </div>
              <div className="w-10 h-10 border-2 border-slate-100 rounded flex flex-col items-center justify-center opacity-40">
                <Ban className="w-5 h-5 text-slate-400" />
              </div>
           </div>
           <div className="bg-[#e15526] text-white/90 text-xs py-2 px-4 flex justify-between items-center font-bold tracking-wide mt-auto">
             <span>Em Risco Média Alta</span>
             <div className="flex gap-1 items-end">
               <div className="w-1.5 h-4 bg-white/80"></div>
               <div className="w-1.5 h-2 bg-white/50"></div>
               <div className="w-1.5 h-3 bg-white/60"></div>
             </div>
           </div>
        </div>

        {/* Card 3 - Green */}
        <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
           <div className="p-5 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#3a4651] tracking-tight">{qtdVendas}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Vendas Concluídas</p>
              </div>
              <div className="w-10 h-10 border-2 border-slate-100 rounded flex flex-col items-center justify-center opacity-40">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
           </div>
           <div className="bg-[#48a84c] text-white/90 text-xs py-2 px-4 flex justify-between items-center font-bold tracking-wide mt-auto">
             <span>Progresso Estável</span>
             <div className="flex gap-1 items-end">
               <div className="w-1.5 h-2 bg-white/60"></div>
               <div className="w-1.5 h-2 bg-white/60"></div>
               <div className="w-1.5 h-2 bg-white/60"></div>
             </div>
           </div>
        </div>

        {/* Card 4 - Yellow/Orange */}
        <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
           <div className="p-5 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-[#3a4651] tracking-tight">{percentualAtivos.toFixed(0)}%</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Equipe Engajada</p>
              </div>
              <div className="w-10 h-10 border-2 border-slate-100 rounded flex flex-col items-center justify-center opacity-40">
                <ClipboardList className="w-5 h-5 text-slate-400" />
              </div>
           </div>
           <div className="bg-[#f39c12] text-white/90 text-xs py-2 px-4 flex justify-between items-center font-bold tracking-wide mt-auto">
             <span>Meta Atingida</span>
             <div className="flex gap-1 items-end">
               <div className="w-1.5 h-2 bg-white/50"></div>
               <div className="w-1.5 h-3 bg-white/70"></div>
               <div className="w-1.5 h-4 bg-white/90"></div>
             </div>
           </div>
        </div>

      </div>

      {/* Main Content Area (Table + Graph) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Orders Table */}
         <div className="lg:col-span-2 bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col">
           <div className="p-5 border-b border-slate-100/50">
             <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#3a4651]">Active Orders</h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-slate-100/50">
                   <th className="py-4 px-5 text-[11px] uppercase tracking-wider font-bold text-slate-800">Order</th>
                   <th className="py-4 px-5 text-[11px] uppercase tracking-wider font-bold text-slate-800">Consultant Name</th>
                   <th className="py-4 px-5 text-[11px] uppercase tracking-wider font-bold text-slate-800">Lucro</th>
                   <th className="py-4 px-5 text-[11px] uppercase tracking-wider font-bold text-slate-800">Status</th>
                   <th className="py-4 px-5 text-[11px] uppercase tracking-wider font-bold text-slate-800">Order Date</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {pedidosRecentes.map((ped) => (
                    <tr key={ped.id} className="border-b border-slate-100/30 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-5 text-[#2d7ff9] font-semibold text-[13px]">{ped.id.substring(ped.id.length-4)}</td>
                      <td className="py-3 px-5 text-[#6b778c] font-medium">{ped.subConsultor.nome}</td>
                      <td className="py-3 px-5 text-[#6b778c]">{BRL.format(ped.lucro)}</td>
                      <td className="py-3 px-5 text-[#6b778c]">{ped.status}</td>
                      <td className="py-3 px-5 text-[#6b778c]">{ped.dataPedido.toLocaleDateString('pt-BR')}</td>
                    </tr>
                 ))}
                 {pedidosRecentes.length === 0 && (
                   <tr>
                     <td colSpan={5} className="py-8 text-center text-slate-400">Nenhum pedido encontrado.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         </div>

         {/* Analytics Graphics placeholder */}
         <div className="bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col p-5">
           <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#3a4651] mb-6">Analytics</h3>
           
           <div className="flex gap-4 items-center justify-center mb-10">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#1e3a8a]"></div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Customers</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Users</span>
              </div>
           </div>

           <div className="flex-1 flex items-end justify-between px-2 gap-2 mt-auto h-[200px]">
             {/* Barras dinâmicas do Ranking (limitado a 7 para caber) */}
             {ranking.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                   <div className="w-full bg-[#3b82f6]/90 group-hover:bg-[#1e3a8a] transition-colors rounded-t-sm" style={{height: `${Math.max(10, (r.totalValor / (ranking[0]?.totalValor || 1)) * 100)}%`}}></div>
                   <span className="text-[10px] text-slate-400 font-bold truncate max-w-[40px] block" title={r.nome}>{r.nome.split(' ')[0]}</span>
                </div>
             ))}
             {ranking.length === 0 && (
                <div className="w-full text-center text-xs text-slate-400 pb-10">Sem Lançamentos Analíticos</div>
             )}
           </div>
         </div>

      </div>

    </div>
  )
}
