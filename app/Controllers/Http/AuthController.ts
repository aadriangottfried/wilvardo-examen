import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Administrador from 'App/Models/Administrador';
import bcrypt from 'bcrypt';


/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Iniciar sesión de administrador
 *     description: Iniciar sesión de administrador con email y contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               contrasena:
 *                 type: string
 *             required:
 *               - email
 *               - contrasena
 *     responses:
 *       '200':
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 message:
 *                   type: string
 *                 type:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       '401':
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 message:
 *                   type: string
 *                 type:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     password:
 *                       type: string
 *       '500':
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 message:
 *                   type: string
 *                 type:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 */
export default class AuthController {
  public async authLogin({ request, response, auth }: HttpContextContract) {
    try {
      const email = request.input('email');
      const contrasena = request.input('contrasena');
      const reqAdmin = await Administrador.query().where('email', email).whereNull('deleted_at').first();
      

      if (!reqAdmin) {
        return response.status(401).send({
          title: 'Datos inválidos',
          message: 'El usuario y/o contraseña son inválidos', type: 'warning',
          data: {
            email: email, password: contrasena
          },
        })
      }

      const hashedPass = reqAdmin.contrasena;

      if (!(await bcrypt.compare(contrasena, hashedPass))) {
        return response.status(401).send({
          title: 'Datos inválidos',
          message: 'El usuario y/o contraseña son inválidos', type: 'warning',
          data: {
            email: email,
            password: contrasena
          },
        })
      }

      const token = await auth.use('api').generate(reqAdmin, {
        expiresIn: '1mins',
      })



      return response.status(200).send({
        title: 'Autenticación exitosa',
        message: 'El token se ha generado de manera exitosa', type: 'success',
        data: {
          token
        },
      })

    } catch (error) {
      return response.status(500).send({
        title: 'Error',
        message: 'Ocurrio un error',
        type: 'Error',
        data: {
          error: error.message
        }
      })
    }
  }
  

}
