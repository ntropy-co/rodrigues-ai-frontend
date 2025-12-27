/**
 * Types and Constants for TemplateGenerator
 */

// =============================================================================
// Document Types
// =============================================================================

export type DocumentTypeId =
  | 'cpr-fisica'
  | 'cpr-financeira'
  | 'contrato-compra-venda'

export interface DocumentType {
  id: DocumentTypeId
  name: string
  label: string
  description: string
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'cpr-fisica',
    name: 'CPR Física',
    label: 'CPR Física',
    description: 'Cédula de Produto Rural com entrega de produto físico'
  },
  {
    id: 'cpr-financeira',
    name: 'CPR Financeira',
    label: 'CPR Financeira',
    description: 'Cédula de Produto Rural com liquidação financeira'
  },
  {
    id: 'contrato-compra-venda',
    name: 'Contrato de Compra e Venda',
    label: 'Contrato de Compra e Venda',
    description: 'Contrato de compra e venda de produtos agrícolas'
  }
]

// =============================================================================
// Form Field Types
// =============================================================================

export interface DocumentField {
  name: string
  label: string
  type:
    | 'text'
    | 'cpf'
    | 'cnpj'
    | 'date'
    | 'number'
    | 'currency'
    | 'select'
    | 'textarea'
  placeholder?: string
  required?: boolean
  options?: string[]
}

// Fields for each document type
export const FIELDS_BY_TYPE: Record<DocumentTypeId, DocumentField[]> = {
  'cpr-fisica': [
    {
      name: 'emitente_nome',
      label: 'Nome do Emitente',
      type: 'text',
      required: true
    },
    {
      name: 'emitente_cpf_cnpj',
      label: 'CPF/CNPJ do Emitente',
      type: 'text',
      required: true
    },
    {
      name: 'emitente_endereco',
      label: 'Endereço do Emitente',
      type: 'text',
      required: true
    },
    {
      name: 'credor_nome',
      label: 'Nome do Credor',
      type: 'text',
      required: true
    },
    {
      name: 'credor_cpf_cnpj',
      label: 'CPF/CNPJ do Credor',
      type: 'text',
      required: true
    },
    {
      name: 'produto',
      label: 'Produto',
      type: 'select',
      options: ['Soja', 'Milho', 'Café', 'Trigo', 'Algodão'],
      required: true
    },
    {
      name: 'quantidade',
      label: 'Quantidade (sacas)',
      type: 'number',
      required: true
    },
    {
      name: 'data_emissao',
      label: 'Data de Emissão',
      type: 'date',
      required: true
    },
    {
      name: 'data_vencimento',
      label: 'Data de Vencimento',
      type: 'date',
      required: true
    },
    {
      name: 'local_entrega',
      label: 'Local de Entrega',
      type: 'text',
      required: true
    }
  ],
  'cpr-financeira': [
    {
      name: 'emitente_nome',
      label: 'Nome do Emitente',
      type: 'text',
      required: true
    },
    {
      name: 'emitente_cpf_cnpj',
      label: 'CPF/CNPJ do Emitente',
      type: 'text',
      required: true
    },
    {
      name: 'emitente_endereco',
      label: 'Endereço do Emitente',
      type: 'text',
      required: true
    },
    {
      name: 'credor_nome',
      label: 'Nome do Credor',
      type: 'text',
      required: true
    },
    {
      name: 'credor_cpf_cnpj',
      label: 'CPF/CNPJ do Credor',
      type: 'text',
      required: true
    },
    {
      name: 'produto',
      label: 'Produto de Referência',
      type: 'select',
      options: ['Soja', 'Milho', 'Café', 'Trigo', 'Algodão'],
      required: true
    },
    {
      name: 'valor_total',
      label: 'Valor Total (R$)',
      type: 'currency',
      required: true
    },
    {
      name: 'data_emissao',
      label: 'Data de Emissão',
      type: 'date',
      required: true
    },
    {
      name: 'data_vencimento',
      label: 'Data de Vencimento',
      type: 'date',
      required: true
    },
    {
      name: 'indice_correcao',
      label: 'Índice de Correção',
      type: 'select',
      options: ['IPCA', 'IGP-M', 'Nenhum']
    }
  ],
  'contrato-compra-venda': [
    {
      name: 'vendedor_nome',
      label: 'Nome do Vendedor',
      type: 'text',
      required: true
    },
    {
      name: 'vendedor_cpf_cnpj',
      label: 'CPF/CNPJ do Vendedor',
      type: 'text',
      required: true
    },
    {
      name: 'comprador_nome',
      label: 'Nome do Comprador',
      type: 'text',
      required: true
    },
    {
      name: 'comprador_cpf_cnpj',
      label: 'CPF/CNPJ do Comprador',
      type: 'text',
      required: true
    },
    {
      name: 'objeto',
      label: 'Objeto do Contrato',
      type: 'textarea',
      required: true
    },
    { name: 'valor', label: 'Valor (R$)', type: 'currency', required: true },
    {
      name: 'data_assinatura',
      label: 'Data de Assinatura',
      type: 'date',
      required: true
    }
  ]
}

