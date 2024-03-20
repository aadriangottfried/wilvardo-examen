import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'ClientesController.index').middleware('auth:api');
    Route.post('/', 'ClientesController.store').middleware('auth:api');
    Route.get('/:cliente_id', 'ClientesController.show').middleware('auth:api');
    Route.put('/:cliente_id', 'ClientesController.update').middleware('auth:api');
    Route.delete('/:cliente_id', 'ClientesController.destroy').middleware('auth:api');

    
}).prefix('/api/cliente')