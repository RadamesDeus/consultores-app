'use client'

import { useRef, useState } from 'react'
import { createSubConsultor } from '@/actions/subconsultores'
import { Loader2, Plus, Users } from 'lucide-react'
import styles from './AddSubConsultorForm.module.css'

export default function AddSubConsultorForm() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{type: 'error' | 'success', msg: string} | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const formData = new FormData(e.currentTarget)
    const nome = formData.get('nome') as string
    const telefone = formData.get('telefone') as string
    const comissao = parseFloat(formData.get('comissao') as string)

    const res = await createSubConsultor(nome, telefone, comissao)

    setLoading(false)
    if (res.success) {
      setFeedback({ type: 'success', msg: 'Adicionado com sucesso!' })
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
          <Users className={styles.icon} />
        </div>
        <div>
          <h3 className={styles.cardTitle}>Novo Membro</h3>
          <p className={styles.cardSubtitle}>Adicionar um novo sub-consultor à equipe</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldFull}>
          <label className={styles.label}>Nome Completo</label>
          <input
            type="text"
            name="nome"
            required
            placeholder="Ex: Ana Maria"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldFull}>
          <label className={styles.label}>Telefone (Opcional)</label>
          <input
            type="text"
            name="telefone"
            placeholder="Ex: 11999999999"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldFixed}>
          <label className={styles.label}>Comissão (%)</label>
          <input
            type="number"
            name="comissao"
            required
            step="0.1"
            placeholder="Ex: 25"
            className={styles.inputNumber}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Lançar
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