// =============================================================================
// Optional Clauses
// =============================================================================

export interface OptionalClause {
  id: string
  label: string
  description: string
  /** Full legal text content for the clause */
  content: string
  /** Which document types this clause applies to. Empty array = applies to all. */
  appliesTo: DocumentTypeId[]
}

export const OPTIONAL_CLAUSES: OptionalClause[] = [
  {
    id: 'vencimento_antecipado',
    label: 'Vencimento Antecipado',
    description:
      'Permite ao credor exigir pagamento imediato em caso de inadimplência.',
    appliesTo: [],
    content: `CLÁUSULA DE VENCIMENTO ANTECIPADO: A dívida representada por este título vencerá antecipadamente, tornando-se imediatamente exigível, independentemente de notificação judicial ou extrajudicial, na ocorrência de qualquer das seguintes hipóteses: (i) inadimplemento de qualquer obrigação assumida neste instrumento; (ii) protesto de títulos ou inclusão do Emitente em cadastros de inadimplentes; (iii) pedido de recuperação judicial ou extrajudicial, ou decretação de falência do Emitente; (iv) alienação, oneração ou deterioração dos bens dados em garantia sem prévia autorização do Credor; (v) falsidade ou inexatidão de qualquer declaração prestada pelo Emitente neste instrumento.`
  },
  {
    id: 'correcao_monetaria_ipca',
    label: 'Correção Monetária (IPCA)',
    description:
      'Atualização do valor pelo Índice de Preços ao Consumidor Amplo.',
    appliesTo: ['cpr-financeira'],
    content: `CLÁUSULA DE CORREÇÃO MONETÁRIA: O valor nominal deste título será atualizado monetariamente pela variação do Índice Nacional de Preços ao Consumidor Amplo (IPCA), divulgado pelo Instituto Brasileiro de Geografia e Estatística (IBGE), calculada pro rata die a partir da data de emissão até a data do efetivo pagamento. Na hipótese de extinção do IPCA, será utilizado o índice que vier a substituí-lo oficialmente. Em caso de não divulgação do índice na data do vencimento, será utilizada a última variação conhecida, procedendo-se ao ajuste quando da divulgação definitiva.`
  },
  {
    id: 'correcao_monetaria_igpm',
    label: 'Correção Monetária (IGP-M)',
    description: 'Atualização do valor pelo Índice Geral de Preços do Mercado.',
    appliesTo: ['cpr-financeira'],
    content: `CLÁUSULA DE CORREÇÃO MONETÁRIA: O valor nominal deste título será atualizado monetariamente pela variação do Índice Geral de Preços do Mercado (IGP-M), divulgado pela Fundação Getúlio Vargas (FGV), calculada pro rata die a partir da data de emissão até a data do efetivo pagamento. Na hipótese de extinção do IGP-M, será utilizado o índice que vier a substituí-lo oficialmente ou, na sua ausência, o índice que melhor reflita a variação do poder aquisitivo da moeda nacional.`
  },
  {
    id: 'seguro_agricola',
    label: 'Seguro Agrícola',
    description:
      'Obrigação de contratação de seguro para a produção vinculada.',
    appliesTo: ['cpr-fisica'],
    content: `CLÁUSULA DE SEGURO AGRÍCOLA: O Emitente se obriga a contratar e manter vigente, durante todo o período de vigência desta Cédula, seguro agrícola que cubra a produção vinculada a este título contra riscos climáticos, pragas e demais sinistros previstos na apólice. O seguro deverá ter como beneficiário o Credor, na proporção de seu crédito, e a apólice ou seu certificado deverá ser apresentada ao Credor no prazo de até 30 (trinta) dias contados da assinatura deste instrumento. O descumprimento desta obrigação autoriza o Credor a contratar o seguro às expensas do Emitente e caracteriza inadimplemento contratual.`
  },
  {
    id: 'reconhecimento_firma',
    label: 'Reconhecimento de Firma',
    description: 'Exigência de autenticação das assinaturas em cartório.',
    appliesTo: [],
    content: `CLÁUSULA DE RECONHECIMENTO DE FIRMA: As partes concordam que as assinaturas apostas neste instrumento deverão ser reconhecidas por autenticidade perante o Tabelião de Notas competente, no prazo de até 10 (dez) dias úteis contados da data de assinatura. O reconhecimento de firma por autenticidade constitui requisito de eficácia deste título perante terceiros, e os custos correspondentes serão de responsabilidade do Emitente.`
  },
  {
    id: 'registro_cartorio',
    label: 'Registro em Cartório',
    description:
      'Obrigação de registro do título em cartório de imóveis ou títulos.',
    appliesTo: ['cpr-fisica', 'cpr-financeira'],
    content: `CLÁUSULA DE REGISTRO: Este título deverá ser registrado no Cartório de Registro de Imóveis da circunscrição onde estiver localizado o imóvel rural vinculado à produção, ou no Cartório de Registro de Títulos e Documentos da sede do Emitente, conforme o caso, no prazo de até 30 (trinta) dias contados da data de emissão. O registro é condição para eficácia real das garantias constituídas e para oponibilidade a terceiros. Todas as despesas com registro, incluindo emolumentos e taxas, correrão por conta exclusiva do Emitente.`
  },
  {
    id: 'arbitragem',
    label: 'Cláusula de Arbitragem',
    description: 'Resolução de conflitos por meio de tribunal arbitral.',
    appliesTo: [],
    content: `CLÁUSULA COMPROMISSÓRIA DE ARBITRAGEM: Qualquer controvérsia ou litígio oriundo deste instrumento, incluindo sua interpretação, execução, cumprimento ou rescisão, será resolvido definitivamente por arbitragem, de acordo com o Regulamento de Arbitragem da Câmara de Arbitragem do Mercado (CAM) da B3 S.A. – Brasil, Bolsa, Balcão, ou outra câmara de arbitragem de reputação reconhecida escolhida de comum acordo pelas partes. A arbitragem será conduzida na cidade de São Paulo/SP, em língua portuguesa, por árbitro único designado conforme o regulamento aplicável. A decisão arbitral será definitiva e vinculante, constituindo título executivo.`
  },
  {
    id: 'multa_mora',
    label: 'Multa e Mora',
    description: 'Penalidades por atraso no cumprimento das obrigações.',
    appliesTo: [],
    content: `CLÁUSULA DE MULTA E MORA: Em caso de atraso no cumprimento de qualquer obrigação pecuniária prevista neste instrumento, incidirão sobre o valor devido: (i) multa moratória de 2% (dois por cento) sobre o montante em atraso; (ii) juros de mora de 1% (um por cento) ao mês, calculados pro rata die, desde a data do vencimento até o efetivo pagamento; (iii) atualização monetária pelo mesmo índice de correção previsto neste título, ou, na sua ausência, pelo IPCA/IBGE. A incidência das penalidades ora previstas não exime o devedor do pagamento de perdas e danos eventualmente apurados.`
  }
]
