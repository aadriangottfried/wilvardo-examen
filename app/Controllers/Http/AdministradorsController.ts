import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Administrador from 'App/Models/Administrador';
import bcrypt from 'bcrypt';

export default class AdministradorsController {


  /**
 * @swagger
 * /api/admin:
 *   get:
 *     tags:
 *       - Administrador
 *     security:
 *       - bearerAuth: []
 *     summary: Obtiene una lista de administradores.
 *     responses:
 *       200:
 *         description: Lista de administradores obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: Exito
 *                 title:
 *                   type: string
 *                   example: Recursos encontrados
 *                 message:
 *                   type: string
 *                   example: La lista de recurso fue encontrada exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Administrador'
 *       500:
 *         description: Error al obtener la lista de administradores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: error
 *                 title:
 *                   type: string
 *                   example: error al crear a un administrador
 *                 message:
 *                   type: string
 *                   example: el recurso no fue creado exitosamente
 *                 error:
 *                   type: string
 *                   example: Mensaje de error específico
 */
  public async index({response}: HttpContextContract) {
    try {
      const admin = await Administrador.query()
        .orderBy("admin_id", "asc")
        

      return response.status(200).json({
        type: "Exito",
        title: "Recursos encontrrados",
        message: "La lista de recurso fue encontrada exitosamente ",
        data: admin,
      });
    } catch (error) {
      return response.status(500).json({
        success: "error",
        title: "error al crear a un administrador",
        message: "el recurso no fue creado exitosamente",
        error: error.message,
      });
    }
  }



/**
 * @swagger
 * /api/admin:
 *   post:
 *     tags:
 *       - Administrador
 *     security:
 *       - bearerAuth: []
 *     summary: Crea un nuevo administrador.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_name:
 *                 type: string
 *                 example: Admin1
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Perez
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               contraseña:
 *                 type: string
 *                 example: contraseña123
 *     responses:
 *       201:
 *         description: Administrador creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: creado
 *                 title:
 *                   type: string
 *                   example: el recurso fue creado
 *                 message:
 *                   type: string
 *                   example: el recurso fue creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Administrador'
 *       409:
 *         description: Conflict - El email ya existe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: error
 *                 title:
 *                   type: string
 *                   example: El email ya existe
 *                 message:
 *                   type: string
 *                   example: El email ya existe {email}
 *       500:
 *         description: Error al crear el administrador.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: error
 *                 title:
 *                   type: string
 *                   example: Error al crear el administrador
 *                 message:
 *                   type: string
 *                   example: El recurso no fue creado exitosamente
 *                 error:
 *                   type: string
 *                   example: Mensaje de error específico
 */
  public async store({response, request}: HttpContextContract) {
    const transaction = await Database.transaction();

    try {
      const AdminPost = request.only([
        "nombre",
        "apellido",
        "email",
        "contrasena"
      ]);

      const EmailExists = await Administrador.query()
        .where("email", AdminPost.email)
        .whereNull("deleted_at")
        .first();

      if (EmailExists) {
        await transaction.rollback();
        return response.status(409).json({
          type: "error",
          title: "El email ya existe",
          message:
            "El email ya existe " + EmailExists.email,
        });
      }

      AdminPost.contrasena = await bcrypt.hash(AdminPost.contrasena, 10);
      const admini = await Administrador.create(AdminPost, transaction);

      await transaction.commit();

      return response.status(201).json({
        type: "creado",
        title: "el recurso fue creado",
        message: "el recurso fue creado exitosamente",
        data: admini,
      });
    } catch (error) {
      await transaction.rollback();

      return response.status(500).json({
        success: "error",
        title: "Error al crear el administrador",
        message: "El recurso no fue creado exitosamente",
        error: error.message,
      });
    }
  }


