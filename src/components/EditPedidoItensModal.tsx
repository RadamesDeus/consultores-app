'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Loader2, CheckCircle2, Pencil } from 'lucide-react'
import { atualizarItensPedido } from '@/actions/pedidos'
import styles from './EditPedidoItensModal.module.css'

interface ItemRow {
  id: string
  nome: string
  codigo: string
  quantidade: number
  valorUnico: number
  valorTotal: number
}

interface EditPedidoItensModalProps {
  pedido: {
    id: string
    margemMaster: number
    comissaoAplicada: number
    subConsultor: { nome: string; comissao: number }
    itens: ItemRow[]
  }
  onClose: () => void
}

const newBlankItem = (): ItemRow => ({
  id: `new-${Math.random().toString(36).slice(2)}`,
  nome: '',
  codigo: '',
  quantidade: 1,
  valorUnico: 0,
  valorTotal: 0,
})

export default function EditPedidoItensModal({ pedido, onClose }: EditPedidoItensModalProps) {
  const [itens, setItens] = useState<ItemRow[]>(pedido.itens.map(i => ({ ...i })))
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  const updateItem = (id: string, field: keyof ItemRow, value: string | number) => {
    setItens(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantidade' || field === 'valorUnico') {
        updated.valorTotal = Number(updated.quantidade) * Number(updated.valorUnico)
      }
      return updated
    }))
  }

  const removeItem = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id))
  }

  const addItem = () => {
    setItens(prev => [...prev, newBlankItem()])
  }

  const totalCatalogo = itens.reduce((acc, i) => acc + i.valorTotal, 0)
  const diferencaMargem = pedido.margemMaster - pedido.comissaoAplicada
  const lucroEstimado = totalCatalogo * (diferencaMargem / 100)

  const handleSave = async () => {
    const hasEmpty = itens.some(i => !i.nome.trim())
    if (hasEmpty) {
      setFeedback({ type: 'error', msg: 'Preencha o nome de todos os produtos antes de salvar.' })
      return
    }

    setLoading(true)
    setFeedback(null)
    const res = await atualizarItensPedido(pedido.id, itens.map(i => ({
      nome: i.nome,
      codigo: i.codigo,
      quantidade: i.quantidade,
      valorUnico: i.valorUnico,
      valorTotal: i.valorTotal,
    })))
    setLoading(false)

    if (res.success) {
      setFeedback({ type: 'success', msg: 'Itens atualizados com sucesso!' })
      setTimeout(() => onClose(), 1500)
    } else {
      setFeedback({ type: 'error', msg: (res as any).error ?? 'Erro ao salvar.' })
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              <Pencil className={styles.modalTitleIcon} />
              Editar Itens do Pedido
            </h2>
            <p className={styles.modalMeta}>
              Consultor: <span className={styles.metaHighlight}>{pedido.subConsultor.nome}</span>
              {' '}· Margem Master: {pedido.margemMaster}% · Comissão Sub: {pedido.comissaoAplicada}%
            </p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={`${styles.th} w-20`}>Qtd</th>
                  <th className={styles.th}>Produto</th>
                  <th className={`${styles.th} w-28`}>Código</th>
                  <th className={`${styles.th} w-32`}>Valor Unit.</th>
                  <th className={`${styles.thCenter} w-32`}>Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.id} className={styles.row}>
                    <td className={styles.td}>
                      <input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={e => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                        className={styles.inputQty}
                      />
                    </td>
                    <td className={styles.td}>
                      <input
                        type="text"
                        value={item.nome}
                        placeholder="Nome do produto..."
                        onChange={e => updateItem(item.id, 'nome', e.target.value)}
                        className={styles.inputText}
                      />
                    </td>
                    <td className={styles.td}>
                      <input
                        type="text"
                        value={item.codigo}
                        placeholder="---"
                        onChange={e => updateItem(item.id, 'codigo', e.target.value)}
                        className={styles.inputCode}
                      />
                    </td>
                    <td className={styles.td}>
                      <div className={styles.priceWrap}>
                        <span className={styles.pricePrefix}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={item.valorUnico}
                          onChange={e => updateItem(item.id, 'valorUnico', parseFloat(e.target.value) || 0)}
                          className={styles.inputPrice}
                        />
                      </div>
                    </td>
                    <td className={styles.tdRight}>
                      {BRL.format(item.valorTotal)}
                    </td>
                    <td className={styles.tdCenter}>
                      <button onClick={() => removeItem(item.id)} className={styles.removeBtn} title="Remover item">
                        <Trash2 className={styles.removeIcon} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addItem} className={styles.addRowBtn}>
              <Plus className={styles.addRowIcon} />
              Adicionar Novo Item
            </button>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Total do Pedido</span>
                <span className={styles.summaryValue}>{BRL.format(totalCatalogo)}</span>
              </div>
              <div className={styles.summaryLucroRow}>
                <span className={styles.summaryLucroLabel}>Lucro Master ({diferencaMargem.toFixed(0)}%)</span>
                <span className={styles.summaryLucroValue}>{BRL.format(lucroEstimado)}</span>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
              {feedback.msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
          <button onClick={handleSave} disabled={loading || itens.length === 0} className={styles.saveBtn}>
            {loading ? <Loader2 className={styles.saveBtnIcon + ' animate-spin'} /> : <CheckCircle2 className={styles.saveBtnIcon} />}
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>

      </div>
    </div>
  )
}
