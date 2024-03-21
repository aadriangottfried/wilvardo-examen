import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Destino from 'App/Models/Destino';
import CopoMexResources from 'App/Resource/CopoMexReources';


export default class DestinosController {

  /**
 * @swagger
 * /api/destino:
 *   get:
 *     tags:
 *       - Destino
 *     summary: Obtiene una lista de destinos.
 *     responses:
 *       200:
 *         description: Lista de destinos obtenida exitosamente.
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
 *                   example: La lista de recursos fue encontrada exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       destino_id:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: Destino 1
 *       500:
 *         description: Error al obtener la lista de destinos.
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
 *                   example: Error al crear el destino
 *                 message:
 *                   type: string
 *                   example: El recurso no fue creado exitosamente
 *                 error:
 *                   type: string
 *                   example: Error interno del servidor
 */
  public async index({ response }: HttpContextContract) {
    try {
      const destinos = await Destino.query()
        .orderBy("destino_id", "asc")

      return response.status(200).json({
        type: "Exitoso",
        title: "Recurso encontrado",
        message: "La lista de recursos fue encontrada exitosamente",
        data: destinos,
      });
    } catch (error) {
      return response.status(500).json({
        success: "error",
        title: "Error al crear el destino",
        message: "El recurso no fue creado exitosamente",
        error: error.message,
      });
    }
  }

/**
 * @swagger
 * /api/destino:
 *   post:
 *     tags:
 *       - Destino
 *     summary: Crea un nuevo destino a partir de un código postal.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_postal:
 *                 type: string
 *                 example: "12345"
 *               km:
 *                 type: number
 *                 example: 100
 *               precio_km:
 *                 type: number
 *                 example: 5.5
 *     responses:
 *       201:
 *         description: Destino creado exitosamente.
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
 *                   example: Destino guardado exitosamente
 *                 message:
 *                   type: string
 *                   example: El destino ha sido guardado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Destino'
 *       400:
 *         description: Error en el código postal.
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
 *                   example: Error en el código postal
 *                 message:
 *                   type: string
 *                   example: El código postal debe tener 5 dígitos
 *       500:
 *         description: Error al guardar el destino.
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
 *                   example: Error al guardar el destino
 *                 message:
 *                   type: string
 *                   example: Mensaje de error específico
 */
  public async store({ request, response }: HttpContextContract) {

    const transaction = await Database.transaction();

    try {
      const codigo_postal = request.input('codigo_postal');
      const km = request.input('km');
      const precio_km = request.input('precio_km');

      // validar longitud del codigo postal
      if (codigo_postal.length !== 5) {
        return response.status(400).json({
          type: 'error',
          title: 'Error en el código postal',
          message: 'El código postal debe tener 5 dígitos'
        });
      }

      const inf_copomex = await CopoMexResources.obtenerDestinos(codigo_postal);

      console.log(codigo_postal);
      console.log(inf_copomex)

      const destino = new Destino();
      destino.codigo_postal = inf_copomex.data.response.cp;
      destino.pais = inf_copomex.data.response.pais;
      destino.ciudad = inf_copomex.data.response.ciudad;
      destino.estado = inf_copomex.data.response.estado;
      destino.km = km;
      destino.precio_km = precio_km;

      await destino.save();
      await transaction.commit();

      return response.status(201).json({
        type: 'Exitoso',
        title: 'Destino guardado exitosamente',
        message: 'El destino ah sido guardado exitosamente',
        data: destino
      });


    } catch (error) {
      await transaction.rollback();
      return response.status(500).json({
        type: 'error',
        title: 'Error al guardar el destino',
        message: error.message
      });
    }

  }

  /**
  * @swagger
  * /api/destino/{destino_id}:
  *   get:
  *     tags:
  *       - Destino
  *     summary: Obtiene un destino por su ID.
  *     parameters:
  *       - in: path
  *         name: destino_id
  *         required: true
  *         description: ID del destino a obtener.
  *         schema:
  *           type: integer
  *     responses:
  *       200:
  *         description: Destino encontrado.
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
  *                   example: El recurso fue encontrado exitosamente
  *                 data:
  *                   $ref: '#/components/schemas/Destino'
  *       404:
  *         description: Destino no encontrado.
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
  *                   example: El id no fue encontrado {destino_id}
  *                 data:
  *                   type: null
  */
  public async show({ response, params }: HttpContextContract) {
    const destino_id = params.destino_id;

    const destinos: any = await Destino.query()
      .where("destino_id", destino_id)
      .first();

    if (destinos) {
      return response.json({
        type: "show",
        title: "Recurso enseñado",
        messsage: " El recurso fue escontrado exitosamente",
        data: destinos,
      });
    } else {
      return response.status(404).json({
        type: "error",
        title: "Error del cliente",
        message: "El id no fue encuentro " + destino_id,
        data: destinos,
      });
    }
  }


