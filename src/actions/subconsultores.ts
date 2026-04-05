'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSubConsultor(nome: string, telefone: string, comissao: number) {
  try {
    const sub = await prisma.subConsultor.create({
      data: {
        nome,
        telefone,
        comissao,
        status: 'ATIVO'
      }
    })
    revalidatePath('/subconsultores')
    return { success: true, data: sub }
  } catch (error) {
    console.error("Erro ao criar sub-consultor:", error)
    return { success: false, error: 'Falha ao criar sub-consultor' }
  }
}

export async function getSubConsultores() {
  try {
    return await prisma.subConsultor.findMany({
      orderBy: { nome: 'asc' }
    })
  } catch (error) {
    console.error("Erro ao buscar sub-consultores:", error)
    return []
  }
}

export async function toggleStatusSubConsultor(id: string, status: string) {
  try {
    const sub = await prisma.subConsultor.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/subconsultores')
    return { success: true, data: sub }
  } catch (error) {
    console.error("Erro ao alterar status:", error)
    return { success: false, error: 'Falha ao atualizar status' }
  }
}
