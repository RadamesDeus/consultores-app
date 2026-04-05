import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando injeção de dados de teste...")

  // 1. Criar um Ciclo Aberto
  const ciclo = await prisma.ciclo.upsert({
    where: { codigo: '2026-05' },
    update: {},
    create: {
      codigo: '2026-05',
      dataInicio: new Date('2026-05-01'),
      dataFim: new Date('2026-05-31'),
      status: 'ABERTO'
    }
  })
  console.log("✅ Ciclo Criado:", ciclo.codigo)

  // 2. Criar Sub-Consultores
  const subs = [
    { nome: 'Maria Silva', telefone: '11999999991', comissao: 25.0 },
    { nome: 'João Mendes', telefone: '11999999992', comissao: 20.0 },
    { nome: 'Carla Pereira', telefone: '11999999993', comissao: 30.0 },
    { nome: 'Rafael Fernandes', telefone: '11999999994', comissao: 15.0 },
  ]

  for (const s of subs) {
    const created = await prisma.subConsultor.create({
      data: {
        nome: s.nome,
        telefone: s.telefone,
        comissao: s.comissao,
        status: 'ATIVO' // Match schema string default ATIVO
      }
    })
    console.log("✅ Consultor(a) Criado(a):", created.nome)
  }

  console.log("🚀 Dados injetados com sucesso! Agora você pode testar o Registro Rápido Livremente.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
