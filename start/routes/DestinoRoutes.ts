import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'DestinosController.index');
    Route.post('/', 'DestinosController.store');
    Route.get('/:destino_id', 'DestinosController.show');
    Route.put('/:destino_id', 'DestinosController.update');
    Route.delete('/:destino_id', 'DestinosController.destroy');

    
}).prefix('/api/destino')