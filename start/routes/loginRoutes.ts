import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/', 'AuthController.authLogin')
    

   // Route.post('/sendSms/:person_id', 'PeopleController.sendSMS');
    //Route.get('/cp/:cp', 'PeopleController.connectToAPIMXCP');
}).prefix('/api/auth')