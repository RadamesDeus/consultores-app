'use client'

import { useRef, useState } from 'react'
import { createCiclo } from '@/actions/ciclos'
import { Loader2, Plus, RefreshCw } from 'lucide-react'
import styles from './AddCicloForm.module.css'

export default function AddCicloForm() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'error' | 'success', msg: string} | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const formData = new FormData(e.currentTarget)
    const codigo = formData.get('codigo') as string
    const dataInicio = new Date(formData.get('dataInicio') as string)
    const dataFim = new Date(formData.get('dataFim') as string)

    const res = await createCiclo(codigo, dataInicio, dataFim)

    setLoading(false)
    if (res.success) {
      setFeedback({ type: 'success', msg: 'Ciclo iniciado com sucesso!' })
      formRef.current?.reset()
      setTimeout(() => setFeedback(null), 3000)
    } else {
      setFeedback({ type: 'error', msg: res.error as string })
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <RefreshCw className={styles.icon} />
        </div>
        <div>
          <h3 className={styles.cardTitle}>Novo Ciclo de Vendas</h3>
          <p className={styles.cardSubtitle}>Definir o período de uma nova campanha</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldFull}>
          <label className={styles.label}>Código / Nome</label>
          <input
            type="text"
            name="codigo"
            required
            placeholder="Ex: Ciclo 05/2026 ou Dia das Mães"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldFixed}>
          <label className={styles.label}>Data de Início</label>
          <input
            type="date"
            name="dataInicio"
            required
            className={styles.inputSm}
          />
        </div>

        <div className={styles.fieldFixed}>
          <label className={styles.label}>Data de Término</label>
          <input
            type="date"
            name="dataFim"
            required
            className={styles.inputSm}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Abrir Ciclo
        </button>
      </form>

      {feedback && (
        <div className={feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
          {feedback.msg}
        </div>
      )}
    </div>
  )
}
