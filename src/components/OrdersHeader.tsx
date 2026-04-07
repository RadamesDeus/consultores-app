import styles from './OrdersHeader.module.css'

export default function OrdersHeader() {
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
