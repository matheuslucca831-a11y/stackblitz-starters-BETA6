'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Building2, User, CheckCircle2, 
  Briefcase, Phone, Download, Upload, RefreshCw 
} from 'lucide-react';
import { db } from '../../db'; // Ajuste o caminho de acordo com seu projeto se necessário (ex: '@/db')

export default function Configuracoes() {
  const [unidade, setUnidade] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [salvo, setSalvo] = useState(false);
  
  // Estados para controle do Backup
  const [statusBackup, setStatusBackup] = useState<{ tipo: 'sucesso' | 'erro'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FUNÇÃO PARA FORMATAR TELEFONE
  const formatarTelefone = (value: string) => {
    let numbers = value.replace(/\D/g, ''); // Remove não dígitos
    if (numbers.length > 11) numbers = numbers.substring(0, 11); // Limita a 11 dígitos

    if (numbers.length > 6) {
      // Formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length > 2) {
      return numbers.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    } else if (numbers.length > 0) {
      return numbers.replace(/(\d{0,2})/, '($1');
    }
    return numbers;
  };

  // Carrega os dados do localStorage ao abrir a página
  useEffect(() => {
    const unidadeSalva = localStorage.getItem('fspss_unidade_padrao');
    const responsavelSalvo = localStorage.getItem('fspss_responsavel_padrao');
    const cargoSalvo = localStorage.getItem('fspss_cargo_padrao');
    const telefoneSalvo = localStorage.getItem('fspss_telefone_padrao');

    if (unidadeSalva) setUnidade(unidadeSalva);
    if (responsavelSalvo) setResponsavel(responsavelSalvo);
    if (cargoSalvo) setCargo(cargoSalvo);
    if (telefoneSalvo) setTelefone(telefoneSalvo);
  }, []);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorage.setItem('fspss_unidade_padrao', unidade.trim());
    localStorage.setItem('fspss_responsavel_padrao', responsavel.trim());
    localStorage.setItem('fspss_cargo_padrao', cargo.trim());
    localStorage.setItem('fspss_telefone_padrao', telefone.trim());

    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  // ==========================================
  // FUNÇÃO: EXPORTAR BACKUP COMPLETO (JSON)
  // ==========================================
  const handleExportarDados = async () => {
    try {
      setStatusBackup(null);
      
      // 1. Coleta todas as tabelas atualizadas do Dexie (incluindo v3: pacientes e exames)
      const tabelas = ['encaminhamentos', 'pedidos', 'materiais', 'remessas', 'sos', 'pacientes', 'exames'];
      const dadosDexie: Record<string, any[]> = {};

      for (const tabela of tabelas) {
        dadosDexie[tabela] = await (db as any).table(tabela).toArray();
      }

      // 2. Coleta os dados de configuração do localStorage
      const dadosConfig = {
        fspss_unidade_padrao: localStorage.getItem('fspss_unidade_padrao') || '',
        fspss_responsavel_padrao: localStorage.getItem('fspss_responsavel_padrao') || '',
        fspss_cargo_padrao: localStorage.getItem('fspss_cargo_padrao') || '',
        fspss_telefone_padrao: localStorage.getItem('fspss_telefone_padrao') || '',
        fspss_mensagem_zap_padrao: localStorage.getItem('fspss_mensagem_zap_padrao') || '',
      };

      // 3. Monta o Objeto final de migração
      const objetoBackup = {
        sistema: 'GestaoClinicaFSPSS',
        dataExportacao: new Date().toLocaleDateString('pt-BR'),
        configuracoes: dadosConfig,
        bancoDados: dadosDexie
      };

      // 4. Cria o arquivo Blob para download imediato
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objetoBackup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `BACKUP_GERAL_FSPSS_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusBackup({ tipo: 'sucesso', msg: 'Backup gerado e baixado com sucesso!' });
    } catch (error) {
      console.error(error);
      setStatusBackup({ tipo: 'erro', msg: 'Falha ao gerar arquivo de exportação.' });
    }
  };

  // ==========================================
  // FUNÇÃO: IMPORTAR BACKUP COMPLETO (JSON)
  // ==========================================
  const handleImportarDados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = e.target.files;
    if (!arquivos || arquivos.length === 0) return;

    const leitor = new FileReader();
    leitor.onload = async (evento) => {
      try {
        const conteudo = evento.target?.result as string;
        const dadosImportados = JSON.parse(conteudo);

        // Validação simples de segurança
        if (dadosImportados.sistema !== 'GestaoClinicaFSPSS') {
          throw new Error('Arquivo de backup inválido ou incompatível.');
        }

        if (!confirm('Atenção: A importação irá mesclar ou substituir registros locais existentes. Deseja continuar?')) {
          return;
        }

        // 1. Restaurar configurações no localStorage
        if (dadosImportados.configuracoes) {
          Object.entries(dadosImportados.configuracoes).forEach(([chave, valor]) => {
            localStorage.setItem(chave, valor as string);
          });
          
          // Atualiza o estado visual da tela na hora
          setUnidade(dadosImportados.configuracoes.fspss_unidade_padrao || '');
          setResponsavel(dadosImportados.configuracoes.fspss_responsavel_padrao || '');
          setCargo(dadosImportados.configuracoes.fspss_cargo_padrao || '');
          setTelefone(dadosImportados.configuracoes.fspss_telefone_padrao || '');
        }

        // 2. Restaurar Tabelas no Dexie IndexedDB
        if (dadosImportados.bancoDados) {
          for (const [nomeTabela, registros] of Object.entries(dadosImportados.bancoDados)) {
            if (Array.isArray(registros)) {
              // Limpa os registros antigos e insere os novos
              await (db as any).table(nomeTabela).clear();
              await (db as any).table(nomeTabela).bulkAdd(registros);
            }
          }
        }

        setStatusBackup({ tipo: 'sucesso', msg: 'Dados importados e restaurados com sucesso! Recarregando...' });
        
        // Recarrega a página após 2 segundos
        setTimeout(() => window.location.reload(), 2000);

      } catch (error: any) {
        console.error(error);
        setStatusBackup({ tipo: 'erro', msg: error?.message || 'Erro ao processar o arquivo de backup.' });
      }
    };

    leitor.readAsText(arquivos[0]);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 sm:p-8 text-gray-950">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="border-b border-gray-200 pb-4">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">
            Preferências do Sistema
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            Configurações Gerais
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Defina os dados padrão para preenchimento automático de formulários e gerencie a migração ou cópia de segurança dos dados locais.
          </p>
        </div>

        {/* FEEDBACKS VISUAIS */}
        {salvo && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Configurações padrão atualizadas com sucesso!
          </div>
        )}

        {statusBackup && (
          <div className={`p-3 border rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${
            statusBackup.tipo === 'sucesso' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <RefreshCw size={16} className={`text-blue-600 ${statusBackup.tipo === 'sucesso' ? 'animate-spin' : ''}`} />
            {statusBackup.msg}
          </div>
        )}

        {/* PAINEL: BACKUP E TRANSFERÊNCIA DE DADOS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Migração e Cópia Local</span>
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight">Transferência entre Computadores</h3>
            <p className="text-xs text-gray-500 mt-0.5">Salve um arquivo com tudo que está salvo neste PC para abrir em outro navegador.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* BOTÃO EXPORTAR */}
            <button
              type="button"
              onClick={handleExportarDados}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg py-2.5 px-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Download size={14} className="text-blue-600" />
              Exportar Dados (.json)
            </button>

            {/* BOTÃO IMPORTAR */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg py-2.5 px-4 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Upload size={14} className="text-emerald-600" />
              Importar Dados
            </button>

            {/* INPUT DE ARQUIVO INVISÍVEL */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImportarDados}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* FORMULÁRIO DE PARÂMETROS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSalvar} className="space-y-4">
            
            {/* CAMPO: UNIDADE PADRÃO */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Building2 size={12} /> Unidade de Saúde Padrão
              </label>
              <input
                type="text"
                placeholder="Ex: USF Barra do Sahy"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-medium uppercase"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Essa unidade virá pré-selecionada ao gerar remessas, pedidos e chamados S.O.S.
              </span>
            </div>

            {/* GRID PARA DADOS DO EMISSOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CAMPO: RESPONSÁVEL PADRÃO */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <User size={12} /> Nome do Responsável
                </label>
                <input
                  type="text"
                  placeholder="Ex: Nome do Usuário"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-medium uppercase"
                />
              </div>

              {/* CAMPO: CARGO PADRÃO */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Briefcase size={12} /> Cargo / Função
                </label>
                <input
                  type="text"
                  placeholder="Ex: Auxiliar Administrativo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-medium uppercase"
                />
              </div>
            </div>

            {/* CAMPO: TELEFONE DE CONTATO */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Phone size={12} /> Telefone / Ramal da Unidade
              </label>
              <input
                type="text"
                placeholder="Ex: (12) 3865-0000"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 font-medium"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Número que aparecerá no rodapé impresso da Ordem de Serviço e documentos da unidade.
              </span>
            </div>

            {/* BOTÃO DE SALVAR */}
            <div className="pt-2 border-t border-gray-100 mt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Save size={14} />
                Salvar Definições Padrão
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
}
