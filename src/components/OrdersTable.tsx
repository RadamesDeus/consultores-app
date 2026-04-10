'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ShoppingCart, Truck, User, Ban, Pencil } from 'lucide-react'
import { marcarPedidoComoPago, marcarPedidoComoEntregue } from '@/actions/pedidos'
import EditPedidoItensModal from './EditPedidoItensModal'
import styles from './OrdersTable.module.css'

interface OrdersTableProps {
  pedidos: any[]
}

export default function OrdersTable({ pedidos }: OrdersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingPedido, setEditingPedido] = useState<any | null>(null)

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleStatusUpdate = async (id: string, action: 'PAGO' | 'ENTREGUE') => {
    setLoadingId(id)
    if (action === 'PAGO') await marcarPedidoComoPago(id)
    else await marcarPedidoComoEntregue(id)
    setLoadingId(null)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'LANCADO': return styles.statusLancado
      case 'PAGO': return styles.statusPago
      case 'ENTREGUE': return styles.statusEntregue
      default: return ''
    }
  }

  return (
    <>
      {editingPedido && (
        <EditPedidoItensModal
          pedido={editingPedido}
          onClose={() => setEditingPedido(null)}
        />
      )}

      <div className={styles.wrapper}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>
                  <div className={styles.thInner}>
                    <ShoppingCart className={styles.thIcon} />
                    Pedido / Data
                  </div>
                </th>
                <th className={styles.th}>
                  <div className={styles.thInner}>
                    <User className={styles.thIcon} />
                    Consultor
                  </div>
                </th>
                <th className={styles.th}>Ciclo</th>
                <th className={styles.thRight}>Total Catálogo</th>
                <th className={styles.thRight}>Total Boleto</th>
                <th className={styles.thGreen}>Lucro Master</th>
                <th className={styles.thCenter}>Status</th>
                <th className={styles.thCenter}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((ped) => (
                <>
                  <tr
                    key={ped.id}
                    className={expandedId === ped.id ? styles.rowExpanded : styles.row}
                    onClick={() => toggleExpand(ped.id)}
                  >
                    <td className={styles.td}>
                      <div className={styles.orderId}>
                        <span className={styles.orderCode}>#{ped.id.substring(ped.id.length - 6).toUpperCase()}</span>
                        <span className={styles.orderDate}>{new Date(ped.dataPedido).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.consultorName}>{ped.subConsultor.nome}</span>
                    </td>
                    <td className={styles.td}>
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-bold text-[10px] tracking-widest px-2 py-0.5 rounded-sm">
                        {ped.ciclo.codigo}
                      </Badge>
                    </td>
                    <td className={styles.tdRight}>
                      <span className={styles.valorTotal}>{BRL.format(ped.valorTotal)}</span>
                    </td>
                    <td className={styles.tdRight}>
                      <span className={styles.boleto}>{BRL.format(ped.valorTotal - (ped.valorTotal * (ped.margemMaster / 100)))}</span>
                    </td>
                    <td className={styles.tdRight}>
                      <span className={styles.lucro}>{BRL.format(ped.lucro)}</span>
                    </td>
                    <td className={styles.tdCenter}>
                      <span className={getStatusClass(ped.status)}>{ped.status}</span>
                    </td>
                    <td className={styles.tdCenter} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionsCell}>
                        {ped.status === 'LANCADO' && (
                          <button
                            onClick={() => handleStatusUpdate(ped.id, 'PAGO')}
                            disabled={loadingId === ped.id}
                            className={styles.btnPago}
                            title="Marcar como Pago"
                          >
                            <CheckCircle2 className={styles.actionIcon} />
                          </button>
                        )}
                        {ped.status === 'PAGO' && (
                          <button
                            onClick={() => handleStatusUpdate(ped.id, 'ENTREGUE')}
                            disabled={loadingId === ped.id}
                            className={styles.btnEntregue}
                            title="Marcar como Entregue"
                          >
                            <Truck className={styles.actionIcon} />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingPedido(ped)}
                          className={styles.btnEdit}
                          title="Editar itens do pedido"
                        >
                          <Pencil className={styles.actionIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === ped.id && (
                    <tr className={styles.expandedRow}>
                      <td colSpan={7} className="p-0">
                        <div className={styles.expandedPanel}>
                          <div className={styles.expandedHeader}>
                            <div>
                              <h4 className={styles.expandedTitleLabel}>Detalhes do Pedido</h4>
                              <p className={styles.expandedTitle}>
                                Lista de Produtos solicitados por{' '}
                                <span className={styles.expandedTitleName}>{ped.subConsultor.nome}</span>
                              </p>
                            </div>
                            <div className={styles.expandedMeta}>
                              <div>
                                <h4 className={styles.obsLabel}>Observações</h4>
                                <p className={styles.obsText}>{ped.observacoes || 'Sem observações para este pedido.'}</p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingPedido(ped) }}
                                className={styles.editBtn}
                              >
                                <Pencil className={styles.editBtnIcon} />
                                Editar Itens
                              </button>
                            </div>
                          </div>

                          <div className={styles.itemsTable}>
                            <table className={styles.itemsTableEl}>
                              <thead className={styles.itemsThead}>
                                <tr>
                                  <th className={styles.itemsTh}>Código</th>
                                  <th className={styles.itemsTh}>Produto</th>
                                  <th className={styles.itemsThCenter}>Qtd</th>
                                  <th className={styles.itemsThRight}>Valor Unit.</th>
                                  <th className={styles.itemsThRight}>Total Catál.</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ped.itens.map((item: any) => (
                                  <tr key={item.id} className={styles.itemsRow}>
                                    <td className={styles.itemCode}>{item.codigo || '---'}</td>
                                    <td className={styles.itemName}>{item.nome}</td>
                                    <td className={styles.itemQty}>{item.quantidade}</td>
                                    <td className={styles.itemUnit}>{BRL.format(item.valorUnico)}</td>
                                    <td className={styles.itemTotal}>{BRL.format(item.valorTotal)}</td>
                                  </tr>
                                ))}
                                {ped.itens.length === 0 && (
                                  <tr>
                                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                                      Este pedido não possui itens.{' '}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setEditingPedido(ped) }}
                                        className="text-blue-500 underline font-bold"
                                      >
                                        Adicionar itens
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                              <tfoot className={styles.itemsTfoot}>
                                <tr>
                                  <td colSpan={4} className={styles.itemsFootCell}>Total do Pedido (Catálogo)</td>
                                  <td className={styles.itemsFootValue}>{BRL.format(ped.valorTotal)}</td>
                                </tr>
                                <tr>
                                  <td colSpan={4} className={styles.itemsFootGreen}>
                                    Lucro da Master ({ped.margemMaster - ped.comissaoAplicada}%)
                                  </td>
                                  <td className={styles.itemsFootValueGreen}>{BRL.format(ped.lucro)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyCell}>
                    <div className={styles.emptyInner}>
                      <div className={styles.emptyIcon}>
                        <Ban className={styles.emptyIconSvg} />
                      </div>
                      <div>
                        <p className={styles.emptyTitle}>Nenhum pedido encontrado</p>
                        <p className={styles.emptySubtitle}>Tente ajustar seus filtros ou lance um novo pedido</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
