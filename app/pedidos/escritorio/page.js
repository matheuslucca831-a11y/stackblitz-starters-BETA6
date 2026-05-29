'use client';
import React, { useState, useEffect } from 'react';
import { LISTA_ESCRITORIO as listaInicial } from './produtos';
import { saveAs } from 'file-saver';
import * as docx from 'docx';
import { FileText, Search, Plus, Trash2 } from 'lucide-react';
import { logoFSPSS, logoBrasil } from '../limpeza/imagens';


export default function PedidoEscritorioCompleto() {
  const [unidade, setUnidade] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const unidadePadrao = localStorage.getItem('fspss_unidade_padrao');
  
    if (unidadePadrao) {
      setUnidade(unidadePadrao.toUpperCase());
    }
  }, []);
  
  const [itensCatalogo, setItensCatalogo] = useState(listaInicial);
  const [valores, setValores] = useState({});

  const handleQtdChange = (id, qtd) => {
    setValores({ ...valores, [id]: qtd });
  };

  const adicionarNovoItem = () => {
    const novoCodigo = prompt("Digite o CÓDIGO do novo item:");
    const novaDescricao = prompt("Digite a DESCRIÇÃO do novo item:");
    const novaUnidade = prompt("Digite a UNIDADE (UND, PCT, KIT...):", "UND");
  
    if (novoCodigo && novaDescricao) {
      setItensCatalogo([
        {
          id: novoCodigo,
          nome: novaDescricao.toUpperCase(),
          unidade: novaUnidade ? novaUnidade.toUpperCase() : 'UND'
        },
        ...itensCatalogo
      ]);
    }
  };

  const excluirItem = (id) => {
    if (confirm("Deseja realmente remover este item do catálogo?")) {
      setItensCatalogo(itensCatalogo.filter(item => item.id !== id));
    }
  };

  const exportarDocx = () => {
    const todosOsItens = itensCatalogo;
  
    const doc = new docx.Document({
      styles: {
        default: {
          document: {
            run: { size: 20, font: "Arial" },
          },
        },
      },
      sections: [{
        properties: {
          page: {
            margin: { 
              top: 1440,    // 1 in
              bottom: 1699, // 1,18 in
              left: 1138,   // 0,79 in
              right: 1555   // 1,08 in
            },
          },
        },
        headers: {
          default: new docx.Header({
            children: [
              new docx.Table({
                width: { size: 100, type: docx.WidthType.PERCENTAGE },
                borders: docx.TableBorders.NONE,
                rows: [
                  new docx.TableRow({
                    children: [
                      // Coluna 1: Logo FSPSS (Esquerda) - 2,41 x 3,04 cm
                      new docx.TableCell({
                        width: { size: 20, type: docx.WidthType.PERCENTAGE },
                        children: [
                          new docx.Paragraph({
                            children: [
                              new docx.ImageRun({
                                data: Uint8Array.from(atob(logoFSPSS), c => c.charCodeAt(0)),
                                transformation: { width: 91, height: 115 },
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Coluna 2: Textos Centrais
                      new docx.TableCell({
                        width: { size: 60, type: docx.WidthType.PERCENTAGE },
                        children: [
                          new docx.Paragraph({
                            children: [
                              new docx.TextRun({ 
                                text: "FUNDAÇÃO DE SAÚDE PÚBLICA DE SÃO SEBASTIÃO", 
                                font: "Times New Roman", size: 24, color: "000000", bold: true 
                              }),
                            ],
                            alignment: docx.AlignmentType.CENTER,
                            spacing: { line: 360 },
                          }),
                          new docx.Paragraph({
                            children: [
                              new docx.TextRun({ 
                                text: "Lei Complementar nº 168/2013 e alterações", 
                                font: "Times New Roman", size: 22, color: "7F7F7F" 
                              }),
                            ],
                            alignment: docx.AlignmentType.CENTER,
                            spacing: { line: 360, after: 800 }, // Espaço solicitado abaixo da lei
                          }),
                        ],
                        verticalAlign: docx.VerticalAlign.CENTER,
                      }),
                      // Coluna 3: Logo Brasil (Direita) - 2,34 x 2,93 cm
                      new docx.TableCell({
                        width: { size: 20, type: docx.WidthType.PERCENTAGE },
                        children: [
                          new docx.Paragraph({
                            children: [
                              new docx.ImageRun({
                                data: Uint8Array.from(atob(logoBrasil), c => c.charCodeAt(0)),
                                transformation: { width: 88, height: 111 },
                              }),
                            ],
                            alignment: docx.AlignmentType.RIGHT,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // 1. TÍTULO DO PEDIDO (Alterado para Escritório)
          new docx.Paragraph({
            children: [
              new docx.TextRun({ 
                text: "PEDIDO MENSAL – MATERIAL DE ESCRITÓRIO 2026", 
                font: "Arial", size: 22, color: "000000", bold: true 
              }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { before: 200, after: 120 },
          }),
  
          // 2. UNIDADE E DATA
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            borders: docx.TableBorders.NONE,
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    width: { size: 70, type: docx.WidthType.PERCENTAGE },
                    children: [
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "UNIDADE DE SAÚDE: ", bold: true, size: 20 }),
                          new docx.TextRun({ text: unidade.toUpperCase(), bold: true, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                  new docx.TableCell({
                    width: { size: 30, type: docx.WidthType.PERCENTAGE },
                    children: [
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "DATA: ", bold: true, size: 20 }),
                          new docx.TextRun({ text: new Date().toLocaleDateString('pt-BR'), bold: true, size: 20 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
  
          new docx.Paragraph({ text: "", spacing: { after: 200 } }),
  
          // 3. TABELA DE ITENS
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({ width: { size: 12, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ text: "CÓDIGO", bold: true, alignment: docx.AlignmentType.CENTER })] }),
                  new docx.TableCell({ width: { size: 58, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ text: "DESCRIÇÃO", bold: true, alignment: docx.AlignmentType.CENTER })] }),
                  new docx.TableCell({ width: { size: 10, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ text: "UNID.", bold: true, alignment: docx.AlignmentType.CENTER })] }),
                  new docx.TableCell({ width: { size: 20, type: docx.WidthType.PERCENTAGE }, children: [new docx.Paragraph({ text: "PEDIDO", bold: true, alignment: docx.AlignmentType.CENTER })] }),
                ],
              }),
              ...todosOsItens.map(item => new docx.TableRow({
                children: [
                  new docx.TableCell({ children: [new docx.Paragraph({ text: item.id.toString() })] }),
                  new docx.TableCell({ children: [new docx.Paragraph({ text: item.nome.toUpperCase(), spacing: { before: 30, after: 30 } })] }),
                  new docx.TableCell({ children: [new docx.Paragraph({ text: item.unidade })] }),
                  new docx.TableCell({ children: [new docx.Paragraph({ text: valores[item.id] ? valores[item.id].toString() : "", bold: true })] }),
                ],
              })),
            ],
          }),
  
          // 4. OBSERVAÇÃO
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "OBSERVAÇÃO: TODOS OS PEDIDOS ESTARÃO SUJEITOS A ANÁLISE E APROVAÇÃO DO DEPARTAMENTO ADMINISTRATIVO, (ALMOXARIFADO).",
                font: "Times New Roman", // <-- ADICIONADO AQUI
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 300 },
          }),
        ],
      }],
    });
  
    docx.Packer.toBlob(doc).then(blob => saveAs(blob, `Pedido_Escritorio_${unidade}.docx`));
  };
  return (
    <div className="p-8 bg-gray-100 min-h-screen text-black">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
        
        {/* HEADER DA PÁGINA */}
        <div className="p-8 border-b bg-white">
          <div className="flex justify-between items-start mb-6">
             <div className="text-center w-full">
                <h1 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Fundação de Saúde Pública de São Sebastião</h1>
                <p className="text-xs italic text-gray-500">Lei Complementar nº 168/2013 e alterações</p>
                <div className="mt-4 inline-block bg-blue-900 text-white px-4 py-1 rounded text-sm font-bold uppercase tracking-widest">
                  Pedido Mensal – Material de Escritório 2026
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div>
              <label className="text-[10px] font-black text-blue-600 uppercase">Unidade de Saúde</label>
              <input 
                className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-600 outline-none font-bold text-lg uppercase"
                value={unidade} onChange={(e) => setUnidade(e.target.value.toUpperCase())}
              />
            </div>
            <div className="text-right">
              <label className="text-[10px] font-black text-gray-400 uppercase">Data do Pedido</label>
              <p className="font-bold text-lg text-gray-700">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* BARRA DE FERRAMENTAS */}
        <div className="px-8 py-4 bg-gray-50 border-b flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                placeholder="Filtrar material escolar/escritório..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-80 outline-none focus:ring-2 ring-blue-500"
                onChange={(e) => setBusca(e.target.value.toLowerCase())}
              />
            </div>
            <button 
              onClick={adicionarNovoItem}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-md"
            >
              <Plus size={16} /> ADICIONAR ITEM
            </button>
          </div>
          
          <button 
            onClick={exportarDocx}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-lg font-black text-sm hover:bg-blue-700 shadow-lg"
          >
            <FileText size={18}/> GERAR ARQUIVO .DOCX
          </button>
        </div>

        {/* TABELA DE PREENCHIMENTO */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200 text-[10px] uppercase font-black text-gray-600">
                <th className="p-4 w-24 text-center">Código</th>
                <th className="p-4">Descrição do Material</th>
                <th className="p-4 w-20 text-center">Unid.</th>
                <th className="p-4 w-32 text-center bg-blue-50 text-blue-700">Qtd. Pedido</th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {itensCatalogo.filter(i => i.nome.toLowerCase().includes(busca)).map((item) => (
                <tr key={item.id} className="border-b hover:bg-blue-50 transition-colors group">
                  <td className="p-4 text-xs font-bold text-gray-500 text-center">{item.id}</td>
                  <td className="p-4 text-sm font-bold uppercase text-gray-700">{item.nome}</td>
                  <td className="p-4 text-xs text-center font-medium">{item.unidade}</td>
                  <td className="p-4 bg-blue-50/50">
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full bg-white border-2 border-gray-300 rounded-md p-2 text-center font-black text-blue-600 focus:border-blue-600 outline-none transition-all"
                      value={valores[item.id] || ''}
                      onChange={(e) => handleQtdChange(item.id, e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => excluirItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir item do catálogo"
                    >
                      <Trash2 size={18} />
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