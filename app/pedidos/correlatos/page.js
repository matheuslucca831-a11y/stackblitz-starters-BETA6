'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Search, Plus, Trash2 } from 'lucide-react';
// Importação dos produtos específicos da pasta cronicos
import { LISTA_CORRELATOS as listaInicial } from './produtos'; 
import ExcelJS from 'exceljs';
// Importação da logo do arquivo separado para manter o código limpo
import { LOGO_PREFEITURA_BASE64 } from './assets';

export default function PedidoCronicos() {
  const [unidade, setUnidade] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [busca, setBusca] = useState('');
  
  useEffect(() => {
    const unidadePadrao = localStorage.getItem('fspss_unidade_padrao');
    const responsavelPadrao = localStorage.getItem('fspss_responsavel_padrao');
  
    if (unidadePadrao) {
      setUnidade(unidadePadrao.toUpperCase());
    }
  
    if (responsavelPadrao) {
      setResponsavel(responsavelPadrao.toUpperCase());
    }
  }, []); 

  // Estado para gerenciar o catálogo (permite Adicionar/Excluir itens na sessão)
  const [itensCatalogo, setItensCatalogo] = useState(listaInicial || []);
  const [valores, setValores] = useState({});

  const handleQtdChange = (id, qtd) => {
    setValores({ ...valores, [id]: qtd });
  };

  // Adicionar item manualmente ao catálogo (temporário)
  const adicionarNovoItem = () => {
    const novoCodigo = prompt("DIGITE O CÓDIGO DO NOVO ITEM:");
    const novaDescricao = prompt("DIGITE A DESCRIÇÃO DO NOVO ITEM:");
    const novaUnidade = prompt("DIGITE A UNIDADE (UND, PCT, KIT, FRASCO...):", "UND");
    const novaCategoria = prompt("DIGITE A CATEGORIA (CORRELATOS, CREMES ou FRASCOS):", "CORRELATOS");
    
    if (novoCodigo && novaDescricao) {
      setItensCatalogo([
        { 
          id: parseInt(novoCodigo) || novoCodigo, 
          nome: novaDescricao.toUpperCase(), 
          unidade: novaUnidade ? novaUnidade.toUpperCase() : 'UND',
          categoria: novaCategoria ? novaCategoria.toUpperCase() : 'CORRELATOS'
        },
        ...itensCatalogo
      ]);
    }
  };

  // Remover item do catálogo
  const excluirItem = (id) => {
    if (confirm("DESEJA REALMENTE REMOVER ESTE ITEM DA VISUALIZAÇÃO?")) {
      setItensCatalogo(itensCatalogo.filter(item => item.id !== id));
    }
  };

  // Lógica para exportar os dados preenchidos para Excel com imagem e larguras exatas
  const gerarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedido');
  
    // 1. AJUSTE DE LARGURA DAS COLUNAS (Suas medidas exatas solicitadas)
    worksheet.columns = [
      { width: 3.43 },  // A - Índice sequencial (1, 2, 3...)
      { width: 7 },     // B - COD
      { width: 57.57 }, // C - DESCRIÇÃO DO MATERIAL
      { width: 5.14 },  // D - UN
      { width: 10.29 }, // E - SOLICITADO
      { width: 11 },    // F - FORNECIDO
    ];
  
    // 2. INSERÇÃO DA IMAGEM VINDA DO ASSETS.JS (A1 até F6)
    try {
      const logoId = workbook.addImage({
        base64: LOGO_PREFEITURA_BASE64,
        extension: 'png',
      });
  
      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        br: { col: 6, row: 6 },
        editAs: 'oneCell'
      });
    } catch (error) {
      console.error("Erro ao carregar imagem do assets:", error);
    }
  
    // Linha onde começa o cabeçalho institucional (Abaixo da foto)
    let currentRow = 7;
    

    // Estilo padrão para o bloco de cabeçalho institucional
    const styleHeaderBlock = {
      font: { bold: true, size: 11, name: 'Arial' },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      }
    };
  
    // Estilo das células comuns de dados da planilha
    const thinBorder = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  
    // 3. TEXTOS DO CABEÇALHO (Almoxarifado, Unidade, Responsável, Data) com mesclagem e bordas
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    const cellAlmox = worksheet.getCell(`B${currentRow}`);
    cellAlmox.value = 'ALMOXARIFADO SAÚDE';
    cellAlmox.style = { ...styleHeaderBlock, alignment: { horizontal: 'left', vertical: 'middle' } };
    currentRow++;
  
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    const cellUnidade = worksheet.getCell(`B${currentRow}`);
    cellUnidade.value = `UNIDADE : ${unidade.toUpperCase()}`;
    cellUnidade.style = { ...styleHeaderBlock, font: { ...styleHeaderBlock.font, size: 18, bold: true }, alignment: { horizontal: 'left', vertical: 'middle' } };
    currentRow++;

    // NOVA LINHA: Responsável inserido entre Unidade e Data
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    const cellResp = worksheet.getCell(`B${currentRow}`);
    cellResp.value = `RESPONSÁVEL : ${responsavel.toUpperCase()}`;
    cellResp.style = { ...styleHeaderBlock, font: { ...styleHeaderBlock.font, size: 18, bold: true }, alignment: { horizontal: 'left', vertical: 'middle' } };
    currentRow++;
  
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    const cellData = worksheet.getCell(`B${currentRow}`);
    cellData.value = `DATA: ${new Date().toLocaleDateString('pt-BR')}`;
    cellData.style = { ...styleHeaderBlock, alignment: { horizontal: 'left', vertical: 'middle' } };
    currentRow++;

  // BORDA FINA EM TODAS AS CÉLULAS DE B7:F10
  for (let row = 7; row <= 10; row++) {
    for (let col = 2; col <= 6; col++) {
      worksheet.getCell(row, col).border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    }
  }


    // Pula uma linha em branco igual ao modelo
    currentRow++;
  
    // Categorias mapeadas conforme aparecem no seu impresso oficial
    const categorias = [
      { chave: 'CORRELATOS', titulo: 'CORRELATOS', cabecalhoCod: 'COD', cabecalhoDesc: 'DESCRIÇÃO DO MATERIAL', cabecalhoUni: 'UN' },
      { chave: 'CREMES', titulo: 'CREMES / POMADAS', cabecalhoCod: 'CÓD.', cabecalhoDesc: 'DESC. DO MATERIAL', cabecalhoUni: 'UNI.' },
      { chave: 'FRASCOS', titulo: 'FRASCOS', cabecalhoCod: 'CÓD.', cabecalhoDesc: 'DESC. DO MATERIAL', cabecalhoUni: 'UNI.' }
    ];
  
    // 4. LAÇO QUE GERA CADA CATEGORIA E SEUS RESPECTIVOS ITENS
    categorias.forEach((cat) => {
      const itensDaCategoria = itensCatalogo.filter(item => {
        const itemCat = item.categoria ? item.categoria.toUpperCase() : 'CORRELATOS';
        if (cat.chave === 'CORRELATOS') return itemCat === 'CORRELATOS';
        if (cat.chave === 'CREMES') return itemCat === 'CREMES' || itemCat === 'CREMES / POMADAS';
        return itemCat === cat.chave;
      });
  
      if (itensDaCategoria.length === 0) return;
  
      // Pula linha de respiro antes da nova categoria (ajustado dinamicamente pela currentRow)
      if (currentRow > 12) {
        currentRow++;
      }
  
      // Escreve a faixa de TÍTULO DA CATEGORIA
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const cellTituloCat = worksheet.getCell(`A${currentRow}`);
      cellTituloCat.value = cat.titulo;
      cellTituloCat.style = {
        font: { bold: true, size: 22, name: 'Arial' },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: thinBorder
      };
      currentRow++;
      // Escreve a LINHA DE CABEÇALHO da tabela da categoria
      const headerRow = worksheet.getRow(currentRow);
      headerRow.getCell(1).value = '';
      headerRow.getCell(2).value = cat.cabecalhoCod;
      headerRow.getCell(3).value = cat.cabecalhoDesc;
      headerRow.getCell(4).value = cat.cabecalhoUni;
      headerRow.getCell(5).value = 'SOLICITADO';
      headerRow.getCell(6).value = 'FORNECIDO';
  
      for (let col = 1; col <= 6; col++) {
        const cell = headerRow.getCell(col);
        cell.style = {
          font: { bold: true, size: 9, name: 'Arial' },
          alignment: { 
            horizontal: col === 3 ? 'left' : 'center', 
            vertical: 'middle' 
          },
          border: thinBorder
        };
      }
      currentRow++;
  
      // Adiciona os itens da categoria linha por linha
      let itemIndex = 1;
      itensDaCategoria.forEach((item) => {
        const row = worksheet.getRow(currentRow);
        
        row.getCell(1).value = itemIndex; 
        row.getCell(2).value = item.id;    
        row.getCell(3).value = item.nome ? item.nome.toUpperCase() : '';
        row.getCell(4).value = item.unidade ? item.unidade.toUpperCase() : 'UND';
        
        const qtdDigitada = valores[item.id];
        row.getCell(5).value = qtdDigitada ? parseInt(qtdDigitada) : ''; 
        row.getCell(6).value = ''; 
  
        for (let col = 1; col <= 6; col++) {
          const cell = row.getCell(col);
          cell.style = {
            font: { size: 9, name: 'Arial' },
            alignment: { 
              horizontal: col === 3 ? 'left' : 'center', 
              vertical: 'middle' 
            },
            border: thinBorder
          };
          if (col === 5 && qtdDigitada) {
            cell.numFmt = '#,##0';
          }
        }
  
        itemIndex++;
        currentRow++;
      });
    });
  
    // 5. SEÇÃO DE ASSINATURA
    currentRow += 2;
    worksheet.getRow(currentRow).getCell(1).value = 'ASS.: __________________________________________________';
    worksheet.getRow(currentRow).getCell(5).value = 'DATA: ______/______/_______';
    
    worksheet.getRow(currentRow).getCell(1).font = { size: 9, name: 'Arial' };
    worksheet.getRow(currentRow).getCell(5).font = { size: 9, name: 'Arial' };
  
    // 6. ADICIONA NOTA DE REVISÃO NO RODAPÉ DA PÁGINA
    currentRow += 4;
    worksheet.getRow(currentRow).getCell(1).value = 'REVISÃO 010/2024';
    worksheet.getRow(currentRow).getCell(1).font = { size: 8, name: 'Arial', italic: true };
  
    // 7. SALVAR E FAZER DOWNLOAD
    const buffer = await workbook.xlsx.writeBuffer();
    const fileBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(fileBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `PEDIDO_CORRELATOS_${unidade.replace(/\s+/g, '_')}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-black" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
        
        {/* HEADER VISUAL DA PÁGINA */}
        <div className="p-8 border-b bg-white">
          <div className="flex justify-between items-start mb-6">
             <div className="text-center w-full">
                <h1 className="text-xl font-black text-gray-800 tracking-tighter">
                  FUNDAÇÃO DE SAÚDE PÚBLICA DE SÃO SEBASTIÃO
                </h1>
                <p className="text-xs italic text-gray-500">
                  Lei Complementar nº 168/2013 e alterações
                </p>
                <div className="mt-4 inline-block bg-green-700 text-white px-4 py-1 rounded text-sm font-bold uppercase tracking-widest">
                  PEDIDO MENSAL – CORRELATOS 2026
                </div>
             </div>
          </div>

          {/* Grid de Inputs modificado para 3 colunas para acomodar o Responsável de forma harmônica */}
          <div className="grid grid-cols-3 gap-6 mt-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div>
              <label className="text-[10px] font-black text-green-600 uppercase">UNIDADE DE SAÚDE</label>
              <input 
                className="w-full bg-transparent border-b-2 border-gray-300 focus:border-green-600 outline-none font-bold text-base uppercase text-gray-800"
                value={unidade} 
                onChange={(e) => setUnidade(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-blue-600 uppercase">RESPONSÁVEL PELO PEDIDO</label>
              <input 
                placeholder="DIGITE O NOME"
                className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-600 outline-none font-bold text-base uppercase text-gray-800"
                value={responsavel} 
                onChange={(e) => setResponsavel(e.target.value.toUpperCase())}
              />
            </div>
            <div className="text-right">
              <label className="text-[10px] font-black text-gray-400 uppercase">DATA DO PEDIDO</label>
              <p className="font-bold text-base text-gray-700 mt-1">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* BARRA DE FERRAMENTAS */}
        <div className="px-8 py-4 bg-gray-50 border-b flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                placeholder="Filtrar produtos de crônicos..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-80 outline-none focus:ring-2 ring-green-500 text-gray-900 bg-white"
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
            onClick={gerarExcel}
            className="flex items-center gap-2 bg-green-800 text-white px-8 py-2 rounded-lg font-black text-sm hover:bg-green-900 shadow-lg transition-all active:scale-95"
          >
            <FileSpreadsheet size={18}/> GERAR PLANILHA EXCEL
          </button>
        </div>

        {/* TABELA DE PREENCHIMENTO DIRETO NO NAVEGADOR */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200 text-[10px] uppercase font-black text-gray-600">
                <th className="p-4 w-24 text-center">Código</th>
                <th className="p-4">Descrição do Material (CORRELATOS)</th>
                <th className="p-4 w-20 text-center">Unid.</th>
                <th className="p-4 w-32 text-center bg-green-50 text-green-700">Qtd. Pedido</th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {itensCatalogo
                .filter(i => i.nome && i.nome.toLowerCase().includes(busca))
                .map((item) => (
                  <tr key={item.id} className="border-b hover:bg-green-50 transition-colors group">
                    <td className="p-4 text-xs font-bold text-gray-500 text-center">{item.id}</td>
                    <td className="p-4 text-sm font-bold uppercase text-gray-700">
                      {item.nome}
                      {item.categoria && (
                        <span className="ml-2 block text-[9px] font-normal text-gray-400 lowercase">
                          ({item.categoria})
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-center font-bold text-gray-600">{item.unidade}</td>
                    <td className="p-4 bg-green-50/50">
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full bg-white border-2 border-gray-300 rounded-md p-2 text-center font-black text-green-700 focus:border-green-600 outline-none transition-all shadow-sm"
                        value={valores[item.id] || ''}
                        onChange={(e) => handleQtdChange(item.id, e.target.value)}
                      />
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => excluirItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover da lista temporariamente"
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