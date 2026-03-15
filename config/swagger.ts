const swagger = {
  path: __dirname + '/../',
  info: {
    title: 'Gateway API',
    version: '1.0.0',
    description: 'Documentacao da API de pagamentos multi-gateway',
  },
  tagIndex: 1,
  snakeCase: false,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  authMiddlewares: ['auth', 'auth:api'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,
  deepLinking: true,
  showFullPath: false,
}

export default swagger
