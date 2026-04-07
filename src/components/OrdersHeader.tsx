import FastOrderModal from './FastOrderModal'
import styles from './OrdersHeader.module.css'

interface OrdersHeaderProps {
  ciclos?: any[]
  subConsultores?: any[]
}

export default function OrdersHeader({ ciclos, subConsultores }: OrdersHeaderProps) {
  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.breadcrumb}>
          <span>Home</span>
          <span>/</span>
          <span className={styles.breadcrumbActive}>Pedidos</span>
        </div>
        <h1 className={styles.title}>Gestão de Pedidos</h1>
        <p className={styles.subtitle}>Acompanhe todos os lançamentos e lucros do ciclo atual e passados.</p>
      </div>
    </div>
  )
}
