import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'DestinosController.index');
    Route.post('/', 'DestinosController.store');
    Route.get('/:destino_id', 'DestinosController.show');
    Route.put('/:destino_id', 'DestinosController.update');
    Route.delete('/:destino_id', 'DestinosController.destroy');

    //Route.post('/login', 'ClientesController.authLogin');
   // Route.post('/sendme-sms', 'ClientesController.sendMeSMS');
}).prefix('/api/destino')