import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/codigo', 'RecoverContrasController.recoverContraMail')
    Route.post('/actuaContra', 'RecoverContrasController.actuaContra')
}).prefix('/api/recoverContra')