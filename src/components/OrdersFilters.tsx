'use client'

import { Search, Filter, X } from 'lucide-react'
import styles from './OrdersFilters.module.css'

interface OrdersFiltersProps {
  ciclos: any[]
  subConsultores: any[]
  filters: {
    search: string
    cicloId: string
    subConsultorId: string
    status: string
  }
  setFilters: (filters: any) => void
}

export default function OrdersFilters({ ciclos, subConsultores, filters, setFilters }: OrdersFiltersProps) {

  const handleReset = () => {
    setFilters({ search: '', cicloId: '', subConsultorId: '', status: '' })
  }

  const hasActiveFilters = filters.search || filters.cicloId || filters.subConsultorId || filters.status

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Filter className={styles.headerIcon} />
          <span className={styles.headerLabel}>Filtros de Busca</span>
        </div>
        {hasActiveFilters && (
          <button onClick={handleReset} className={styles.clearBtn}>
            <X className={styles.clearIcon} />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {/* Search */}
        <div className={styles.field}>
          <label className={styles.label}>Pesquisar</label>
          <div className={styles.inputWrapper}>
            <Search className={styles.inputIcon} />
            <input
              type="text"
              placeholder="ID ou Observação..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={styles.inputWithIcon}
            />
          </div>
        </div>

        {/* Ciclo */}
        <div className={styles.field}>
          <label className={styles.label}>Ciclo</label>
          <select
            value={filters.cicloId}
            onChange={(e) => setFilters({ ...filters, cicloId: e.target.value })}
            className={styles.select}
          >
            <option value="">Todos os Ciclos</option>
            {ciclos.map(c => (
              <option key={c.id} value={c.id}>{c.codigo}</option>
            ))}
          </select>
        </div>

        {/* Sub-Consultor */}
        <div className={styles.field}>
          <label className={styles.label}>Sub-Consultor</label>
          <select
            value={filters.subConsultorId}
            onChange={(e) => setFilters({ ...filters, subConsultorId: e.target.value })}
            className={styles.select}
          >
            <option value="">Todos os Consultores</option>
            {subConsultores.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={styles.select}
          >
            <option value="">Todos os Status</option>
            <option value="LANCADO">Lançado</option>
            <option value="PAGO">Pago</option>
            <option value="ENTREGUE">Entregue</option>
          </select>
        </div>
      </div>
    </div>
  )
}
