import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.get('/', 'AdministradorsController.index');
    Route.post('/', 'AdministradorsController.store')
    Route.get('/:admin_id', 'AdministradorsController.show');
    Route.put('/:admin_id', 'AdministradorsController.update');
    Route.delete('/:admin_id', 'AdministradorsController.destroy');

   // Route.post('/sendSms/:person_id', 'PeopleController.sendSMS');
    //Route.get('/cp/:cp', 'PeopleController.connectToAPIMXCP');
}).prefix('/api/admin')