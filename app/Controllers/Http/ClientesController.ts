import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Cliente from 'App/Models/Cliente';

export default class ClientesController {

/**
 * @swagger
 * /api/cliente:
 *   get:
 *     tags:
 *       - Cliente
 *     security:
 *       - bearerAuth: []
 *     summary: Obtiene una lista de clientes.
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente.
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
 *                   example: La lista de recursos se encontró exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Error al obtener la lista de clientes.
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
 *                   example: Error al crear a un cliente
 *                 message:
 *                   type: string
 *                   example: El recurso no fue creado exitosamente
 *                 error:
 *                   type: string
 *                   example: Mensaje de error específico
 */
  public async index({response}: HttpContextContract) {
    try {
      const clientes = await Cliente.query()
        .orderBy("cliente_id", "asc")

      return response.status(200).json({
        type: "Exitoso",
        title: "Recurso encontrado ",
        message: "La lista de recursos se encontro exitosamentel",
        data: clientes,
      });
    } catch (error) {
      return response.status(500).json({
        success: "error",
        title: "Error al crear a un cliente",
        message: "El recurso no fue creado exitosamente",
        error: error.message,
      });
    }
  }



/**
 * @swagger
 * /api/cliente:
 *   post:
 *     tags:
 *       - Cliente
 *     security:
 *       - bearerAuth: []
 *     summary: Crea un nuevo cliente.
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
 *               telefono:
 *                 type: string
 *                 example: "123456789"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: Creado
 *                 title:
 *                   type: string
 *                   example: El recurso ha sido creado
 *                 message:
 *                   type: string
 *                   example: El recurso ha sido creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       409:
 *         description: Conflict - El número de teléfono ya existe.
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
 *                   example: El numero de telefono ya existe
 *                 message:
 *                   type: string
 *                   example: El numero de telefono ya existe {telefono}
 *       500:
 *         description: Error al crear el cliente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: Error
 *                 title:
 *                   type: string
 *                   example: Error al crear cliente
 *                 message:
 *                   type: string
 *                   example: El recurso no fue creado exitosamente
 *                 error:
 *                   type: string
 *                   example: Mensaje de error específico
 */
  public async store({response, request }: HttpContextContract) {
    const transaction = await Database.transaction();

    try {
      const clientePost = request.only([
        "nombre",
        "apellido",
        "telefono",
      ]);

      const NumeroTelefonoExists = await Cliente.query()
        .where("telefono", clientePost.telefono)
        .whereNull("deleted_at")
        .first();

      if (NumeroTelefonoExists) {
        await transaction.rollback();
        return response.status(409).json({
          type: "error",
          title: "El numero de telefono ya existe",
          message:
            "El numero de telefono ya existe " + NumeroTelefonoExists.telefono,
        });
      }

      const cliente = await Cliente.create(clientePost, transaction);

      await transaction.commit();

      return response.status(201).json({
        type: "Creado",
        title: "El recurso ha sido creado",
        message: "El recurso ha sido creado exitosamente",
        data: cliente,
      });
    } catch (error) {
      await transaction.rollback();

      return response.status(500).json({
        success: "Error",
        title: "Error al crear cliente",
        message: "El recurso no fue creado exitosamente",
        error: error.message,
      });
    }
  }


  /**
 * @swagger
 * /api/cliente/{cliente_id}:
 *   get:
 *     tags:
 *       - Cliente
 *     security:
 *       - bearerAuth: []
 *     summary: Obtiene un cliente por su ID.
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         description: ID del cliente a obtener.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: Enseñar
 *                 title:
 *                   type: string
 *                   example: Recurso enseñado
 *                 message:
 *                   type: string
 *                   example: El recurso fue encontrado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado.
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
 *                   example: erro del cliente
 *                 message:
 *                   type: string
 *                   example: No se encontró el cliente con ID {cliente_id}
 *                 data:
 *                   type: null
 */
  public async show({response, params}: HttpContextContract) {
    const cliente_id = params.cliente_id;

    const cliente: any = await Cliente.query()
      .where("Cliente_id", cliente_id)
      .first();

    if (cliente) {
      return response.json({
        type: "Enseñar",
        title: "Recurso enseñado",
        messsage: "El recurso fue encontrado exitosamente",
        data: cliente,
      });
    } else {
      return response.status(404).json({
        type: "error",
        title: "erro del cliente",
        message: "No se encontro el id " + cliente_id,
        data: cliente,
      });
    }
  }


/**
 * @swagger
 * /api/cliente/{cliente_id}:
 *   put:
 *     tags:
 *       - Cliente
 *     security:
 *       - bearerAuth: []
 *     summary: Actualiza un cliente por su ID.
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         description: ID del cliente a actualizar.
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
 *               telefono:
 *                 type: string
 *                 example: "123456789"
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente.
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
 *                   example: Actualizacion Exitosa
 *                 message:
 *                   type: string
 *                   example: El recurso se actualizó exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cliente no fue encontrado
 */
  public async update({response, request, params}: HttpContextContract) {
    const cuerpo = request.all();
    const updateCliente = await Cliente.query()
      .whereNotNull("cliente_id")
      .whereNull("deleted_at")
      .where("cliente_id", params.cliente_id)
      .first();

    if (updateCliente) {
      updateCliente.nombre = cuerpo["nombre"];
      updateCliente.apellido = cuerpo["apellido"];
      updateCliente.telefono = cuerpo["telefono"];

      await updateCliente.save();
      response.status(200).json({
        type: "Exitoso",
        title: "Actualizacion Exitosa",
        message: "El recurso se actualizo exitosamente",
        data: updateCliente,
      });
    } else {
      response.status(404).send({ error: "Cliente no fue encontrado" });
    }
  }

/**
 * @swagger
 * /api/cliente/{cliente_id}:
 *   delete:
 *     tags:
 *       - Cliente
 *     security:
 *       - bearerAuth: []
 *     summary: Elimina un cliente por su ID.
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         description: ID del cliente a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente.
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
 *                   example: El recurso fue eliminado
 *                 message:
 *                   type: string
 *                   example: El recurso fue eliminado exitosamente
 *                 data:
 *                   type: null
 *       404:
 *         description: Cliente no encontrado.
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
 *                   example: recurso no econtrado
 *                 message:
 *                   type: string
 *                   example: El recurso no fue encontrado
 *                 data:
 *                   type: null
 */
  public async destroy({params,response}: HttpContextContract) {

    const deleteCliente = await Cliente.query()
      .whereNotNull("cliente_id")
      .whereNull("deleted_at")
      .where("cliente_id", params.cliente_id)
      .first();

    if (deleteCliente) {
      deleteCliente.delete();
      response.status(200).json({
        type: "Exitoso",
        title: "El recurso fue eliminado",
        message: "El recurso fue eliminado exitosamente",
        data: null,
      });
    } else {
      response.status(404).json({
        type: "error",
        title: "recurso no econtrado",
        message: "El recurso no fue encontrado",
        data: null,
      });
    }
    
  }
}
