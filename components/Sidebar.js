'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, UserPlus, ClipboardCheck, History, 
  Package, Send, Settings, ChevronDown, FileText, MessageSquare,
  AlertCircle, HelpCircle, BarChart3, Activity
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const [remessasAberto, setRemessasAberto] = useState(false);
  const [pedidosAberto, setPedidosAberto] = useState(false);
  const [encaminhamentosAberto, setEncaminhamentosAberto] = useState(false);
  const [sosAberto, setSosAberto] = useState(false);
  const [examesAberto, setExamesAberto] = useState(false);

  // Lógica corrigida para alternar (abrir/fechar) corretamente
  const toggleMenu = (setter, currentState) => {
    // Fecha todos
    setRemessasAberto(false);
    setPedidosAberto(false);
    setEncaminhamentosAberto(false);
    setSosAberto(false);
    setExamesAberto(false);
    
    // Abre apenas o clicado (se ele já estava aberto, !true vira false, ou seja, fecha)
    setter(!currentState);
  };

  useEffect(() => {
    if (pathname.startsWith('/remessas')) {
      setRemessasAberto(true);
    } 
    // Correção aqui: usando startsWith ou === para não pegar o /sos/historicosos por engano
    else if (pathname.startsWith('/encaminhamentos') || pathname.startsWith('/chegadas') || pathname === '/historico') {
      setEncaminhamentosAberto(true);
    } 
    else if (pathname.startsWith('/pedidos')) {
      setPedidosAberto(true);
    } 
    else if (pathname.startsWith('/sos')) {
      setSosAberto(true);
    } 
    else if (pathname.startsWith('/produtividade')) {
      setProdutividadeAberto(true);
    } 
    else if (pathname.startsWith('/exames')) {
      setExamesAberto(true);
    }
  }, [pathname]);
  // Lista de itens
  const subItensProdutividade = [{ name: 'Gerar Produtividade (Em Production)', path: '/produtividade' }];
  const subItensRemessas = [
    { name: 'Geração de Remessa', icon: <Send size={18} />, path: '/remessas' },
    { name: 'Remessa p/ Encaminhamentos', icon: <Send size={18} />, path: '/remessas/encaminhamentos' },
    { name: 'Controle de Remessas', icon: <History size={18} />, path: '/remessas/historico' },
  ];
  const subItensPedidos = [
    { name: 'Material de Limpeza', path: '/pedidos/limpeza' },
    { name: 'Material de Escritório', path: '/pedidos/escritorio' },
    { name: 'Crônicos e Acamados', path: '/pedidos/cronicos' },
    { name: 'Correlatos', path: '/pedidos/correlatos' },
  ];
  const subItensEncaminhamentos = [
    { name: 'Novo Registro', icon: <UserPlus size={18} />, path: '/encaminhamentos' },
    { name: 'Marcar Chegada', icon: <ClipboardCheck size={18} />, path: '/chegadas' },
    { name: 'Histórico Geral', icon: <History size={18} />, path: '/historico' },
  ];
  const subItensSos = [
    { name: 'Gerar SOS', icon: <FileText size={18} />, path: '/sos/gerarsos' },
    { name: 'Controle de SOS', icon: <History size={18} />, path: '/sos/historicosos' },
  ];
  const subItensExames = [
    { name: 'Dar Baixa (Avulsos)', icon: <ClipboardCheck size={18} />, path: '/exames' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col border-r border-gray-800">
      <div className="p-6">
        <h2 className="text-xl font-bold text-green-400 tracking-tighter">FSPSS</h2>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Gestão Clínica</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <Link href="/" onClick={() => toggleMenu(() => {}, true)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${pathname === '/' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
          <Home size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>

 
        {/* REMESSAS */}
        <div className="space-y-1">
          <button onClick={() => toggleMenu(setRemessasAberto, remessasAberto)} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all ${pathname.startsWith('/remessas') ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <div className="flex items-center gap-3"><FileText size={20} /><span className="font-medium">Remessas</span></div>
            <ChevronDown size={16} className={`transition-transform ${remessasAberto ? 'rotate-180' : ''}`} />
          </button>
          {remessasAberto && (
            <div className="ml-9 border-l border-gray-800 space-y-1">
              {subItensRemessas.map((sub) => (
                <Link key={sub.path} href={sub.path} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-r-lg ${pathname === sub.path ? 'text-blue-400 font-bold bg-blue-900/20 border-l-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                  {sub.icon}{sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ENCAMINHAMENTOS */}
        <div className="space-y-1">
          <button 
            onClick={() => toggleMenu(setEncaminhamentosAberto, encaminhamentosAberto)} 
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all ${pathname.startsWith('/encaminhamentos') || pathname.startsWith('/chegadas') || pathname === '/historico' ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3"><UserPlus size={20} /><span className="font-medium">Encaminhamentos</span></div>
            <ChevronDown size={16} className={`transition-transform ${encaminhamentosAberto ? 'rotate-180' : ''}`} />
          </button>
          {encaminhamentosAberto && (
            <div className="ml-9 border-l border-gray-800 space-y-1">
              {subItensEncaminhamentos.map((sub) => (
                <Link key={sub.path} href={sub.path} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-r-lg ${pathname === sub.path ? 'text-blue-400 font-bold bg-blue-900/20 border-l-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                  {sub.icon}{sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* EXAMES AVULSOS */}
        <div className="space-y-1">
          <button onClick={() => toggleMenu(setExamesAberto, examesAberto)} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all ${pathname.startsWith('/exames') ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Activity size={20} /><span className="font-medium">Exames</span></div>
            <ChevronDown size={16} className={`transition-transform ${examesAberto ? 'rotate-180' : ''}`} />
          </button>
          {examesAberto && (
            <div className="ml-9 border-l border-gray-800 space-y-1">
              {subItensExames.map((sub) => (
                <Link key={sub.path} href={sub.path} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-r-lg ${pathname === sub.path ? 'text-blue-400 font-bold bg-blue-900/20 border-l-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                  {sub.icon}{sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* SOS */}
        <div className="space-y-1">
          <button onClick={() => toggleMenu(setSosAberto, sosAberto)} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all ${pathname.startsWith('/sos') ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <div className="flex items-center gap-3"><AlertCircle size={20} /><span className="font-medium">SOS</span></div>
            <ChevronDown size={16} className={`transition-transform ${sosAberto ? 'rotate-180' : ''}`} />
          </button>
          {sosAberto && (
            <div className="ml-9 border-l border-gray-800 space-y-1">
              {subItensSos.map((sub) => (
                <Link key={sub.path} href={sub.path} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-r-lg ${pathname === sub.path ? 'text-blue-400 font-bold bg-blue-900/20 border-l-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                  {sub.icon}{sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* PEDIDOS */}
        <div className="space-y-1">
          <button onClick={() => toggleMenu(setPedidosAberto, pedidosAberto)} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all ${pathname.includes('/pedidos') ? 'text-white bg-gray-800/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
            <div className="flex items-center gap-3"><Package size={20} /><span className="font-medium">Pedidos Mensais</span></div>
            <ChevronDown size={16} className={`transition-transform ${pedidosAberto ? 'rotate-180' : ''}`} />
          </button>
          {pedidosAberto && (
            <div className="ml-9 border-l border-gray-800 space-y-1">
              {subItensPedidos.map((sub) => (
                <Link key={sub.path} href={sub.path} className={`block px-4 py-2 text-sm rounded-r-lg ${pathname === sub.path ? 'text-blue-400 font-bold bg-blue-900/20 border-l-2 border-blue-400' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/automacao" onClick={() => toggleMenu(() => {}, true)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${pathname === '/automacao' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
          <MessageSquare size={20} />
          <span className="font-medium">Automação de Envio (WhatsApp)</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <Link href="/faq" onClick={() => toggleMenu(() => {}, true)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium"><HelpCircle size={20} /> <span>Manual & FAQ</span></Link>
        <Link href="/configuracoes" onClick={() => toggleMenu(() => {}, true)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium"><Settings size={20} /> <span>Configurações</span></Link>
      </div>
    </aside>
  );
}