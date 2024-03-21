import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'CotizacionesController.index');
    Route.post('/:destino_id', 'CotizacionesController.store')
    Route.get('/:id', 'CotizacionesController.show');
    Route.put('/:id', 'CotizacionesController.update');
    Route.delete('/:id', 'CotizacionesController.destroy');

    Route.post('/send-sms/:id', 'CotizacionesController.sendSMS');

    Route.post('/:cotizacion/aceptacion', 'CotizacionesController.aceptacion');
    Route.post('/:cotizacion/rechazo', 'CotizacionesController.rechazo');

}).prefix('/api/cotizacion')