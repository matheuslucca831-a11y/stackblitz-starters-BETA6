'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Printer, CalendarDays, User, Trash2, Edit, Save, X } from 'lucide-react';

interface Profissional {
  id: string;
  nome: string;
  matricula: string;
  vinculo: string;
  unidade: string;
  cargo: string;
  cargaHoraria: string;
}

export default function RelatorioProdutividade() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalMesAberto, setModalMesAberto] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<Profissional | null>(null);
  const [mesEscolhido, setMesEscolhido] = useState('');
  
  // Estado do Formulário
  const [form, setForm] = useState<Profissional>({
    id: '', nome: '', matricula: '', vinculo: '', unidade: '', cargo: '', cargaHoraria: ''
  });

  // Carrega os profissionais salvos no navegador ao abrir
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('fspss_profissionais_produtividade');
    if (dadosSalvos) {
      setProfissionais(JSON.parse(dadosSalvos));
    }
    
    const unidadePadrao = localStorage.getItem('fspss_unidade_padrao');
    if (unidadePadrao) {
      setForm(prev => ({ ...prev, unidade: unidadePadrao.toUpperCase() }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fspss_profissionais_produtividade', JSON.stringify(profissionais));
  }, [profissionais]);

  const handleSalvarProfissional = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      setProfissionais(prev => prev.map(p => p.id === form.id ? form : p));
    } else {
      setProfissionais(prev => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setModalAberto(false);
    resetForm();
  };

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja remover este profissional da lista rápida?')) {
      setProfissionais(prev => prev.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    const unidadePadrao = localStorage.getItem('fspss_unidade_padrao') || '';
    setForm({ id: '', nome: '', matricula: '', vinculo: '', unidade: unidadePadrao.toUpperCase(), cargo: '', cargaHoraria: '' });
  };

  const abrirModalEditar = (p: Profissional) => {
    setForm(p);
    setModalAberto(true);
  };

  const calcularPeriodo = (dataIso?: string) => {
    let data = dataIso ? new Date(dataIso + '-01T12:00:00') : new Date();
    const mes = data.getMonth() + 1; 
    const ano = data.getFullYear();
    const ultimoDia = new Date(ano, mes, 0).getDate(); 
    
    const mesFormatado = String(mes).padStart(2, '0');
    return `01 a ${ultimoDia}/${mesFormatado}/${ano}`;
  };

  const dispararImpressao = (p: Profissional, dataIso?: string) => {
    const periodoCalculado = calcularPeriodo(dataIso);
    const novaAba = window.open('', '_blank');
    if (!novaAba) return;

    // HTML E CSS CLONADOS DO PDF OFICIAL
    const htmlImpressao = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório Produtividade - ${p.nome}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 11px; 
            margin: 0; 
            padding: 0; 
            color: #000; 
            background: #fff;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          .page { width: 100%; max-width: 190mm; margin: 0 auto; padding: 0; }
          .section-break { page-break-before: always; }
          
          /* Tipografia do Cabeçalho */
          .title-section { text-align: center; margin-bottom: 15px; line-height: 1.2; }
          .title-section h1 { font-size: 14px; font-weight: bold; margin: 0; }
          .title-section h2 { font-size: 11px; font-weight: normal; margin: 3px 0 10px 0; }
          .title-section h3 { font-size: 12px; font-weight: bold; margin: 0; }
          
          /* Tabelas Padrão PDF */
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
          th { text-align: center; font-size: 9px; font-weight: bold; }
          .bg-gray { background-color: #e6e6e6 !important; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          /* Células de Dados Cadastrais */
          .info-label { font-size: 9px; font-weight: normal; display: block; margin-bottom: 2px; }
          .info-val { font-size: 11px; font-weight: bold; text-transform: uppercase; }
          
          /* Assinaturas */
          .signature-table { border: none !important; margin-top: 25px; text-align: center; font-size: 11px; }
          .signature-table td { border: none !important; padding-bottom: 25px; vertical-align: bottom; }
        </style>
      </head>
      <body>

        <div class="page">
          <div class="title-section">
            <h1>FUNDAÇÃO DE SAÚDE PÚBLICA DE SÃO SEBASTIÃO</h1>
            <h2>Lei Complementar nº 168/2013 e alterações</h2>
            <h3>ANEXO VI - RELATÓRIO DE PRODUTIVIDADE INDIVIDUAL</h3>
          </div>

          <table>
            <tr>
              <td colspan="2"><span class="info-label">NOME:</span><span class="info-val">${p.nome}</span></td>
              <td width="25%"><span class="info-label">MATRÍCULA:</span><span class="info-val">${p.matricula}</span></td>
              <td width="25%"><span class="info-label">VÍNCULO:</span><span class="info-val">${p.vinculo}</span></td>
            </tr>
            <tr>
              <td colspan="2"><span class="info-label">PERÍODO:</span><span class="info-val">${periodoCalculado}</span></td>
              <td colspan="2"><span class="info-label">UNIDADE:</span><span class="info-val">${p.unidade}</span></td>
            </tr>
            <tr>
              <td colspan="2"><span class="info-label">CARGO:</span><span class="info-val">${p.cargo}</span></td>
              <td><span class="info-label">CARGA HORÁRIA:</span><span class="info-val">${p.cargaHoraria}</span></td>
              <td><span class="info-label">FÉRIAS:</span><span class="info-val"></span></td>
            </tr>
          </table>

          <table>
            <thead>
              <tr>
                <th width="40%">CRITERIOS DE AVALIAÇÃO / REQUISITOS PARA COMPROVAÇÃO</th>
                <th width="20%">QUANTIDADE<br><span style="font-weight:normal; font-size:8px;">(profissional com carga horária de 20, 30 ou 40h/mês)</span></th>
                <th width="20%">QUANTIDADE AFERIDA PELA COORDENAÇÃO</th>
                <th width="20%">% ATRIBUIDO PARA CÁLCULO DA GRATIFICAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="4" class="bg-gray">
                  <strong style="font-size:10px;">1-N° DE CONSULTAS</strong><br>
                  <span style="font-size:9px;">Comprovação mediante:<br>- dados lançados no SIAB ou outro sistema que venha substituí-lo</span>
                </td>
              </tr>
              <tr>
                <td style="height: 22px; vertical-align: middle;">Número de consultas realizadas:</td>
                <td></td><td></td><td></td>
              </tr>
              
              <tr>
                <td colspan="4" class="bg-gray">
                  <strong style="font-size:10px;">2-ATIVIDADES COLETIVAS PREVISTAS NO CADERNO DA AT. BÁSICA/MS</strong><br>
                  <span style="font-size:9px;">Comprovação mediante:<br>- dados lançados no SIAB ou outro que venha substituí-lo<br>- relatório de atividades</span>
                </td>
              </tr>
              <tr>
                <td style="height: 22px; vertical-align: middle;">Atividades coletivas realizadas:</td>
                <td></td><td></td><td></td>
              </tr>

              <tr>
                <td colspan="4" class="bg-gray">
                  <strong style="font-size:10px;">3-VISITA DOMICILIAR</strong><br>
                  <span style="font-size:9px;">Comprovação mediante:<br>- dados lançados no SIAB ou outro que venha substituí-lo;<br>- relatório de visitas</span>
                </td>
              </tr>
              <tr>
                <td style="height: 22px; vertical-align: middle;">Visitas domiciliares realizadas:</td>
                <td></td><td></td><td></td>
              </tr>

              <tr>
                <td colspan="4" class="bg-gray">
                  <strong style="font-size:10px;">4-PARTICIPAÇÃO EM REUNIÕES TÉCNICAS DE EQUIPE E PROGRAMADAS PELA DIRETORIA DA ATENÇÃO BÁSICA</strong><br>
                  <span style="font-size:9px;">Comprovação mediante:<br>- lista de presença;<br>- relatório de reunião<br>Obs. As reuniões serão programadas e comunicadas até o dia anterior à sua realização</span>
                </td>
              </tr>
              <tr>
                <td style="height: 25px; vertical-align: middle;">Participação em reuniões programadas pela Diretoria da Atenção Básica</td>
                <td></td><td></td><td></td>
              </tr>
              
              <tr>
                <td colspan="3" class="text-right" style="font-weight:bold; height: 22px; vertical-align: middle;">% TOTAL APURADO</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div style="font-size: 10px; margin-bottom: 25px;">
            Obs. Percentual máximo para Gratificação por produtividade, calculado sobre o salário base do cargo na FSPSS: 70%
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <div>Data de Emissão: ______/______/___________</div>
            <div style="margin-right: 50px;">De acordo:</div>
          </div>

          <table class="signature-table">
            <tr>
              <td style="width: 50%;">
                _________________________________________<br>profissional
              </td>
              <td style="width: 50%;">
                _________________________________________<br>Coordenação Enfermagem<br>FSPSS
              </td>
            </tr>
            <tr>
              <td style="width: 50%;">
                _________________________________________<br>Diretor de Atenção Básica<br>FSPSS
              </td>
              <td style="width: 50%;">
                _________________________________________<br>Diretor Presidente<br>FSPSS
              </td>
            </tr>
          </table>
        </div>

        <div class="page section-break">
          <div class="text-center" style="margin-bottom: 10px;">
            <h3 style="font-size: 11px; margin: 0;">DEMONSTRATIVO DE PARTICIPAÇÃO EM REUNIÕES TÉCNICAS DE EQUIPE E PROGRAMADAS PELA</h3>
            <h3 style="font-size: 11px; margin: 0;">DIRETORIA DA ATENÇÃO BÁSICA</h3>
            <p style="font-size: 9px; margin: 3px 0;">*PARA USO EXCLUSIVO DA COORDENAÇÃO</p>
          </div>

          <table>
            <thead>
              <tr class="bg-gray" style="font-size: 9px;">
                <th width="45%">ITEM</th>
                <th width="25%">DATA DA REALIZAÇÃO</th>
                <th width="30%">PARTICIPAÇÃO? REUNIÕES</th>
              </tr>
            </thead>
            <tbody style="font-size: 11px;">
              <tr style="height: 24px;"><td style="vertical-align: middle;">1-Reunião Técnica de Equipe</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">2-Reunião Técnica de Equipe</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">3-Reunião Técnica de Equipe</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">4-Reunião Técnica de Equipe</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">Outras Reuniões Técnicas de Equipe</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">Outras Reuniões Técnicas de Equipe</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">Programadas pela Diretoria de Atenção Básica</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">Programadas pela Diretoria de Atenção Básica</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">Programadas pela Diretoria de Atenção Básica</td><td></td><td></td></tr>
              <tr style="height: 24px;"><td style="vertical-align: middle;">Programadas pela Diretoria de Atenção Básica</td><td></td><td></td></tr>
              <tr style="height: 30px;">
                <td colspan="2" class="text-right" style="vertical-align: middle; font-weight: bold; font-size: 9px;">PARA ESTE PERÍODO, CONSIDERA-SE 100% (CEM POR CENTO) O TOTAL DE:</td>
                <td></td>
              </tr>
              <tr style="height: 30px;">
                <td colspan="2" class="text-right" style="vertical-align: middle; font-weight: bold; font-size: 9px;">O NÚMERO DE PARTICIPAÇÕES DO EMPREGADO FOI:</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-around; margin-top: 40px; margin-bottom: 25px; text-align: center; font-size: 11px;">
            <div style="width: 40%; border-top: 1px solid #000; padding-top: 5px;">Carimbo e assinatura da Coordenação</div>
            <div style="width: 20%; border-top: 1px solid #000; padding-top: 5px;">Data</div>
          </div>

          <div style="font-size: 10px; text-align: justify; line-height: 1.4;">
            <p style="margin: 2px 0;">Notal: todos os itens acima devem ser comprovados com cópia das atas e cópia das listas de presença.</p>
            <p style="margin: 2px 0;">Nota2: cada unidade deve realizar no minimol (uma) reunião semanal, sendo esse valor considerado a para todos os profissionais da Unidade que apuram produtividade (médicos, odontólogos e enfermeiros).</p>
            <p style="margin: 2px 0;">Nota3: para a unidade que realizar mais de 4 (quatro) reuniões/mês, esse valor será considerado para todos os profissionais da Unidade que apuram produtividade (médicos, odontólogos e enfermeiros).</p>
            
            <p style="margin: 12px 0 2px 0;">Legenda para preenchimento dos quadros acima:</p>
            <p style="margin: 2px 0;">NR-Não Realizada (para as reuniões não realizadas pela equipe)</p>
            <p style="margin: 2px 0;">NRIO - Não Realizada por Indisponibilidade Operacional (quando o dia da reunião cair em feriado e/ou a Unidade estiver fechada por algum motivo técnico).</p>
            <p style="margin: 2px 0;">Neste caso o valor considerado como total será diminuído.</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { 
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;
    novaAba.document.write(htmlImpressao);
    novaAba.document.close();
    setModalMesAberto(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">Recursos Humanos</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Gerador de Produtividade</h1>
            <p className="text-xs text-slate-500 mt-1">Cadastre a equipe uma vez e gere os relatórios mensais automaticamente.</p>
          </div>
          <button
            onClick={() => { resetForm(); setModalAberto(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Adicionar Profissional
          </button>
        </div>

        {/* LISTA DE PROFISSIONAIS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                  <th className="p-4">Nome do Profissional</th>
                  <th className="p-4 hidden sm:table-cell">Cargo / Matrícula</th>
                  <th className="p-4 hidden md:table-cell">Vínculo / Horas</th>
                  <th className="p-4 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {profissionais.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                      NENHUM PROFISSIONAL CADASTRADO.<br/><span className="text-[10px] font-normal">Clique no botão azul acima para começar.</span>
                    </td>
                  </tr>
                ) : (
                  profissionais.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold uppercase text-slate-900">
                        {p.nome}
                        <span className="block text-[10px] font-normal text-slate-500 sm:hidden mt-0.5">{p.cargo} | {p.matricula}</span>
                      </td>
                      <td className="p-4 hidden sm:table-cell font-medium uppercase text-slate-700">
                        {p.cargo} <span className="block text-[10px] text-slate-400 mt-0.5">Mat: {p.matricula}</span>
                      </td>
                      <td className="p-4 hidden md:table-cell font-medium uppercase text-slate-700">
                        {p.vinculo} <span className="block text-[10px] text-slate-400 mt-0.5">{p.cargaHoraria}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => dispararImpressao(p)}
                            title="Imprimir Mês Atual"
                            className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 p-2 rounded-lg transition-colors flex items-center gap-1.5 font-bold uppercase text-[10px]"
                          >
                            <Printer size={14} /> <span className="hidden xl:inline">Mês Atual</span>
                          </button>
                          
                          <button
                            onClick={() => { setProfissionalSelecionado(p); setMesEscolhido(''); setModalMesAberto(true); }}
                            title="Escolher Mês Específico"
                            className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center gap-1.5 font-bold uppercase text-[10px]"
                          >
                            <CalendarDays size={14} /> <span className="hidden xl:inline">Outro Mês</span>
                          </button>

                          <div className="w-px h-6 bg-slate-200 mx-1"></div>

                          <button
                            onClick={() => abrirModalEditar(p)}
                            className="text-slate-400 hover:text-blue-600 p-2 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleExcluir(p.id)}
                            className="text-slate-400 hover:text-rose-600 p-2 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL CADASTRAR / EDITAR PROFISSIONAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full browser-modal max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                {form.id ? 'Editar Profissional' : 'Novo Profissional'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSalvarProfissional} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Nome Completo</label>
                <input 
                  required type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Matrícula</label>
                  <input 
                    required type="text" value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Vínculo</label>
                  <input 
                    required type="text" placeholder="Ex: CONCURSADO" value={form.vinculo} onChange={e => setForm({...form, vinculo: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Cargo</label>
                  <input 
                    required type="text" placeholder="Ex: MÉDICO" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Carga Horária</label>
                  <input 
                    required type="text" placeholder="Ex: 40hs" value={form.cargaHoraria} onChange={e => setForm({...form, cargaHoraria: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Unidade de Saúde</label>
                <input 
                  required type="text" value={form.unidade} onChange={e => setForm({...form, unidade: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-bold text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg uppercase">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg uppercase flex items-center gap-2 shadow-sm">
                  <Save size={16}/> Salvar Profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ESCOLHER MÊS */}
      {modalMesAberto && profissionalSelecionado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />
                Selecione o Mês
              </h2>
              <button onClick={() => setModalMesAberto(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Gerando relatório para: <strong className="text-slate-900 uppercase">{profissionalSelecionado.nome}</strong>
              </p>
              
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Mês e Ano Referência</label>
                <input 
                  type="month" 
                  value={mesEscolhido} 
                  onChange={e => setMesEscolhido(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => dispararImpressao(profissionalSelecionado, mesEscolhido)}
                  disabled={!mesEscolhido}
                  className="w-full px-5 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-lg uppercase flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Printer size={16}/> Gerar e Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}