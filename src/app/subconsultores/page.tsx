import prisma from "@/lib/prisma"
import AddSubConsultorForm from "@/components/AddSubConsultorForm"
import { Ban, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import styles from './subconsultores.module.css'

export const dynamic = 'force-dynamic'

export default async function SubConsultoresPage() {
  const subs = await prisma.subConsultor.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const ativos = subs.filter((s: any) => s.status === 'ATIVO').length
  const inativos = subs.length - ativos

  return (
    <div className={styles.page}>

      {/* Métricas */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricBarBlue} />
          <h3 className={styles.metricValue}>{subs.length}</h3>
          <p className={styles.metricLabel}>Total na Equipe</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricBarGreen} />
          <h3 className={styles.metricValue}>{ativos}</h3>
          <p className={styles.metricLabel}>Consultores Ativos</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricBarOrange} />
          <h3 className={styles.metricValue}>{inativos}</h3>
          <p className={styles.metricLabel}>Consultores Inativos</p>
        </div>
      </div>

      {/* Formulário */}
      <AddSubConsultorForm />

      {/* Tabela */}
      <div className={styles.tableSection}>
        <div className={styles.tableSectionHeader}>
          <h3 className={styles.tableSectionTitle}>Lista de Membros</h3>
          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Atualizado Dinamicamente</Badge>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Nome do Integrante</th>
                <th className={styles.th}>Telefone Contato</th>
                <th className={styles.th}>Margem Com./Lucro</th>
                <th className={styles.thCenter}>Status</th>
                <th className={styles.thRight}>Data Início</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s: any) => (
                <tr key={s.id} className={s.status === 'INATIVO' ? styles.rowInactive : styles.row}>
                  <td className={styles.td}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberAvatar}>
                        {s.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.memberName}>{s.nome}</p>
                        <p className={styles.memberId}>ID: {s.id.substring(s.id.length - 4)}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.phone}>{s.telefone || 'Não Registrado'}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.commission}>{s.comissao}%</span>
                  </td>
                  <td className={styles.tdCenter}>
                    <span className={s.status === 'ATIVO' ? styles.statusAtivo : styles.statusInativo}>
                      {s.status === 'ATIVO' ? <CheckCircle className={styles.statusIcon} /> : <Ban className={styles.statusIcon} />}
                      {s.status}
                    </span>
                  </td>
                  <td className={styles.tdRight}>
                    <span className={styles.dateCell}>{s.createdAt.toLocaleDateString('pt-BR')}</span>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>Nenhum membro cadastrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
