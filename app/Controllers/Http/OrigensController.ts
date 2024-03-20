import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Origen from 'App/Models/Origen';
import CopoMexResources from 'App/Resource/CopoMexReources';

export default class OrigensController {

/**
 * @swagger
 * /api/origen:
 *   get:
 *     tags:
 *       - Origen
 *     summary: Obtener todos los origenes
 *     responses:
 *       200:
 *         description: Origines encontrados exitosamente
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
 *                   example: Recurso encontrado
 *                 message:
 *                   type: string
 *                   example: Los origenes fueron encontrados exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Origen'
 *       500:
 *         description: Error al obtener los origenes
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
 *                   example: Error al obtener los origenes
 *                 message:
 *                   type: string
 *                   example: El recurso no fue creado exitosamente
 *                 error:
 *                   type: string
 *                   example: Mensaje de error detallado
 */
  public async index({response}: HttpContextContract) {
    try {
      const origen = await Origen.query()
        .orderBy("id", "asc")

      return response.status(200).json({
        type: "Exitoso",
        title: "Recurso encontrado",
        message: "Los origenes fueron encontrados exitosamente",
        data: origen,
      });
    } catch (error) {
      return response.status(500).json({
        success: "error",
        title: "Error al crear el origen",
        message: "El recurso no fue creado exitosamente",
        error: error.message,
      });
    }
  }


/**
 * @swagger
 * /api/origen:
 *   post:
 *     tags:
 *       - Origen
 *     summary: Guardar un nuevo origen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_postal:
 *                 type: string
 *     responses:
 *       201:
 *         description: Origen guardado exitosamente
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
 *                   example: Origen guardado exitosamente
 *                 message:
 *                   type: string
 *                   example: El origen ha sido guardado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Origen'
 *       500:
 *         description: Error al guardar el origen
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
 *                   example: Error al guardar el origen
 *                 message:
 *                   type: string
 *                   example: Mensaje de error detallado
 */
  public async store({request, response}: HttpContextContract) {
    const transaction = await Database.transaction();

    try {
      const codigo_postal = request.input('codigo_postal');
      const inf_copomex= await CopoMexResources.obtenerDestinos(codigo_postal);

      console.log(codigo_postal);
      console.log(inf_copomex)

      const origen = new Origen();
      origen.codigo_postal = inf_copomex.data.response.cp;
      origen.pais = inf_copomex.data.response.pais;
      origen.ciudad = inf_copomex.data.response.ciudad;
      origen.estado = inf_copomex.data.response.estado;

      await origen.save();
      await transaction.commit();

      return response.status(201).json({
        type: 'Exitoso',
        title: 'Origen guardado exitosamente',
        message: 'El origen ah sido guardado exitosamente',
        data: origen
      });

    } catch (error) {
      await transaction.rollback();
      return response.status(500).json({
        type: 'error',
        title: 'Error al guardar el origen',
        message: error.message
      });
    }
  }


  /**
 * @swagger
 * /api/origen/{id}:
 *   get:
 *     tags:
 *       - Origen
 *     summary: Obtener un origen por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del origen a obtener
 *     responses:
 *       200:
 *         description: Origen encontrado exitosamente
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
 *                   example: Recurso enseñado
 *                 message:
 *                   type: string
 *                   example: El origen fue encontrado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Origen'
 *       404:
 *         description: El origen con el ID especificado no fue encontrado
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
 *                   example: Error del cliente
 *                 message:
 *                   type: string
 *                   example: El ID no fue encontrado
 *                 data:
 *                   type: integer
 *                   example: 123
 */
  public async show({response,params}: HttpContextContract) {
    const id = params.id;

    const origen: any = await Origen.query()
      .where("id", id)
      .first();

    if (origen) {
      return response.json({
        type: "show",
        title: "Recurso enseñado",
        messsage: " El origen fue escontrado exitosamente",
        data: origen,
      });
    } else {
      return response.status(404).json({
        type: "error",
        title: "Error del cliente",
        message: "El id no fue encuentro " + id,
        data: id,
      });
    }

  }

  /**
 * @swagger
 * /api/origen/{id}:
 *   put:
 *     tags:
 *       - Origen
 *     summary: Actualizar un origen por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del origen a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_postal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Origen actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 title:
 *                   type: string
 *                   example: Origen actualizado
 *                 message:
 *                   type: string
 *                   example: El origen fue actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Origen'
 *       404:
 *         description: El origen con el ID especificado no fue encontrado
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
 *                   example: Origen no encontrado
 *                 message:
 *                   type: string
 *                   example: El origen no ha sido encontrado
 *       500:
 *         description: Error al actualizar el origen
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
 *                   example: Error al actualizar el origen
 *                 message:
 *                   type: string
 *                   example: Mensaje de error detallado
 */
  public async update({response, params, request}: HttpContextContract) {
    try {
      const id = params.id;
      const codigo_postal = request.input('codigo_postal');
      const inf_copomex = await CopoMexResources.obtenerDestinos(codigo_postal);

      if (inf_copomex.type === 'error') {
        return response.status(500).json({
          type: 'error',
          title: 'Error al querer buscar el origen',
          message: inf_copomex.message
        });
      } else {

        const origen = await Origen.query().where('id',id).first();

        if (!origen) {
          return response.status(404).json({
            type: 'error',
            title: 'Origen no encontrado',
            message: 'El origen no ha sido encontrado'
          });
        } else {

          origen.codigo_postal = inf_copomex.data.response.cp;
          origen.pais = inf_copomex.data.response.pais;
          origen.ciudad = inf_copomex.data.response.ciudad;
          origen.estado = inf_copomex.data.response.estado;
        
          await origen.save();

          return response.status(200).json({
            type: 'success',
            title: 'Origen actualizado',
            message: 'El Origen fue actualizado exitosamente',
            data: origen
          });
        }
      }
    } catch (error) {
      return response.status(500).json({
        type: 'error',
        title: 'Error al actualizar el origen',
        message: error.message
      });
    }
  }


/**
 * @swagger
 * /api/origen/{id}:
 *   delete:
 *     tags:
 *       - Origen
 *     summary: Eliminar un origen por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del origen a eliminar
 *     responses:
 *       200:
 *         description: Origen eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: success
 *                 title:
 *                   type: string
 *                   example: Origen eliminado
 *                 message:
 *                   type: string
 *                   example: El origen ha sido eliminado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Origen'
 *       404:
 *         description: El origen con el ID especificado no fue encontrado
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
 *                   example: Origen no encontrado
 *                 message:
 *                   type: string
 *                   example: Origen no encontrado
 *       500:
 *         description: Error al eliminar el origen
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
 *                   example: Error al querer eliminar el destino
 *                 message:
 *                   type: string
 *                   example: Mensaje de error detallado
 */
  public async destroy({params, response}: HttpContextContract) {
    try {
      const id = params.id;
      const origen = await Origen.find(id);
  
      if (!origen) {
        return response.status(404).json({
          type: 'error',
          title: 'El Origen no fue encontrado',
          message: 'Origen no encontrado'
        });
      }
  
      await origen.delete();
  
      return response.status(200).json({
        type: 'success',
        title: 'Origen eliminado',
        message: 'El origen ha sido eliminado exitosamente',
        data: origen
      });
    } catch (error) {
      return response.status(500).json({
        type: 'error',
        title: 'Error al querer eliminar el destino',
        message: error.message
      });
    }
  }

}

