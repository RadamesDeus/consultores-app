'use server'

import prisma from '@/lib/prisma'
import { getCicloAtivo } from './ciclos'
import stringSimilarity from 'string-similarity'

export interface ParsedItem {
  id: string; // temp id for UI grid
  quantidade: number;
  nome: string;
  codigo?: string;
  valorUnico: number;
  valorTotal: number;
}

export async function parseFastOrder(text: string) {
  try {
    const ciclo = await getCicloAtivo();
    if (!ciclo) {
      return { success: false, message: "Nenhum ciclo aberto no momento. Abra um ciclo primeiro." }
    }

    const subs = await prisma.subConsultor.findMany({ where: { status: 'ATIVO' } });
    if (subs.length === 0) {
      return { success: false, message: "Nenhum sub-consultor cadastrado ativo para vincular o pedido." }
    }

    // 1. Encontrar a Consultora iterando similaridade até a primeira vírgula (ou começo do texto)
    const textWords = text.toLowerCase().split(/[ \W]+/);
    let bestSub = null;
    let bestScore = 0;

    for (const sub of subs) {
      const nomeLower = sub.nome.toLowerCase();
      const nomeParts = nomeLower.split(" ");
      for (const p of nomeParts) {
         if (p.length < 3) continue;
         const matches = stringSimilarity.findBestMatch(p, textWords);
         if (matches.bestMatch.rating > bestScore) {
             bestScore = matches.bestMatch.rating;
             bestSub = sub;
         }
      }
    }

    if (!bestSub || bestScore < 0.6) {
      const exactMatch = subs.find(s => text.toLowerCase().includes(s.nome.split(" ")[0].toLowerCase()));
      if (exactMatch) bestSub = exactMatch;
      else return { success: false, message: "Não consegui identificar nenhum nome de consultor no texto." }
    }

    // 2. Extrair múltiplos itens de compra
    // Remover a parte inicial provável (ex: "pedido de Maria ciclo 6,") para focar nos produtos
    let textToParse = text.substring(text.indexOf(',') > -1 ? text.indexOf(',') + 1 : 0);
    // Também pode quebrar no ' e ' 
    const fragments = textToParse.split(/,| e /i).map(s => s.trim()).filter(s => s.length > 2);

    const parsedItems: ParsedItem[] = [];

    // Regex Heurística para capturar o padrão: [QTD] [PRODUTO] cod [CODDIGO] [VALOR] reais
    const regexExtract = /(?:(\d+)\s+)?([a-zA-ZÀ-ÿ\s]+?)\s*(?:cod(?:igo)?\s*(\d+))?\s*(?:de\s*)?\b(\d+(?:[.,]\d{1,2})?)\b(?:\s*reais)?/i;

    for (const frag of fragments) {
       const match = frag.match(regexExtract);
       if (match) {
          const qtyStr = match[1];
          const nameStr = match[2].trim();
          const codeStr = match[3];
          const valStr = match[4];

          const qtd = qtyStr ? parseInt(qtyStr, 10) : 1;
          const valorUnico = parseFloat(valStr.replace(',', '.'));

          // Se o nome ficou vazio por algum motivo, ignorar, ou o regex pode capturar partes incorretas,
          // mas como é muito flexível atende:
          if(nameStr.length > 1) {
             parsedItems.push({
               id: Math.random().toString(36).substring(7),
               quantidade: qtd,
               nome: nameStr,
               codigo: codeStr || '',
               valorUnico: valorUnico,
               valorTotal: qtd * valorUnico
             });
          }
       }
    }

    if (parsedItems.length === 0) {
       return { success: false, message: "Consegui achar o consultor, mas não achei nenhum produto ou formato de valor no seu texto." }
    }

    return { 
      success: true, 
      subConsultor: bestSub,
      ciclo: ciclo,
      items: parsedItems
    }

  } catch (err: any) {
    console.error("Erro no Parse NLP Grid:", err);
    return { success: false, message: "Ocorreu um erro ao processar o texto." }
  }
}
