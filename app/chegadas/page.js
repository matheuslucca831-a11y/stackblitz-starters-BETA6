'use client';

import React, { useState, useRef, useEffect } from 'react';
import { db } from '../../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, CheckCircle2, X, AlertTriangle } from 'lucide-react';

export default function MarcarChegada() {
  
  const [busca, setBusca] = useState('');
  const [expandido, setExpandido] = useState(null); 
  const [modoCorrecao, setModoCorrecao] = useState(false); // Controla se abre formulário de chegada ou de correção
  const [detalhes, setDetalhes] = useState({
    local: '',
    dataConsulta: '',
    horaConsulta: '',
    obs: '',
    motivoCorrecao: '' // Novo campo para o motivo
  });

  // Referências para controlar a esteira de foco por teclado
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const buscaRef = useRef(null);
  const localRef = useRef(null);
  const dataConsultaRef = useRef(null);
  const horaConsultaRef = useRef(null);
  const obsRef = useRef(null);
  const motivoCorrecaoRef = useRef(null); // Nova referência de foco

  useEffect(() => {
    setIndiceSelecionado(0);
  }, [busca]);

  // Garante foco na busca ao carregar a página e gerencia o atalho Ctrl + L
  useEffect(() => {
    buscaRef.current?.focus();
  
    const lidarAtalhoTeclado = (e) => {
      // Ctrl + L
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        fecharEVoltarABusca();
      }
  
      // navegação por teclado
      if (expandido === null) {
        handleKeyDown(e);
      }
    };
  
    window.addEventListener('keydown', lidarAtalhoTeclado);
  
    return () => {
      window.removeEventListener('keydown', lidarAtalhoTeclado);
    };
  }, [expandido, indiceSelecionado]);

  const handleKeyDown = (e) => {
    if (!pacientesPentes) return;
  
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceSelecionado((prev) => Math.min(prev + 1, pacientesPentes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceSelecionado((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && !expandido) {
      e.preventDefault();
      // Abre o formulário do item que está com o "foco" atual
      if (pacientesPentes[indiceSelecionado]) {
        abrirFormulario(pacientesPentes[indiceSelecionado], 'chegada');
      }
    }
  }, [expandido, indiceSelecionado, pacientesPentes, handleKeyDown]);

  // Filtro otimizado indexado do Dexie
  const pacientesPentes = useLiveQuery(async () => {
    const termo = busca.toLowerCase().trim();
    const pendentes = await db.encaminhamentos
      .where('status')
      .anyOf(['Pendente', 'Enviado'])
      .reverse()
      .toArray();

    if (!termo) return pendentes.slice(0, 10); 

    return pendentes.filter((p) => 
      p.nome.toLowerCase().includes(termo) || 
      p.cross.includes(termo) || 
      (p.dataNasc && p.dataNasc.includes(termo))
    );
  }, [busca]);

  // Função para mover o foco para o próximo input ao pressionar Enter
  const pularAoApertarEnter = (e, proximoRef) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      proximoRef.current?.focus();
    }
  };

  // Captura o "Enter" na busca para abrir o primeiro paciente da lista
  const handleKeyDownBusca = (e) => {
    if (
      e.key === 'Enter' &&
      pacientesPentes &&
      pacientesPentes.length > 0
    ) {
      e.preventDefault();
  
      abrirFormulario(
        pacientesPentes[indiceSelecionado],
        'chegada'
      );
    }
  };

  const abrirFormulario = (paciente, modo = 'chegada') => {
    setExpandido(paciente.id);
    setModoCorrecao(modo === 'correcao');
    setDetalhes({
      local: paciente.local || '',
      dataConsulta: '',
      horaConsulta: '',
      obs: '',
      motivoCorrecao: ''
    });

    // Gerencia o foco dependendo do botão clicado
    if (modo === 'correcao') {
      setTimeout(() => motivoCorrecaoRef.current?.focus(), 50);
    } else {
      setTimeout(() => localRef.current?.focus(), 50);
    }
  };

  const confirmarChegada = async (id) => {
    if (!detalhes.local || !detalhes.dataConsulta) {
      alert("Por favor, preencha pelo menos o Local e a Data Marcada!");
      return;
    }

    await db.encaminhamentos.update(id, {
      local: detalhes.local,
      dataConsulta: detalhes.dataConsulta,
      horaConsulta: detalhes.horaConsulta,
      obs: detalhes.obs,
      status: 'Agendado',
      dataChegada: new Date().toLocaleDateString('pt-BR')
    });

    fecharEVoltarABusca();
  };



  // Nova função para dar baixa enviando para correção
  const confirmarCorrecao = async (id) => {
    if (!detalhes.motivoCorrecao.trim()) {
      alert("Por favor, digite o motivo da correção!");
      return;
    }

    await db.encaminhamentos.update(id, {
      status: 'Retornado p/ Correção', // Altera o status (da baixa da lista atual)
      motivoCorrecao: detalhes.motivoCorrecao,
      dataRetornoRegulacao: new Date().toLocaleDateString('pt-BR')
    });

    fecharEVoltarABusca();
  };

  const fecharEVoltarABusca = () => {
    setExpandido(null);
    setModoCorrecao(false);
    setBusca('');
    setTimeout(() => buscaRef.current?.focus(), 50);
  };

  // Máscaras automáticas
  const aplicarMascaraData = (valor) => {
    const v = valor.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const aplicarMascaraHora = (valor) => {
    const v = valor.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) return `${v.slice(0, 2)}:${v.slice(2)}`;
    return v;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black selection:bg-blue-200">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-black text-blue-950 uppercase flex items-center gap-2 tracking-tight">
            <CheckCircle2 className="text-green-600" size={22} /> Marcar Chegada de Malote
          </h1>
          <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold uppercase tracking-wider">
            Atalho: <kbd className="bg-white px-1 border shadow-sm">Ctrl + L</kbd> Nova Busca
          </span>
        </div>

        {/* INPUT DE BUSCA ULTRA RÁPIDO */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            ref={buscaRef}
            type="text"
            placeholder="Digite Nome, CROSS ou Data e aperte [ENTER]..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none shadow-sm text-lg font-medium text-black transition-all placeholder:text-gray-400"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={handleKeyDownBusca}
          />
          {busca && (
            <button onClick={fecharEVoltarABusca} className="absolute right-4 top-4 text-gray-400 hover:text-black">
              <X size={18} />
            </button>
          )}
        </div>

        {/* LISTAGEM DE CARD DE PACIENTE */}
        <div className="space-y-3">
          {pacientesPentes?.map((p, index) => {
            const isSelected = expandido === p.id;
            // AQUI: destaca visualmente quando for o índice selecionado
            const isFocused = indiceSelecionado === index && expandido === null; 

            return (
              <div 
                key={p.id} 
                className={`bg-white rounded-xl border-2 transition-all overflow-hidden ${
                  isSelected ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 
                  isFocused ? 'border-blue-400 ring-1 ring-blue-200' : // Destaque de foco
                  'border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {/* Linha de resumo do paciente */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">CROSS: {p.cross}</span>
                      {p.dataNasc && <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">NASC: {p.dataNasc}</span>}
                      {index === 0 && !expandido && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded animate-pulse">PRESSIONE ENTER</span>}
                    </div>
                    <h3 className="font-extrabold text-gray-900 uppercase text-base truncate">{p.nome}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-0.5">Procedimento: <span className="text-gray-700">{p.especialidade}</span></p>
                  </div>
                  
                  {!isSelected ? (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => abrirFormulario(p, 'chegada')}
                        className="bg-gray-900 text-white px-5 py-2 rounded-lg text-xs font-black hover:bg-blue-600 transition-all uppercase tracking-wider"
                      >
                        Acessar
                      </button>
                      <button
                        onClick={() => abrirFormulario(p, 'correcao')}
                        className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider flex items-center gap-1"
                      >
                        <AlertTriangle size={14} /> Correção
                      </button>
                    </div>
                  ) : (
                    <button onClick={fecharEVoltarABusca} className="text-gray-400 hover:text-red-500 p-1">
                      <X size={22} />
                    </button>
                  )}
                </div>

                {/* FORMULÁRIOS EXPANSÍVEIS */}
                {isSelected && (
                  <>
                    {/* FLUXO 1: FORMULÁRIO DE CHEGADA TRADICIONAL */}
                    {!modoCorrecao && (
                      <div className="bg-slate-50 p-4 border-t-2 border-blue-600 grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px]">
                        <div>
                          <label className="block font-black text-gray-500 uppercase mb-1">Local da Consulta</label>
                          <input
                            ref={localRef}
                            type="text"
                            list="locais-comuns"
                            className="w-full px-3 py-2 rounded border-2 border-gray-300 outline-none focus:border-blue-600 text-black font-bold 'uppercase' transition-all"
                            placeholder="Ex: AME CARAGUA"
                            value={detalhes.local}
                            onChange={(e) => setDetalhes({...detalhes, local: e.target.value.toUpperCase()})}
                            onKeyDown={(e) => pularAoApertarEnter(e, dataConsultaRef)} 
                          />
                          <datalist id="locais-comuns">
                            <option value="AME CARAGUATATUBA" />
                            <option value="HOSPITAL REGIONAL" />
                            <option value="HOSPITAL CLÍNICA SÃO SEBASTIÃO" />
                            <option value="FSPSS CENTRO" />
                          </datalist>
                        </div>

                        <div>
                          <label className="block font-black text-gray-500 uppercase mb-1">Data Marcada</label>
                          <input
                            ref={dataConsultaRef}
                            type="text"
                            maxLength={10}
                            className="w-full px-3 py-2 rounded border-2 border-gray-300 outline-none focus:border-blue-600 text-black font-bold transition-all"
                            placeholder="DD/MM/AAAA"
                            value={detalhes.dataConsulta}
                            onChange={(e) => setDetalhes({...detalhes, dataConsulta: aplicarMascaraData(e.target.value)})}
                            onKeyDown={(e) => pularAoApertarEnter(e, horaConsultaRef)} 
                          />
                        </div>

                        <div>
                          <label className="block font-black text-gray-500 uppercase mb-1">Horário</label>
                          <input
                            ref={horaConsultaRef}
                            type="text"
                            maxLength={5}
                            className="w-full px-3 py-2 rounded border-2 border-gray-300 outline-none focus:border-blue-600 text-black font-bold transition-all"
                            placeholder="00:00"
                            value={detalhes.horaConsulta}
                            onChange={(e) => setDetalhes({...detalhes, horaConsulta: aplicarMascaraHora(e.target.value)})}
                            onKeyDown={(e) => pularAoApertarEnter(e, obsRef)} 
                          />
                        </div>

                        <div>
                          <label className="block font-black text-gray-500 uppercase mb-1">Observações</label>
                          <input
                            ref={obsRef}
                            type="text"
                            className="w-full px-3 py-2 rounded border-2 border-gray-300 outline-none focus:border-blue-600 text-black font-medium transition-all"
                            placeholder="Opcional"
                            value={detalhes.obs}
                            onChange={(e) => setDetalhes({...detalhes, obs: e.target.value.toUpperCase()})}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                confirmarChegada(p.id); 
                              }
                            }}
                          />
                        </div>

                        <div className="md:col-span-4 mt-2 flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                          <span className="text-[10px] text-gray-400 font-medium italic">Dica: Preencha os campos e vá apertando <kbd className="font-bold bg-gray-100 px-1 rounded border">Enter</kbd> para avançar e salvar.</span>
                          <div className="flex gap-2">
                            <button onClick={fecharEVoltarABusca} className="px-3 py-1.5 text-gray-500 font-bold hover:underline">CANCELAR</button>
                            <button 
                              onClick={() => confirmarChegada(p.id)}
                              className="px-6 py-1.5 bg-blue-600 text-white font-black rounded text-xs hover:bg-blue-700 shadow uppercase tracking-wide"
                            >
                              Confirmar [Enter]
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FLUXO 2: FORMULÁRIO DE RETORNO PARA CORREÇÃO */}
                    {modoCorrecao && (
                      <div className="bg-amber-50 p-4 border-t-2 border-amber-500 grid grid-cols-1 gap-3 text-[11px]">
                        <div>
                          <label className="block font-black text-amber-900 uppercase mb-1">Motivo do Retorno / Correção da Regulação</label>
                          <input
                            ref={motivoCorrecaoRef}
                            type="text"
                            className="w-full px-3 py-2 rounded border-2 border-amber-300 outline-none focus:border-amber-600 text-black font-bold uppercase transition-all"
                            placeholder="Ex: LAUDO MÉDICO ANTIGO OU CUSTO CUSTEIO PENDENTE"
                            value={detalhes.motivoCorrecao}
                            onChange={(e) => setDetalhes({...detalhes, motivoCorrecao: e.target.value.toUpperCase()})}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                confirmarCorrecao(p.id); // Salva e dá baixa ao apertar Enter
                              }
                            }}
                          />
                        </div>

                        <div className="mt-1 flex justify-between items-center bg-white p-2 rounded border border-amber-200">
                          <span className="text-[10px] text-amber-700 font-medium italic">Dica: Digite o motivo apontado pela regulação e aperte <kbd className="font-bold bg-amber-100 px-1 rounded border">Enter</kbd> para dar baixa.</span>
                          <div className="flex gap-2">
                            <button onClick={fecharEVoltarABusca} className="px-3 py-1.5 text-gray-500 font-bold hover:underline">CANCELAR</button>
                            <button 
                              onClick={() => confirmarCorrecao(p.id)}
                              className="px-6 py-1.5 bg-amber-600 text-white font-black rounded text-xs hover:bg-amber-700 shadow uppercase tracking-wide"
                            >
                              Dar Baixa [Enter]
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {pacientesPentes?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">Nenhum encaminhamento pendente ou enviado com esse termo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
