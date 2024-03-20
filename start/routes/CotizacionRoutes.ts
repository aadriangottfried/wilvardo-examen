import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'CotizacionesController.index');
    Route.post('/', 'CotizacionesController.store')
    Route.get('/:id', 'CotizacionesController.show');
    Route.put('/:id', 'CotizacionesController.update');
    Route.delete('/:id', 'CotizacionesController.destroy');

   Route.post('/sendSms/:id', 'CotizacionesController.sendSMS');
    
}).prefix('/api/cotizacion')