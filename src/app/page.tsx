import { Paperclip, Ban, Lock } from "lucide-react"
import prisma from "@/lib/prisma"
import styles from './dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const cicloAtual = await prisma.ciclo.findFirst({
    where: { status: 'ABERTO' },
    orderBy: { dataInicio: 'desc' }
  })

  let totalLucro = 0
  let qtdVendas = 0
  let pendencias = 0
  let pedidosRecentes: any[] = []
  let ranking: any[] = []

  if (cicloAtual) {
    const pedidos = await prisma.pedido.findMany({
      where: { cicloId: cicloAtual.id },
      include: { subConsultor: true },
      orderBy: { dataPedido: 'desc' }
    })

    totalLucro = pedidos.reduce((acc: number, curr: any) => acc + curr.lucro, 0)
    qtdVendas = pedidos.length
    pendencias = pedidos.filter((p: any) => p.status === 'Lançado').length


    pedidosRecentes = pedidos.slice(0, 10)

    const rankMap: Record<string, { nome: string, totalValor: number }> = {}
    pedidos.forEach((p: any) => {
      if (!rankMap[p.subConsultorId]) {
        rankMap[p.subConsultorId] = { nome: p.subConsultor.nome, totalValor: 0 }
      }
      rankMap[p.subConsultorId].totalValor += p.valorTotal
    })
    ranking = Object.values(rankMap).sort((a, b) => b.totalValor - a.totalValor).slice(0, 7)
  }

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className={styles.page}>

      {/* Welcome Strip */}
      <div className={styles.topRow}>
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeBar} />
          <div>
            <h2 className={styles.welcomeTitle}>
              Bem Vindo <span className={styles.welcomeName}>Rita Rosy</span>
            </h2>
            <p className={styles.welcomeTag}>Resumo Financeiro</p>
          </div>
          {/* <div className={styles.welcomeValue}>R$ {(totalLucro).toFixed(0)}</div> */}
        </div>

        <div className={styles.welcomeCard}>
          <div className={styles.welcomeBarGray} />
          <div>
            <h2 className={styles.welcomeTitle}>Ciclo Ativo</h2>
            <p className={styles.welcomeTag}>Validade</p>
          </div>
          <div className={styles.welcomeValue}>{cicloAtual?.codigo || '---'}</div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={styles.metricsGrid}>
        <div className={`${styles.metricCard}`}>
          <div className={styles.metricBody}>
            <div>
              <h3 className={styles.metricTitle}>{BRL.format(totalLucro)}</h3>
              <p className={styles.metricLabel}>Lucro Líquido</p>
            </div>
            <div className={styles.metricIconWrap}>
              <Paperclip className={styles.metricIcon} />
            </div>
          </div>
          <div className={styles.metricFooterBlue}>
            <span>Lançamentos Recentes</span>
            <div className={styles.bars}>
              <div className={`${styles.bar} h-3 bg-white/60`} />
              <div className={`${styles.bar} h-4 bg-white/80`} />
              <div className={`${styles.bar} h-2 bg-white/50`} />
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricBody}>
            <div>
              <h3 className={styles.metricTitleOrange}>{pendencias}</h3>
              <p className={styles.metricLabel}>Pendências Totais</p>
            </div>
            <div className={styles.metricIconWrap}>
              <Ban className={styles.metricIcon} />
            </div>
          </div>
          <div className={styles.metricFooterOrange}>
            <span>Em Risco Média Alta</span>
            <div className={styles.bars}>
              <div className={`${styles.bar} h-4 bg-white/80`} />
              <div className={`${styles.bar} h-2 bg-white/50`} />
              <div className={`${styles.bar} h-3 bg-white/60`} />
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricBody}>
            <div>
              <h3 className={styles.metricTitle}>{qtdVendas}</h3>
              <p className={styles.metricLabel}>Pedidos</p>
            </div>
            <div className={styles.metricIconWrap}>
              <Lock className={styles.metricIcon} />
            </div>
          </div>
          <div className={styles.metricFooterGreen}>
            <span>Progresso Estável</span>
            <div className={styles.bars}>
              <div className={`${styles.bar} h-2 bg-white/60`} />
              <div className={`${styles.bar} h-2 bg-white/60`} />
              <div className={`${styles.bar} h-2 bg-white/60`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Tabela */}
        <div className={styles.tableSection}>
          <div className={styles.tableSectionHeader}>
            <h3 className={styles.tableSectionTitle}>Active Orders</h3>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Order</th>
                  <th className={styles.th}>Consultant Name</th>
                  <th className={styles.th}>Lucro</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Order Date</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecentes.map((ped: any) => (
                  <tr key={ped.id} className={styles.row}>
                    <td className={styles.cellId}>{ped.id.substring(ped.id.length - 4)}</td>
                    <td className={styles.cellName}>{ped.subConsultor.nome}</td>
                    <td className={styles.cellValue}>{BRL.format(ped.lucro)}</td>
                    <td className={styles.cellValue}>{ped.status}</td>
                    <td className={styles.cellValue}>{ped.dataPedido.toLocaleDateString('pt-BR')}</td>
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

        {/* Gráfico */}
        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>Analytics</h3>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} bg-[#1e3a8a]`} />
              <span className={styles.legendLabel}>Clientes</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} bg-[#3b82f6]`} />
              <span className={styles.legendLabel}>Pedidos</span>
            </div>
          </div>
          <div className={styles.chartBars}>
            {ranking.map((r: any, i: number) => (
              <div key={i} className={styles.chartBarCol}>
                <div
                  className={styles.chartBar}
                  style={{ height: `${Math.max(10, (r.totalValor / (ranking[0]?.totalValor || 1)) * 100)}%` }}
                />
                <span className={styles.chartBarLabel} title={r.nome}>{r.nome.split(' ')[0]}</span>
              </div>
            ))}
            {ranking.length === 0 && (
              <div className={styles.chartEmpty}>Sem Lançamentos Analíticos</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