  /**
 * @swagger
 * /api/destino/{destino_id}:
 *   put:
 *     tags:
 *       - Destino
 *     summary: Actualiza un destino existente por su ID.
 *     parameters:
 *       - in: path
 *         name: destino_id
 *         required: true
 *         description: ID del destino a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_postal:
 *                 type: string
 *                 example: "12345"
 *               km:
 *                 type: number
 *                 example: 100
 *               precio_km:
 *                 type: number
 *                 example: 5.5
 *     responses:
 *       200:
 *         description: Destino actualizado exitosamente.
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
 *                   example: Destino actualizado
 *                 message:
 *                   type: string
 *                   example: El Destino fue actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Destino'
 *       404:
 *         description: Destino no encontrado.
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
 *                   example: Destino no encontrado
 *                 message:
 *                   type: string
 *                   example: El destino no ha sido encontrado
 *                 data:
 *                   type: null
 *       500:
 *         description: Error al actualizar el destino.
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
 *                   example: Error al actualizar el destino
 *                 message:
 *                   type: string
 *                   example: Mensaje de error específico
 */
  public async update({ response, params, request }: HttpContextContract) {
    try {
      const destino_id = params.destino_id;
      const codigo_postal = request.input('codigo_postal');
      const km = request.input('km');
      const precio_km = request.input('precio_km');
      const inf_copomex = await CopoMexResources.obtenerDestinos(codigo_postal);

      if (inf_copomex.type === 'error') {
        return response.status(500).json({
          type: 'error',
          title: 'Error al querer buscar el destino',
          message: inf_copomex.message
        });
      } else {

        const destino = await Destino.query().where('destino_id', destino_id).first();

        if (!destino) {
          return response.status(404).json({
            type: 'error',
            title: 'Destino no encontrado',
            message: 'El destino no ha sido encontrado'
          });
        } else {

          destino.codigo_postal = inf_copomex.data.response.codigo_postal;
          destino.pais = inf_copomex.data.response.pais;
          destino.ciudad = inf_copomex.data.response.ciudad;
          destino.estado = inf_copomex.data.response.estado;
          destino.km = km;
          destino.precio_km = precio_km;

          await destino.save();

          return response.status(200).json({
            type: 'success',
            title: 'Destino actualizado',
            message: 'El Destino fue actualizado exitosamente',
            data: destino
          });
        }
      }
    } catch (error) {
      return response.status(500).json({
        type: 'error',
        title: 'Error al actualizar el destino',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/destino/{destino_id}:
   *   delete:
   *     tags:
   *       - Destino
   *     summary: Elimina un destino por su ID.
   *     parameters:
   *       - in: path
   *         name: destino_id
   *         required: true
   *         description: ID del destino a eliminar.
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Destino eliminado exitosamente.
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
   *                   example: Destino eliminado
   *                 message:
   *                   type: string
   *                   example: El Destino ha sido eliminado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Destino'
   *       404:
   *         description: Destino no encontrado.
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
   *                   example: El Destino no fue encontrado
   *                 message:
   *                   type: string
   *                   example: Destino no encontrado
   *                 data:
   *                   type: null
   *       500:
   *         description: Error al eliminar el destino.
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
   *                   example: Mensaje de error específico
   */
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const destino_id = params.destino_id;
      const destino = await Destino.find(destino_id);

      if (!destino) {
        return response.status(404).json({
          type: 'error',
          title: 'El Destino no fue encontrado',
          message: 'Destino no encontrado'
        });
      }

      await destino.delete();

      return response.status(200).json({
        type: 'success',
        title: 'Destino eliminado',
        message: 'El Destino ha sido eliminado exitosamente',
        data: destino
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

