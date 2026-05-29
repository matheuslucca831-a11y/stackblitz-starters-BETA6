'use client';

import React from 'react';
import Link from 'next/link';
import { 
  UserPlus, Package, Send, ArrowUpRight, 
  Activity, FileText, CheckCircle, Wrench
} from 'lucide-react';

export default function Home() {
  // Indicadores rápidos de integridade e status do IndexedDB local
  const infoRapidas = [
    { label: 'Status do Sistema', value: 'Local / Offline', icon: <Activity size={16} className="text-emerald-500" /> },
    { label: 'Banco de Dados', value: 'IndexedDB Ativo', icon: <CheckCircle size={16} className="text-blue-500" /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-8 text-gray-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO PRINCIPAL */}
        <div className="border-b-2 border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-1">
              FSPSS - Fundação de Saúde Pública de São Sebastião
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Gestão Clínica & Administrativa
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wide">
              Módulos locais integrados para otimização de fluxo de trabalho
            </p>
          </div>

          {/* INDICADORES RÁPIDOS DE STATUS */}
          <div className="flex gap-3">
            {infoRapidas.map((item, index) => (
              <div key={index} className="border p-3 rounded-xl flex items-center gap-3 bg-white shadow-sm min-w-[160px]">
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                  {item.icon}
                </div>
                <div>
                  <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs font-black text-gray-800">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEÇÃO DOS MÓDULOS */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Selecione o Módulo de Trabalho
          </h2>

          {/* GRADE DE LINKS DINÂMICA (4 COLUNAS EM TELAS GRANDES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* CARD 1: ENCAMINHAMENTOS (REGULAÇÃO) */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <UserPlus size={20} />
                </div>
                <h3 className="font-black text-base text-gray-900 uppercase tracking-tight">Encaminhamentos</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                  Controle interno de demandas e triagem de guias. Organiza o fluxo local antes do envio físico para processamento e marcação na Regulação.
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/encaminhamentos" className="flex items-center justify-between text-xs font-bold text-emerald-600 hover:underline py-1">
                  <span>Novo Registro / Entrada</span>
                  <ArrowUpRight size={14} />
                </Link>
                <Link href="/chegadas" className="flex items-center justify-between text-xs font-bold text-gray-600 hover:underline py-1">
                  <span>Marcar Chegada de Guia</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 2: REMESSAS (RECURSOS HUMANOS / ALMOXARIFADO) */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Send size={18} />
                </div>
                <h3 className="font-black text-base text-gray-900 uppercase tracking-tight">Remessas Oficiais</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                  Emissão e controle de guias de remessa com numeração sequencial anual. Ideal para o envio formalizado de ocorrências ao RH e documentos diversos.
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/remessas" className="flex items-center justify-between text-xs font-bold text-emerald-600 hover:underline py-1">
                  <span>Emitir Nova Guia de Remessa</span>
                  <ArrowUpRight size={14} />
                </Link>
                <Link href="/remessas/historico" className="flex items-center justify-between text-xs font-bold text-gray-600 hover:underline py-1">
                  <span>Histórico de Envios (Baixas)</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 3: PEDIDOS MENSAIS */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-4 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <Package size={18} />
                </div>
                <h3 className="font-black text-base text-gray-900 uppercase tracking-tight">Pedidos Mensais</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                  Gestão recorrente e conferência de insumos da unidade. Controle de pedidos para materiais de limpeza, artigos de escritório e fórmulas para acamados.
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/pedidos/limpeza" className="flex items-center justify-between text-xs font-bold text-emerald-600 hover:underline py-1">
                  <span>Material de Limpeza</span>
                  <ArrowUpRight size={14} />
                </Link>
                <Link href="/pedidos/escritorio" className="flex items-center justify-between text-xs font-bold text-gray-600 hover:underline py-1">
                  <span>Material de Escritório</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* CARD 4: MÓDULO S.O.S (MANUTENÇÃO) */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <Wrench size={18} />
                </div>
                <h3 className="font-black text-base text-gray-900 uppercase tracking-tight">Manutenção S.O.S</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                  Abertura e monitoramento de reparos estruturais, técnicos e de urgência da unidade. Emissão imediata da ficha física de vistoria para a equipe técnica.
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/sos/gerarsos" className="flex items-center justify-between text-xs font-bold text-emerald-600 hover:underline py-1">
                  <span>Gerar Nova Guia S.O.S</span>
                  <ArrowUpRight size={14} />
                </Link>
                <Link href="/sos/historicosos" className="flex items-center justify-between text-xs font-bold text-gray-600 hover:underline py-1">
                  <span>Controle de Chamados</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* NOTA DE RODAPÉ / AVISO DE SEGURANÇA */}
        <div className="p-4 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-700 text-gray-300">
              <FileText size={16} />
            </div>
            <p className="text-[11px] font-medium leading-normal text-gray-400">
              <strong className="text-white block uppercase tracking-wide">Aviso Importante de Dados Localizados</strong>
              Este sistema opera de maneira estritamente local (IndexedDB). Os arquivos e dados salvos permanecem protegidos localmente na sandbox deste navegador.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}