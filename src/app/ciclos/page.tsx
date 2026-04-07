import prisma from "@/lib/prisma"
import AddCicloForm from "@/components/AddCicloForm"
import { Badge } from "@/components/ui/badge"
import styles from './ciclos.module.css'

export default async function CiclosPage() {
  const ciclos = await prisma.ciclo.findMany({
    orderBy: { dataInicio: 'desc' },
    include: { pedidos: true }
  })

  const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className={styles.page}>
      <AddCicloForm />

      <div className={styles.tableSection}>
        <div className={styles.tableSectionHeader}>
          <h3 className={styles.tableSectionTitle}>Histórico de Ciclos</h3>
          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Visão Geral Completa</Badge>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Campanha / Código</th>
                <th className={styles.th}>Período de Atuação</th>
                <th className={styles.thCenter}>Faturamento</th>
                <th className={styles.thCenter}>Tamanho</th>
                <th className={styles.thRight}>Status do Ciclo</th>
              </tr>
            </thead>
            <tbody>
              {ciclos.map((c: any) => {
                const lucroTotal = c.pedidos.reduce((acc: number, curr: any) => acc + curr.lucro, 0)
                const faturamentoTotal = c.pedidos.reduce((acc: number, curr: any) => acc + curr.valorTotal, 0)
                const isAberto = c.status === 'ABERTO'

                return (
                  <tr key={c.id} className={isAberto ? styles.row : styles.rowClosed}>
                    <td className={styles.td}>
                      <div className={styles.cicloCode}>{c.codigo}</div>
                      <div className={styles.cicloCreated}>Criado em: {dateFormatter.format(c.createdAt)}</div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.periodo}>
                        {dateFormatter.format(c.dataInicio)}
                        <span className={styles.periodoArrow}>→</span>
                        {dateFormatter.format(c.dataFim)}
                      </span>
                    </td>
                    <td className={styles.tdCenter}>
                      <div className={styles.faturamento}>{currencyFormatter.format(faturamentoTotal)}</div>
                      {faturamentoTotal > 0 && (
                        <div className={styles.lucro}>LUCRO: {currencyFormatter.format(lucroTotal)}</div>
                      )}
                    </td>
                    <td className={styles.tdCenter}>
                      <div className={styles.tamanhoWrap}>{c.pedidos.length}</div>
                    </td>
                    <td className={styles.tdRight}>
                      <span className={isAberto ? styles.statusAberto : styles.statusFechado}>
                        {isAberto ? 'Aberto' : 'Fechado'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {ciclos.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>Não há ciclos abertos. Inicie o seu primeiro para começar!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
