'use client'

import { useState, useMemo } from 'react'
import OrdersFilters from './OrdersFilters'
import OrdersTable from './OrdersTable'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, PieChart, TrendingUp, AlertCircle } from 'lucide-react'
import styles from './OrdersManager.module.css'

interface OrdersManagerProps {
  initialPedidos: any[]
  ciclos: any[]
  subConsultores: any[]
}

export default function OrdersManager({ initialPedidos, ciclos, subConsultores }: OrdersManagerProps) {
  const [filters, setFilters] = useState({
    search: '',
    cicloId: '',
    subConsultorId: '',
    status: ''
  })

  const filteredPedidos = useMemo(() => {
    return initialPedidos.filter(p => {
      const matchesSearch = !filters.search ||
        p.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        (p.observacoes && p.observacoes.toLowerCase().includes(filters.search.toLowerCase()))
      const matchesCiclo = !filters.cicloId || p.cicloId === filters.cicloId
      const matchesSub = !filters.subConsultorId || p.subConsultorId === filters.subConsultorId
      const matchesStatus = !filters.status || p.status === filters.status
      return matchesSearch && matchesCiclo && matchesSub && matchesStatus
    })
  }, [initialPedidos, filters])

  const stats = useMemo(() => {
    const totalVendido = filteredPedidos.reduce((acc, curr) => acc + curr.valorTotal, 0)
    const totalLucro = filteredPedidos.reduce((acc, curr) => acc + curr.lucro, 0)
    const pendentes = filteredPedidos.filter(p => p.status === 'LANCADO').length
    const volume = filteredPedidos.length
    return { totalVendido, totalLucro, pendentes, volume }
  }, [filteredPedidos])

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className={styles.wrapper}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.cardBlue}>
          <CardContent className={styles.cardContent}>
            <div className={styles.cardTop}>
              <div className={styles.iconWrapBlue}>
                <DollarSign className={styles.iconBlue} />
              </div>
              <span className={styles.cardTag}>Catálogo</span>
            </div>
            <h3 className={styles.cardValue}>{BRL.format(stats.totalVendido)}</h3>
            <p className={styles.cardLabel}>Volume de Venda Bruta</p>
          </CardContent>
        </Card>

        <Card className={styles.cardGreen}>
          <CardContent className={styles.cardContent}>
            <div className={styles.cardTop}>
              <div className={styles.iconWrapGreen}>
                <TrendingUp className={styles.iconGreen} />
              </div>
              <span className={styles.cardTag}>Comissão Master</span>
            </div>
            <h3 className={styles.cardValueGreen}>{BRL.format(stats.totalLucro)}</h3>
            <p className={styles.cardLabel}>Lucro Líquido Estimado</p>
          </CardContent>
        </Card>

        <Card className={styles.cardOrange}>
          <CardContent className={styles.cardContent}>
            <div className={styles.cardTop}>
              <div className={styles.iconWrapOrange}>
                <AlertCircle className={styles.iconOrange} />
              </div>
              <span className={styles.cardTag}>Pendências</span>
            </div>
            <h3 className={styles.cardValue}>{stats.pendentes}</h3>
            <p className={styles.cardLabel}>Aguardando Pagamento</p>
          </CardContent>
        </Card>

        <Card className={styles.cardSlate}>
          <CardContent className={styles.cardContent}>
            <div className={styles.cardTop}>
              <div className={styles.iconWrapSlate}>
                <PieChart className={styles.iconSlate} />
              </div>
              <span className={styles.cardTag}>Quantidade</span>
            </div>
            <h3 className={styles.cardValue}>{stats.volume}</h3>
            <p className={styles.cardLabel}>Total de Pedidos Exibidos</p>
          </CardContent>
        </Card>
      </div>

      <OrdersFilters
        ciclos={ciclos}
        subConsultores={subConsultores}
        filters={filters}
        setFilters={setFilters}
      />

      <OrdersTable pedidos={filteredPedidos} />
    </div>
  )
}
