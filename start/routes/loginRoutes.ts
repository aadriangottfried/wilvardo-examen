import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/', 'AuthController.authLogin')
    

   
}).prefix('/api/auth')