  /**
 * @swagger
 * /api/admin/{admin_id}:
 *   get:
 *     tags:
 *       - Administrador
 *     security:
 *       - bearerAuth: []
 *     summary: Obtiene un administrador por su ID.
 *     parameters:
 *       - in: path
 *         name: admin_id
 *         required: true
 *         description: ID del administrador a obtener.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Administrador encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: show
 *                 title:
 *                   type: string
 *                   example: Enseñar recurso
 *                 message:
 *                   type: string
 *                   example: El recurso fue encontrado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Administrador'
 *       404:
 *         description: Administrador no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: error
 *                 title:
 *                   type: string
 *                   example: Error de cliente
 *                 message:
 *                   type: string
 *                   example: El id no fue encontrado {admin_id}
 *                 data:
 *                   type: null
 */
  public async show({response, params}: HttpContextContract) {
    const admin_id = params.admin_id;

    const adminis: any = await Administrador.query()
      .where("admin_id", admin_id)
      .first();

    if (adminis) {
      return response.json({
        type: "show",
        title: "Enseñar recurso",
        messsage: "El recurso fue encontrado exitosamente",
        data: adminis,
      });
    } else {
      return response.status(404).json({
        type: "error",
        title: "Error de cliente",
        message: "El id no fue encontrado " + admin_id,
        data: adminis,
      });
    }
  }


  /**
 * @swagger
 * /api/admin/{admin_id}:
 *   put:
 *     tags:
 *       - Administrador
 *     security:
 *       - bearerAuth: []
 *     summary: Actualiza un administrador por su ID.
 *     parameters:
 *       - in: path
 *         name: admin_id
 *         required: true
 *         description: ID del administrador a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Perez
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               contraseña:
 *                 type: string
 *                 example: contraseña123
 *     responses:
 *       200:
 *         description: Administrador actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: Exitoso
 *                 title:
 *                   type: string
 *                   example: Actualizacion exitosa
 *                 message:
 *                   type: string
 *                   example: El recurso fue actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Administrador'
 *       404:
 *         description: Administrador no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Administrador no encontrado
 */
  public async update({response, request, params}: HttpContextContract) {
    const cuerpo = request.all();
    const updateAdmin = await Administrador.query()
      .whereNotNull("admin_id")
      .whereNull("deleted_at")
      .where("admin_id", params.admin_id)
      .first();

    if (updateAdmin) {
      updateAdmin.nombre= cuerpo["nombre"];
      updateAdmin.apellido = cuerpo["apellido"];
      updateAdmin.email = cuerpo["email"];
      updateAdmin.contrasena = await bcrypt.hash(cuerpo["contrasena"], 10);

      await updateAdmin.save();
      response.status(200).json({
        type: "Exitoso",
        title: "Actualizacion exitosa",
        message: "El recurso fue actualizado exitosamente",
        data: updateAdmin,
      });
    } else {
      response.status(404).send({ error: "Administrador no encontrado" });
    }
  }

/**
 * @swagger
 * /api/admin/{admin_id}:
 *   delete:
 *     tags:
 *       - Administrador
 *     security:
 *       - bearerAuth: []
 *     summary: Elimina un administrador por su ID.
 *     parameters:
 *       - in: path
 *         name: admin_id
 *         required: true
 *         description: ID del administrador a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Administrador eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: Exitoso
 *                 title:
 *                   type: string
 *                   example: recurso eliminado
 *                 message:
 *                   type: string
 *                   example: el recurso fue eliminado exitosamente
 *                 data:
 *                   type: null
 *       404:
 *         description: Administrador no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: error
 *                 title:
 *                   type: string
 *                   example: el recurso no fue encontrado
 *                 message:
 *                   type: string
 *                   example: el recurso no fue econtrado
 *                 data:
 *                   type: null
 */
  public async destroy({params,response}: HttpContextContract) {
    const deleteAdmin = await Administrador.query()
      .whereNotNull("admin_id")
      .whereNull("deleted_at")
      .where("admin_id", params.admin_id)
      .first();

    if (deleteAdmin) {
      deleteAdmin.delete();
      response.status(200).json({
        type: "Exitoso",
        title: "recurso eliminado",
        message: "el recurso fue eliminado exitosamente",
        data: null,
      });
    } else {
      response.status(404).json({
        type: "error",
        title: "el recurso no fue encontrado",
        message: "el recurso no fue econtrado",
        data: null,
      });
    }
  }
}
