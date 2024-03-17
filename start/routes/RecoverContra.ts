import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/codigo', 'RecuperarContrasController.recuperarContrasenaCorreo')
    Route.post('/actualizarContra', 'RecuperarContrasController.actualizarContrasena')
}).prefix('/api/recoverContra')