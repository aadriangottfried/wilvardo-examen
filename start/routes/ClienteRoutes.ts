import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'ClientesController.index');
    Route.post('/', 'ClientesController.store');
    Route.get('/:cliente_id', 'ClientesController.show');
    Route.put('/:cliente_id', 'ClientesController.update');
    Route.delete('/:cliente_id', 'ClientesController.destroy');

    //Route.post('/login', 'ClientesController.authLogin');
   // Route.post('/sendme-sms', 'ClientesController.sendMeSMS');
}).prefix('/api/cliente')