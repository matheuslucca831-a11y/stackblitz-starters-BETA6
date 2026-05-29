'use client';

import React, { useState, useRef, useEffect } from 'react';
import { db } from '../../db'; 
import { useLiveQuery } from 'dexie-react-hooks';
import { PlusCircle, Trash2, ArrowLeft, UserCheck, RefreshCw, AlertTriangle, FilePlus } from 'lucide-react';
import Link from 'next/link';

// BASE DE DADOS DE PROTOCOLOS PADRÃO 
const PROTOCOLOS_PADRAO: Record<string, { sigla: string; checklist: string }> = {
  'ORTOPEDIA': { sigla: 'ORT', checklist: 'Exige Raio-X (RX) recente anexado à guia física.' },
  'ENDOCRINOLOGIA': { sigla: 'END', checklist: 'Requer exames de sangue recentes.' },
  'CARDIOLOGIA': { sigla: 'CARD', checklist: 'Obrigatório Eletrocardiograma (ECG) laudado dos últimos 6 meses.' },
  'OFTALMOLOGIA': { sigla: 'OFT', checklist: 'Não requer exames complementares.' },
  'DERMATOLOGIA': { sigla: 'DERM', checklist: 'Não requer exames complementares.' },
  'US ABDOMEN TOTAL': { sigla: 'US ABD', checklist: 'Não requer exames complementares.' },
  'US TIREOIDE': { sigla: 'US TIR', checklist: 'Não requer exames complementares.' },
  'US TRANSVAGINAL': { sigla: 'US TV', checklist: 'Não requer exames complementares.' },
  'US PAREDE ABDOMINAL': { sigla: 'US PA', checklist: 'Não requer exames complementares.' },
};

