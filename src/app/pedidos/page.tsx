import prisma from '@/lib/prisma'
import OrdersHeader from '@/components/OrdersHeader'
import OrdersManager from '@/components/OrdersManager'
import { getTodosPedidos } from '@/actions/pedidos'
import styles from './pedidos.module.css'

export const dynamic = 'force-dynamic'

export default async function PedidosPage() {
  const initialPedidos = await getTodosPedidos()
  const ciclos = await prisma.ciclo.findMany({
    orderBy: { dataInicio: 'desc' }
  })
  const subConsultores = await prisma.subConsultor.findMany({
    where: { status: 'ATIVO' },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className={styles.page}>
      <OrdersHeader />

      <OrdersManager
        initialPedidos={initialPedidos}
        ciclos={ciclos}
        subConsultores={subConsultores}
      />
    </div>
  )
}
