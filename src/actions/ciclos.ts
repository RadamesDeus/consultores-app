'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Criar um novo ciclo
export async function createCiclo(codigo: string, dataInicio: Date, dataFim: Date) {
  try {
    const ciclo = await prisma.ciclo.create({
      data: {
        codigo,
        dataInicio,
        dataFim,
        status: 'ABERTO'
      }
    })
    revalidatePath('/')
    revalidatePath('/ciclos')
    return { success: true, ciclo }
  } catch (error) {
    console.error("Erro ao criar ciclo:", error)
    return { success: false, error: 'Falha ao criar ciclo' }
  }
}

// Obter todos os ciclos
export async function getCiclos() {
  try {
    return await prisma.ciclo.findMany({
      orderBy: { dataInicio: 'desc' }
    })
  } catch (error) {
    console.error("Erro ao buscar ciclos:", error)
    return []
  }
}

// Obter o ciclo ativo
export async function getCicloAtivo() {
  try {
    return await prisma.ciclo.findFirst({
      where: { status: 'ABERTO' },
      orderBy: { dataInicio: 'desc' }
    })
  } catch (error) {
    console.error("Erro ao buscar ciclo ativo:", error)
    return null
  }
}

// Fechar um ciclo
export async function closeCiclo(id: string) {
  try {
    const ciclo = await prisma.ciclo.update({
      where: { id },
      data: { status: 'FECHADO' }
    })
    revalidatePath('/')
    revalidatePath('/ciclos')
    return { success: true, ciclo }
  } catch (error) {
    console.error("Erro ao fechar ciclo:", error)
    return { success: false, error: 'Falha ao fechar ciclo' }
  }
}
