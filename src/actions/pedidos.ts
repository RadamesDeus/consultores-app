'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function confirmGridOrder(
  cicloId: string,
  subConsultorId: string,
  margemMaster: number, // Padrão: 35
  itens: { nome: string, codigo: string, quantidade: number, valorUnico: number, valorTotal: number }[],
  observacoes?: string
) {
  try {
    const sub = await prisma.subConsultor.findUnique({
      where: { id: subConsultorId }
    })
    if (!sub) throw new Error("Sub-consultor não encontrado")

    // 1. Somatória do valor catálogo
    const valorTotalCatalogo = itens.reduce((acc, curr) => acc + curr.valorTotal, 0);

    // 2. Cálculo do Lucro do Master Consultor
    // Ex: Catalogo = 100. Master (35%) -> Master paga 65. Sub (30%) -> Sub passa 70. Lucro = 5.
    // Matematicamente: Lucro = valorTotalCatalogo * ((margemMaster - sub.comissao) / 100)
    const comissaoSub = sub.comissao;
    const diferencaMargem = margemMaster - comissaoSub; 
    
    // Lucro no bolso da Master (pode ser 0 se as margins empatarem, mas está condizente com a regra)
    const lucro = valorTotalCatalogo * (diferencaMargem / 100);

    // 3. Criar o Pedido Master + Criação de Itens aninhada (Nested Writes)
    const pedido = await prisma.pedido.create({
      data: {
        ciclo: { connect: { id: cicloId } },
        subConsultor: { connect: { id: subConsultorId } },
        valorTotal: valorTotalCatalogo,
        lucro: lucro,
        status: 'Lançado',
        observacoes,
        margemMaster: margemMaster,
        comissaoAplicada: comissaoSub,
        itens: {
          create: itens.map(i => ({
             nome: i.nome,
             codigo: i.codigo || null,
             quantidade: i.quantidade,
             valorUnico: i.valorUnico,
             valorTotal: i.valorTotal
          }))
        }
      }
    })

    revalidatePath('/')
    revalidatePath('/pedidos')
    revalidatePath('/ciclos')
    
    return { success: true, data: pedido }
  } catch (error) {
    console.error("Erro ao confirmar pedido grid:", error)
    return { success: false, error: 'Falha ao salvar carrinho' }
  }
}

// Mantendo apenas pro futuro caso precise, mas em teoria `confirmGridOrder` substitui a antiga
export async function createPedido(
  cicloId: string, 
  subConsultorId: string, 
  valorTotal: number, 
  observacoes?: string,
  comissaoPersonalizada?: number // Se omitido, usa a do perfil
) {
  try {
    // Buscar o consultor para ver a comissão dele
    const sub = await prisma.subConsultor.findUnique({
      where: { id: subConsultorId }
    })

    if (!sub) {
       throw new Error("Sub-consultor não encontrado")
    }

    const comissaoAplicada = comissaoPersonalizada ?? sub.comissao;
    const valorComissao = valorTotal * (comissaoAplicada / 100);
    const lucro = valorTotal - valorComissao;

    const pedido = await prisma.pedido.create({
      data: {
        valorTotal,
        lucro,
        comissaoAplicada,
        observacoes,
        status: 'Lançado',
        subConsultor: { connect: { id: subConsultorId } },
        ciclo: { connect: { id: cicloId } }
      }
    })

    revalidatePath('/')
    revalidatePath('/pedidos')
    return { success: true, data: pedido }

  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return { success: false, error: 'Falha ao lançar pedido' }
  }
}

export async function getPedidosEmAberto() {
  try {
    return await prisma.pedido.findMany({
      where: {
        status: { in: ['LANCADO', 'PENDENTE'] } // Fictício, pode ajustar
      },
      include: {
        subConsultor: true,
        ciclo: true
      },
      orderBy: { dataPedido: 'desc' }
    })
  } catch (error) {
    console.error("Erro ao buscar pedidos em aberto:", error)
    return []
  }
}

export async function marcarPedidoComoPago(id: string) {
  try {
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status: 'PAGO' }
    })
    revalidatePath('/')
    revalidatePath('/pedidos')
    return { success: true, data: pedido }
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    return { success: false, error: 'Falha ao atualizar pedido' }
  }
}

export async function marcarPedidoComoEntregue(id: string) {
  try {
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status: 'ENTREGUE' }
    })
    revalidatePath('/')
    revalidatePath('/pedidos')
    return { success: true, data: pedido }
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    return { success: false, error: 'Falha ao atualizar pedido' }
  }
}

export async function getTodosPedidos() {
  try {
    return await prisma.pedido.findMany({
      include: {
        subConsultor: true,
        ciclo: true,
        itens: true
      },
      orderBy: { dataPedido: 'desc' }
    })
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos:", error)
    return []
  }
}

export async function atualizarItensPedido(
  pedidoId: string,
  itens: { id?: string; nome: string; codigo: string; quantidade: number; valorUnico: number; valorTotal: number }[]
) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { subConsultor: true }
    })
    if (!pedido) throw new Error("Pedido não encontrado")

    // Recalcular totais
    const novoValorTotal = itens.reduce((acc, i) => acc + i.valorTotal, 0)
    const diferencaMargem = pedido.margemMaster - pedido.comissaoAplicada
    const novoLucro = novoValorTotal * (diferencaMargem / 100)

    // Substituição completa dos itens: deleta todos e recria
    await prisma.$transaction([
      prisma.itemPedido.deleteMany({ where: { pedidoId } }),
      prisma.itemPedido.createMany({
        data: itens.map(i => ({
          pedidoId,
          nome: i.nome,
          codigo: i.codigo || null,
          quantidade: i.quantidade,
          valorUnico: i.valorUnico,
          valorTotal: i.valorTotal
        }))
      }),
      prisma.pedido.update({
        where: { id: pedidoId },
        data: { valorTotal: novoValorTotal, lucro: novoLucro }
      })
    ])

    revalidatePath('/')
    revalidatePath('/pedidos')
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar itens do pedido:", error)
    return { success: false, error: 'Falha ao salvar alterações' }
  }
}
