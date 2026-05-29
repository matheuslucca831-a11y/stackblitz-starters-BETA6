import Dexie from 'dexie';

export const db = new Dexie('GestaoClinicaFSPSS');

// V1 (mantida para histórico)
db.version(1).stores({
  encaminhamentos: '++id, nome, cross, dataRegistro, status, especialidade',
  pedidos: '++id, numeroPedido, data, categoria, status',
  materiais: '++id, codigo, descricao',
  remessas: '++id, numeroRemessa, destino, dataSaida'
});

// V2 (mantida para histórico)
db.version(2).stores({
  encaminhamentos: '++id, nome, cross, dataRegistro, status, especialidade',
  pedidos: '++id, numeroPedido, data, categoria, status',
  materiais: '++id, codigo, descricao',
  remessas: '++id, numeroRemessa, destino, dataSaida',

  sos: '++id, numeroOS, ano, unidade, dataSolicitacao, status'
});

// V3 (TEM QUE TER TUDO)
db.version(3).stores({
  encaminhamentos: '++id, nome, cross, dataRegistro, status, especialidade',
  pedidos: '++id, numeroPedido, data, categoria, status',
  materiais: '++id, codigo, descricao',
  remessas: '++id, numeroRemessa, destino, dataSaida',

  sos: '++id, numeroOS, ano, unidade, dataSolicitacao, status',

  pacientes: 'cross, nome, dataNasc, telefone',
  exames: '++id, cross, exame, status, dataRegistro, dataChegada'
});