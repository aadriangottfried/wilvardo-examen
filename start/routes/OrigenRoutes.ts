import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'OrigensController.index')
    Route.post('/', 'OrigensController.store')
    Route.get('/:id', 'OrigensController.show')
    Route.put('/:id', 'OrigensController.update')
    Route.delete('/:id', 'OrigensController.destroy')
}).prefix('/api/origen')