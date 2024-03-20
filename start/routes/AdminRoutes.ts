import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'AdministradorsController.index').middleware('auth:api')
    Route.post('/', 'AdministradorsController.store').middleware('auth:api')
    Route.get('/:admin_id', 'AdministradorsController.show').middleware('auth:api')
    Route.put('/:admin_id', 'AdministradorsController.update').middleware('auth:api')
    Route.delete('/:admin_id', 'AdministradorsController.destroy').middleware('auth:api') 
}).prefix('/api/admin')