import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Administrador from 'App/Models/Administrador'
import Env from '@ioc:Adonis/Core/Env'
import SolicitudRecuperacion from 'App/Models/SolicitudRecuperacion'
import { DateTime } from 'luxon'
import bcrypt from 'bcrypt';



export default class RecoverContrasController {



    /**
 * @swagger
 * /api/recoverContra/codigo:
 *   post:
 *     summary: Recupera la contraseña del administrador y envía un correo electrónico con un código de verificación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del administrador
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Correo electrónico enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (success)
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *       404:
 *         description: No se encontró ningún administrador con el correo electrónico proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (error)
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (error)
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                 descr:
 *                   type: string
 *                   description: Descripción detallada del error
 */
    public async recoverContraMail({response, request }: HttpContextContract){

        let code: SolicitudRecuperacion
        const { email } = request.only(['email'])

        const administrador = await Administrador.query().where('email',email).whereNull('deleted_at').first()

        if (!administrador) {
            return response.status(404).json({
                type: 'error',
                message: 'No existe ningun admininstrador que corresponda al correo'
            })
        }

        try {
            const CodeEnEspera = await SolicitudRecuperacion.query()
                .where(' administrador_id ', administrador.admin_id)
                .where('utilizado', false)
                .update({ utilizado: true })

           
            code = new SolicitudRecuperacion()
            code.codigo_verificacion = await this.createCode();
            code.administrador_id = administrador.admin_id;
            code.expires_at = DateTime.now().plus({ hours: 1 });

            await code.save()

            await Mail.send((message) => {
                message
                    .from(Env.get('SMTP_USERNAME'))
                    .to(email)
                    .subject('Recuperar contraseña')
                    .html('Digite el código para recuperar contraseña: <strong>' + code.codigo_verificacion  + '</strong>')
            })

            return response.status(200).json({
                type: 'success',
                message: 'Correo enviado'
            })
        } catch (error) {
            return response.status(500).json({
                type: 'error',
                message: error,
                descr: error.message
            })
        }
    }

    public async createCode() {
        let code: string = ''
        while (code.length < 6) {
            code += Math.random().toString(36).substring(2, 8)
        }
        return code.substring(0, 6)
    }


    /**
 * @swagger
 * /api/recoverContra/actuaContra:
 *   post:
 *     summary: Reset password
 *     description: Reset password using a verification code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_verificacion:
 *                 type: string
 *                 example: ABC123
 *               contrasena:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: The password has been updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: La contraseña ha sido actualizada
 *       404:
 *         description: Verification code not valid or expired.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: El código de recuperación no es válido o ha expirado.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error message
 */
    public async actuaContra ({response, request}: HttpContextContract){

        const { codigo_verificacion, contrasena } = request.only(['codigo_verificacion', 'contrasena'])
        const SolicitudRecu = await SolicitudRecuperacion.query().where('codigo_verificacion', codigo_verificacion).where('utilizado', false).first()

        if (!SolicitudRecu) {
            return response.status(404).json({
                type: 'error',
                message: 'El código de recuperación no es válido o ha expirado.'
            })
        }

        const administrador = await Administrador.query().where('admin_id', SolicitudRecu.administrador_id).whereNull('deleted_at').first();

        if (!administrador) {
            return response.status(404).json({
                type: 'error',
                message: 'No existe ningun admininstrador que corresponda al correo'
            })
        }

        try {
            administrador.contrasena = await bcrypt.hash(contrasena, 10);
            await administrador.save();

            await SolicitudRecuperacion.query().where('codigo_verificacion',codigo_verificacion).update({ utilizado: true });

            return response.status(200).json({
                type: 'success',
                message: 'La contraseña ha actualizada'
            });
        } catch (error) {
            return response.status(500).json({
                type: 'error',
                message: error.message
            })
        }
    }

}
