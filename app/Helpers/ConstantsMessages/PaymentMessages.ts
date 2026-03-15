export const PAYMENT_MESSAGES = {
  CHARGE_SUCCESS: 'Pagamento processado com sucesso',
  CHARGE_ERROR: 'Falha ao processar pagamento',
  INVALID_ITEMS: 'Itens da compra inválidos',
  ITEM_NOT_FOUND: 'Um ou mais produtos não foram encontrados',
  NO_ACTIVE_GATEWAYS: 'Nenhum gateway ativo configurado',
  UNSUPPORTED_GATEWAY: 'Gateway não suportado',
  ALL_GATEWAYS_FAILED: 'Não foi possível processar o pagamento em nenhum gateway',
} as const
