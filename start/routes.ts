/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import AutoSwagger from 'adonis-autoswagger'
import swagger from 'Config/swagger'

Route.post('/auth/login', 'AuthController.store')
Route.post('/payments/purchase', 'PaymentsController.store').middleware('auth')

Route.group(() => {
  Route.get('/gateways', 'GatewaysController.index').middleware('role:ADMIN')
  Route.patch('/gateways/:id/active', 'GatewaysController.updateActive').middleware('role:ADMIN')
  Route.patch('/gateways/:id/priority', 'GatewaysController.updatePriority').middleware('role:ADMIN')

  Route.get('/users', 'UsersController.index').middleware('role:ADMIN,MANAGER')
  Route.get('/users/:id', 'UsersController.show').middleware('role:ADMIN,MANAGER')
  Route.post('/users', 'UsersController.store').middleware('role:ADMIN,MANAGER')
  Route.post('/admin/users', 'UsersController.storeWithRole').middleware('role:ADMIN')
  Route.get('/admin/roles', 'UsersController.roles').middleware('role:ADMIN')
  Route.put('/users/:id', 'UsersController.update')
  Route.delete('/users/:id', 'UsersController.destroy')

  Route.get('/products', 'ProductsController.index').middleware('role:ADMIN,MANAGER,FINANCE')
  Route.get('/products/:id', 'ProductsController.show').middleware('role:ADMIN,MANAGER,FINANCE')
  Route.post('/products', 'ProductsController.store').middleware('role:ADMIN,MANAGER,FINANCE')
  Route.put('/products/:id', 'ProductsController.update').middleware('role:ADMIN,MANAGER,FINANCE')
  Route.delete('/products/:id', 'ProductsController.destroy').middleware('role:ADMIN,MANAGER,FINANCE')

  Route.get('/clients', 'ClientsController.index')
  Route.get('/clients/:id', 'ClientsController.show')

  Route.get('/transactions', 'TransactionsController.index')
  Route.get('/transactions/:id', 'TransactionsController.show')
  Route.post('/transactions/:id/refund', 'TransactionsController.refund').middleware('role:ADMIN,FINANCE')
}).middleware('auth')

Route.get('/swagger', async () => {
  return AutoSwagger.docs(Route.toJSON(), swagger)
})

Route.get('/docs', async () => {
  const swaggerUi = AutoSwagger.ui('/swagger', swagger)

  const persistenceScript = `
  <script>
    (function () {
      const STORAGE_KEY = 'swagger_open_operations_v1';
      const READY_RETRIES = 40;
      const RETRY_INTERVAL_MS = 250;

      function readState() {
        try {
          const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        } catch (_) {}
        return {};
      }

      function writeState(nextState) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch (_) {}
      }

      function operationIdFromOpblock(opblock) {
        if (!opblock) return null;
        const idAttr = opblock.getAttribute('id');
        if (idAttr && idAttr.trim().length > 0) return idAttr;
        const pathAttr = opblock.getAttribute('data-path');
        const methodAttr = opblock.getAttribute('data-method');
        if (pathAttr && methodAttr) return methodAttr + ' ' + pathAttr;
        return null;
      }

      function attachListeners() {
        const state = readState();
        const opblocks = Array.from(document.querySelectorAll('.opblock'));
        opblocks.forEach(function (opblock) {
          const key = operationIdFromOpblock(opblock);
          if (!key) return;

          const summary = opblock.querySelector('.opblock-summary');
          if (!summary || summary.dataset.persistenceBound === '1') return;
          summary.dataset.persistenceBound = '1';

          const shouldBeOpen = state[key] === true;
          const isOpen = opblock.classList.contains('is-open');
          if (shouldBeOpen !== isOpen) {
            summary.click();
          }

          summary.addEventListener('click', function () {
            setTimeout(function () {
              const currentState = readState();
              currentState[key] = opblock.classList.contains('is-open');
              writeState(currentState);
            }, 0);
          });
        });
      }

      function waitUntilReady(attempt) {
        attachListeners();
        if (attempt >= READY_RETRIES) return;
        setTimeout(function () {
          waitUntilReady(attempt + 1);
        }, RETRY_INTERVAL_MS);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          waitUntilReady(0);
        });
      } else {
        waitUntilReady(0);
      }
    })();
  </script>
  `;

  return swaggerUi.replace('</body>', `${persistenceScript}</body>`)
})