export default function Encaminhamentos() {
  const [formData, setFormData] = useState({
    nome: '',
    cross: '',
    especialidade: '',
    dataNasc: '',
    telefone: ''
  });
  
  const [showSugestao, setShowSugestao] = useState(false);
  const [sugestao, setSugestao] = useState<any>(null);
  const [perguntarAtualizacao, setPerguntarAtualizacao] = useState(false);
  
  // Estados para o Protocolo Dinâmico
  const [protocolos, setProtocolos] = useState(PROTOCOLOS_PADRAO);
  const [protocoloAtivo, setProtocoloAtivo] = useState<{ sigla: string; checklist: string } | null>(null);
  const [showModalNovoExame, setShowModalNovoExame] = useState(false);
  const [novoExameData, setNovoExameData] = useState({ nome: '', sigla: '', checklist: '' });

  // Estados para o Autocomplete (Dropdown)
  const [opcoesFiltradas, setOpcoesFiltradas] = useState<string[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  // Referências para controlar a esteira de foco por teclado
  const crossRef = useRef<HTMLInputElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const dataNascRef = useRef<HTMLInputElement>(null);
  const telefoneRef = useRef<HTMLInputElement>(null);
  const especialidadeRef = useRef<HTMLInputElement>(null);
  const btnSugestaoRef = useRef<HTMLButtonElement>(null);
  const novoExameNomeRef = useRef<HTMLInputElement>(null);

  // ESCUTADOR DE ATALHOS GLOBAIS (Ctrl + L e Ctrl + I)
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      // MANTÉM Ctrl + L para focar Especialidade
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        especialidadeRef.current?.focus();
        especialidadeRef.current?.select();
      }
      
      // Ctrl + I para Inserir Novo Exame
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        abrirCadastroNovoExame();
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [formData.especialidade, protocolos]);

  // Carrega os últimos 15 registros
  const registros = useLiveQuery(() => 
    (db as any).encaminhamentos.reverse().limit(15).toArray()
  ) || [];

  // Máscaras de Auto-Preenchimento
  const aplicarMascaraData = (valor: string) => {
    const v = valor.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const aplicarMascaraTelefone = (valor: string) => {
    const v = valor.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    return v;
  };

  const pularAoApertarEnter = (e: React.KeyboardEvent, proximoRef: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      proximoRef.current?.focus();
    }
  };

  const verificarCross = async (valor: string) => {
    const valorMaiusculo = valor.toUpperCase();
    setFormData(prev => ({...prev, cross: valorMaiusculo}));

    if (valorMaiusculo.length > 2) {
      const jaExiste = await (db as any).encaminhamentos.where('cross').equals(valorMaiusculo).first();
      if (jaExiste) {
        setSugestao(jaExiste);
        setShowSugestao(true);
        setTimeout(() => btnSugestaoRef.current?.focus(), 50);
      } else {
        setShowSugestao(false);
      }
    }
  };

  const aceitarSugestao = () => {
    setFormData({
      nome: sugestao.nome.toUpperCase(),
      cross: sugestao.cross.toUpperCase(),
      especialidade: '',
      dataNasc: sugestao.dataNasc || '',
      telefone: (sugestao.telefone || '').toUpperCase()
    });
    setShowSugestao(false);
    setTimeout(() => especialidadeRef.current?.focus(), 50);
  };

  // -------------------------------------------------------------
  // LÓGICA DO AUTOCOMPLETE (DROPDOWN E FILTRO)
  // -------------------------------------------------------------
  const handleEspecialidadeChange = (valor: string) => {
    const valorMaiusculo = valor.toUpperCase();
    setFormData(prev => ({ ...prev, especialidade: valorMaiusculo }));

    // Filtra as chaves que contêm o que foi digitado
    if (valorMaiusculo.length > 0) {
      const filtradas = Object.keys(protocolos).filter(key => 
        key.includes(valorMaiusculo) || protocolos[key].sigla.includes(valorMaiusculo)
      );
      setOpcoesFiltradas(filtradas);
      setMostrarDropdown(filtradas.length > 0);
      setIndiceAtivo(0); // Reseta a setinha para o topo
    } else {
      setMostrarDropdown(false);
    }

    // Se já bateu exatamente com o nome, mostra o protocolo na hora
    if (protocolos[valorMaiusculo]) {
      setProtocoloAtivo(protocolos[valorMaiusculo]);
    } else {
      setProtocoloAtivo(null);
    }
  };

  const selecionarEspecialidade = (nomeEspecialidade: string) => {
    setFormData(prev => ({ ...prev, especialidade: nomeEspecialidade }));
    setProtocoloAtivo(protocolos[nomeEspecialidade]);
    setMostrarDropdown(false);
    setOpcoesFiltradas([]);
    especialidadeRef.current?.focus();
  };

  const handleEspecialidadeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mostrarDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndiceAtivo(prev => (prev + 1) % opcoesFiltradas.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndiceAtivo(prev => (prev - 1 + opcoesFiltradas.length) % opcoesFiltradas.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selecionarEspecialidade(opcoesFiltradas[indiceAtivo]);
      } else if (e.key === 'Escape') {
        setMostrarDropdown(false);
      }
    } else if (e.key === 'Enter') {
      // Se o dropdown estiver fechado, o Enter salva o formulário normalmente
    }
  };
  // -------------------------------------------------------------

  const abrirCadastroNovoExame = () => {
    setNovoExameData({
      nome: formData.especialidade,
      sigla: formData.especialidade.slice(0, 4),
      checklist: ''
    });
    setShowModalNovoExame(true);
    setMostrarDropdown(false);
    setTimeout(() => novoExameNomeRef.current?.focus(), 50);
  };

  const salvarNovoExameProtocolo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoExameData.nome || !novoExameData.sigla) return;

    const nomeKey = novoExameData.nome.toUpperCase();
    const novosProtocolos = {
      ...protocolos,
      [nomeKey]: {
        sigla: novoExameData.sigla.toUpperCase(),
        checklist: novoExameData.checklist || 'Sem critérios específicos cadastrados.'
      }
    };

    setProtocolos(novosProtocolos);
    setFormData(prev => ({ ...prev, especialidade: nomeKey }));
    setProtocoloAtivo(novosProtocolos[nomeKey]);
    setShowModalNovoExame(false);
    
    setTimeout(() => especialidadeRef.current?.focus(), 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cross) return alert("Preencha Nome e CROSS!");

    if (sugestao && (formData.telefone !== (sugestao.telefone || '').toUpperCase() || formData.dataNasc !== (sugestao.dataNasc || ''))) {
        setPerguntarAtualizacao(true);
        return;
    }

    executarSalvamento(false);
  };

  const executarSalvamento = async (atualizarTodos = false) => {
    try {
      if (atualizarTodos && sugestao) {
        await (db as any).encaminhamentos
          .where('cross')
          .equals(formData.cross)
          .modify({ 
            telefone: formData.telefone, 
            dataNasc: formData.dataNasc, 
            nome: formData.nome 
          });
      }

      await (db as any).encaminhamentos.add({
        ...formData,
        status: 'Pendente',
        dataRegistro: new Date().toLocaleDateString('pt-BR')
      });
      
      setFormData({ nome: '', cross: '', especialidade: '', dataNasc: '', telefone: '' });
      setShowSugestao(false);
      setSugestao(null);
      setPerguntarAtualizacao(false);
      setProtocoloAtivo(null);
      setMostrarDropdown(false);
      
      crossRef.current?.focus();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black selection:bg-blue-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center text-blue-600 hover:underline font-bold transition-all">
            <ArrowLeft size={20} className="mr-1" /> VOLTAR
          </Link>
          <h1 className="text-xl font-black text-blue-950 uppercase tracking-tight">FSPSS — Entrada de Encaminhamentos</h1>
        </div>

        {/* Alerta de sugestão */}
        {showSugestao && (
          <div className="bg-blue-600 text-white p-4 rounded-xl mb-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center">
              <UserCheck className="mr-3" />
              <span>Paciente já cadastrado: <strong className="underline">{sugestao.nome}</strong>. Deseja aproveitar os dados?</span>
            </div>
            <div className="flex gap-2">
              <button 
                ref={btnSugestaoRef}
                onClick={aceitarSugestao} 
                className="bg-white text-blue-600 px-5 py-2 rounded-lg font-black hover:bg-gray-100 transition-all shadow text-xs uppercase"
              >
                [ENTER] SIM
              </button>
              <button 
                onClick={() => { setShowSugestao(false); nomeRef.current?.focus(); }}
                className="bg-blue-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-900 transition-all text-xs uppercase"
              >
                NÃO (DIGITAR)
              </button>
            </div>
          </div>
        )}

        {perguntarAtualizacao && (
          <div className="bg-orange-500 text-white p-4 rounded-xl mb-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center">
              <RefreshCw className="mr-3 animate-spin" />
              <span>Deseja replicar essas alterações de telefone/nascimento para os históricos antigos deste paciente?</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => executarSalvamento(true)} className="bg-white text-orange-600 px-4 py-1.5 rounded font-black text-xs shadow">SIM, ATUALIZAR</button>
              <button onClick={() => executarSalvamento(false)} className="bg-orange-700 text-white px-4 py-1.5 rounded font-black text-xs">NÃO, SÓ ESTE</button>
            </div>
          </div>
        )}

        {/* Formulário com a esteira de foco funcional */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-end mb-2">
            <div className="w-44">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nº CROSS</label>
              <input 
                ref={crossRef} 
                type="text" 
                className="w-full border-b-2 border-gray-200 focus:border-blue-600 outline-none py-1 text-black font-black uppercase transition-all" 
                value={formData.cross} 
                onChange={(e) => verificarCross(e.target.value)} 
                onKeyDown={(e) => pularAoApertarEnter(e, nomeRef)} 
                placeholder="000.000" 
                required 
                autoFocus
              />
            </div>

            <div className="flex-1 min-w-[280px]">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nome Completo</label>
              <input 
                ref={nomeRef} 
                type="text" 
                className="w-full border-b-2 border-gray-200 focus:border-blue-600 outline-none py-1 text-black font-bold uppercase transition-all" 
                value={formData.nome} 
                onChange={(e) => setFormData({...formData, nome: e.target.value.toUpperCase()})} 
                onKeyDown={(e) => pularAoApertarEnter(e, dataNascRef)} 
                placeholder="NOME DO PACIENTE" 
                required 
              />
            </div>

            <div className="w-36">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data Nasc.</label>
              <input 
                ref={dataNascRef}
                type="text" 
                maxLength={10}
                className="w-full border-b-2 border-gray-200 focus:border-blue-600 outline-none py-1 text-black font-bold transition-all" 
                value={formData.dataNasc} 
                onChange={(e) => setFormData({...formData, dataNasc: aplicarMascaraData(e.target.value)})} 
                onKeyDown={(e) => pularAoApertarEnter(e, telefoneRef)} 
                placeholder="DD/MM/AAAA" 
              />
            </div>

            <div className="w-40">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Telefone</label>
              <input 
                ref={telefoneRef}
                type="text" 
                maxLength={15}
                className="w-full border-b-2 border-gray-200 focus:border-blue-600 outline-none py-1 text-black font-bold transition-all" 
                value={formData.telefone} 
                onChange={(e) => setFormData({...formData, telefone: aplicarMascaraTelefone(e.target.value)})} 
                onKeyDown={(e) => pularAoApertarEnter(e, especialidadeRef)} 
                placeholder="(12) 99999-0000" 
              />
            </div>

            <div className="flex-1 min-w-[220px] relative">
              <div className="flex justify-between items-center mb-0.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Especialidade / Exame</label>
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">
                  Novo: Ctrl + I
                </span>
              </div>
              
              {/* O INPUT DE ESPECIALIDADE COM OS NOVOS EVENTOS */}
              <input 
                ref={especialidadeRef} 
                type="text" 
                className="w-full border-b-2 border-gray-200 focus:border-blue-600 outline-none py-1 text-black font-black uppercase transition-all" 
                value={formData.especialidade} 
                onChange={(e) => handleEspecialidadeChange(e.target.value)} 
                onKeyDown={handleEspecialidadeKeyDown}
                onBlur={() => setTimeout(() => setMostrarDropdown(false), 200)} // Fecha se clicar fora
                placeholder="Ex: US ABD" 
                autoComplete="off"
              />

              {/* LISTA SUSPENSA (DROPDOWN) */}
              {mostrarDropdown && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 shadow-xl rounded-b-lg mt-1 max-h-48 overflow-y-auto">
                  {opcoesFiltradas.map((opcao, index) => (
                    <li 
                      key={opcao}
                      onClick={() => selecionarEspecialidade(opcao)}
                      className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors flex justify-between items-center ${index === indiceAtivo ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`}
                    >
                      {opcao} 
                      <span className={`text-[9px] px-1 rounded ${index === indiceAtivo ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                        {protocolos[opcao].sigla}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-black transition-all flex items-center shrink-0 uppercase tracking-wide text-xs">
              <PlusCircle size={16} className="mr-2" /> Salvar [Enter]
            </button>
          </div>

          {/* DROPBOX DE PROTOCOLO EMBAIXO DO CAMPO */}
          {protocoloAtivo && (
            <div className="mt-4 bg-slate-900 border-l-4 border-amber-500 rounded-r-xl p-3 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2 duration-150">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                    Protocolo: {protocoloAtivo.sigla}
                  </span>
                  <span className="text-white text-xs font-bold uppercase tracking-tight">Critérios Obrigatórios para Aprovação</span>
                </div>
                <p className="text-gray-300 text-xs mt-1 font-medium leading-relaxed">
                  {protocoloAtivo.checklist}
                </p>
              </div>
            </div>
          )}
        </form>

        {/* MODAL RAPIDO PARA CADASTRO DE EXAME INEXISTENTE (Ativado via Ctrl + I) */}
        {showModalNovoExame && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="bg-gray-900 text-white p-4 flex items-center gap-2">
                <FilePlus size={18} className="text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-wider">Adicionar Novo Protocolo</h3>
              </div>
              <form onSubmit={salvarNovoExameProtocolo} className="p-4 flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Nome da Especialidade / Exame</label>
                  <input 
                    ref={novoExameNomeRef}
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-600"
                    value={novoExameData.nome}
                    onChange={(e) => setNovoExameData({...novoExameData, nome: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Sigla Padrão (Max 4 letras)</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-black uppercase outline-none focus:border-blue-600"
                    value={novoExameData.sigla}
                    onChange={(e) => setNovoExameData({...novoExameData, sigla: e.target.value.toUpperCase()})}
                    placeholder="Ex: USG"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Critérios / Checklist Técnico (O que precisa?)</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-blue-600 resize-none"
                    value={novoExameData.checklist}
                    onChange={(e) => setNovoExameData({...novoExameData, checklist: e.target.value})}
                    placeholder="Ex: Necessário exame de ureia e creatinina recentes..."
                  />
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowModalNovoExame(false)} 
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-black text-xs hover:bg-blue-700 transition-all uppercase"
                  >
                    SALVAR ATALHO
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabela de Histórico Recente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Últimos Lançamentos
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-gray-800 text-white uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Data Reg.</th>
                <th className="p-3">CROSS</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Nascimento</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Especialidade</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg: any) => (
                <tr key={reg.id} className="hover:bg-blue-50/60 border-b border-gray-100 transition-colors">
                  <td className="p-3 text-gray-500 font-medium">{reg.dataRegistro}</td>
                  <td className="p-3 font-black text-blue-700 uppercase">{reg.cross}</td>
                  <td className="p-3 font-bold text-gray-900 uppercase">{reg.nome}</td>
                  <td className="p-3 text-gray-700 font-medium">{reg.dataNasc}</td>
                  <td className="p-3 text-gray-700 font-medium">{reg.telefone}</td>
                  <td className="p-3 font-extrabold text-slate-700 uppercase">{reg.especialidade}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => (db as any).encaminhamentos.delete(reg.id)} className="text-gray-400 hover:text-red-600 p-1 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}