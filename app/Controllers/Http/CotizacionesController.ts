import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Cotizacion from 'App/Models/Cotizacion';
import Env from '@ioc:Adonis/Core/Env'
import Cliente from 'App/Models/Cliente';

export default class CotizacionesController {

/**
 * /api/cotizacion:
 *   get:
 *     tags:
 *       - Cotizacion
 *     summary: Obtiene la lista de cotizaciones ordenadas por ID de forma ascendente.
 *     responses:
 *       200:
 *         description: Lista de cotizaciones encontrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (Exito)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cotizacion'
 *                   description: Lista de cotizaciones
 *       500:
 *         description: Error al obtener la lista de cotizaciones.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   description: Tipo de mensaje (error)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje de error
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                 error:
 *                   type: string
 *                   description: Descripción detallada del error
 */
  public async index({response}: HttpContextContract) {
    try {
      const cotizaciones = await Cotizacion.query()
        .whereNull('deleted_at');
        

      return response.status(200).json({
        type: "Exito",
        title: "Recursos encontrrados",
        message: "La lista de recurso fue encontrada exitosamente ",
        data: cotizaciones,
      });
    } catch (error) {
      return response.status(500).json({
        success: "error",
        title: "error al crear una cotizacion",
        message: "el recurso no fue creado exitosamente",
        error: error.message,
      });
    }
  }

/**
 * @swagger
 * /api/cotizacion:
 *   post:
 *     tags:
 *       - Cotizacion
 *     summary: Crea una nueva cotización.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: integer
 *                 description: ID del cliente asociado a la cotización
 *               origen_id:
 *                 type: integer
 *                 description: ID del origen de la cotización
 *               destino_id:
 *                 type: integer
 *                 description: ID del destino de la cotización
 *               categoria:
 *                 type: string
 *                 description: Categoría de la cotización ('primera_clase', 'clase_media', 'comercial')
 *               precio:
 *                 type: number
 *                 description: Precio base de la cotización
 *               aprobada:
 *                 type: boolean
 *                 description: Indica si la cotización está aprobada
 *               codigo_verificacion:
 *                 type: string
 *                 description: Código de verificación de la cotización
 *               INE:
 *                 type: string
 *                 format: binary
 *                 description: Identificación oficial del cliente (imagen)
 *             required:
 *               - cliente_id
 *               - origen_id
 *               - destino_id
 *               - categoria
 *               - precio
 *               - folio
 *               - aprobada
 *               - codigo_verificacion
 *               - INE
 *     responses:
 *       201:
 *         description: Cotización creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (creada)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 data:
 *                   $ref: '#/components/schemas/Cotizacion'
 *                   description: Objeto de la cotización creada
 *       409:
 *         description: El cliente ya tiene una cotización existente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (error)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje de error
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *       500:
 *         description: Error al crear la cotización.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   description: Tipo de mensaje (error)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje de error
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                 error:
 *                   type: string
 *                   description: Descripción detallada del error
 */
  public async store({response, request}: HttpContextContract) {
    const transaction = await Database.transaction();

    try {
      const cotiPost = request.only([
        "cliente_id",
        "origen_id",
        "destino_id",
        "categoria",
        "precio",
        "aprobada",
        "codigo_verificacion",
        "INE"
      ]);

      const categoriaPermitida = ['primera_clase', 'clase_media', 'comercial'];

      if (!categoriaPermitida.includes(cotiPost.categoria)) {
        await transaction.rollback();
        return response.status(400).json({
          type: "error",
          title: "Categoria no válida",
          message: "La categoría debe ser 'primera_clase', 'clase_media' o 'comercial'.",
        });
      }

      let cargoExtra = 0;

      switch (cotiPost.categoria) {
        case 'comercial':
          cargoExtra = 0;
          break;
        case 'clase_media':
          cargoExtra = cotiPost.precio * 0.10; // 10% del precio como cargo extra
          break;
        case 'primera_clase':
          cargoExtra = cotiPost.precio * 0.25; // 25% del precio como cargo extra
          break;
        default:
          break;
      }

      const precioFinal = cotiPost.precio + cargoExtra;

      cotiPost.precio=precioFinal;

      const folio = Math.random().toString(36).substring(2, 14).toUpperCase();
      

      const clienteExists = await Cotizacion.query()
        .where("cliente_id", cotiPost.cliente_id)
        .whereNull("deleted_at")
        .first();

        clienteExists.folio = folio;

      if (clienteExists) {
        await transaction.rollback();
        return response.status(409).json({
          type: "error",
          title: "El cliente ya cuenta con una cotizacion",
          message:
            "El cliente ya cuenta con una cotizacion" + clienteExists.cliente_id,
        });
      }

      const cotiza = await Cotizacion.create(cotiPost, transaction);

      await transaction.commit();

      return response.status(201).json({
        type: "creada",
        title: "La cotizacion fue creado",
        message: "la cotizacion fue creada exitosamente",
        data: cotiza,
      });
    } catch (error) {
      await transaction.rollback();

      return response.status(500).json({
        success: "error",
        title: "Error al crear la cotizacion",
        message: "La cotizacion no fue creado exitosamente",
        error: error.message,
      });
    }
  }
  
/**
 * @swagger
 * /api/cotizacion/{id}:
 *   get:
 *     tags:
 *       - Cotizacion
 *     summary: Obtiene los detalles de una cotización por su ID de administrador.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cotización (admin_id)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la cotización encontrados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (show)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 data:
 *                   $ref: '#/components/schemas/Cotizacion'
 *                   description: Objeto de la cotización encontrada
 *       404:
 *         description: Cotización no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (error)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje de error
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                 data:
 *                   type: null
 *                   description: Datos nulos
 */
  public async show({response, params}: HttpContextContract) {
    const id = params.id;

    const cotizac: any = await Cotizacion.query()
      .where("admin_id", id)
      .first();

    if (cotizac) {
      return response.json({
        type: "show",
        title: "Enseñar recurso",
        messsage: "El recurso fue encontrado exitosamente",
        data: cotizac,
      });
    } else {
      return response.status(404).json({
        type: "error",
        title: "Error de cliente",
        message: "El id de la cotizacion no fue encontrado " + id,
        data: cotizac,
      });
    }  
  }

/**
 * @swagger
 * /api/cotizacion/{id}:
 *   put:
 *     tags:
 *       - Cotizacion
 *     summary: Actualiza una cotización existente.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cotización a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: integer
 *                 description: ID del cliente asociado a la cotización
 *               origen_id:
 *                 type: integer
 *                 description: ID del origen de la cotización
 *               destino_id:
 *                 type: integer
 *                 description: ID del destino de la cotización
 *               categoria:
 *                 type: string
 *                 description: Categoría de la cotización
 *               precio:
 *                 type: number
 *                 description: Precio de la cotización
 *               folio:
 *                 type: string
 *                 description: Folio de la cotización
 *               aprobada:
 *                 type: boolean
 *                 description: Indica si la cotización está aprobada
 *               codigo_verificacion:
 *                 type: string
 *                 description: Código de verificación de la cotización
 *               INE:
 *                 type: string
 *                 description: Identificación oficial del cliente
 *             required:
 *               - cliente_id
 *               - origen_id
 *               - destino_id
 *               - categoria
 *               - precio
 *               - folio
 *               - aprobada
 *               - codigo_verificacion
 *               - INE
 *     responses:
 *       200:
 *         description: Cotización actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (Exitoso)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 data:
 *                   $ref: '#/components/schemas/Cotizacion'
 *                   description: Objeto de la cotización actualizada
 *       404:
 *         description: Cotización no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error
 */
  public async update({response, request, params}: HttpContextContract) {
    const cuerpo = request.all();
    const updateCotizacion = await Cotizacion.query()
      .whereNotNull("id")
      .whereNull("deleted_at")
      .where("id", params.id)
      .first();

    if (updateCotizacion) {
      updateCotizacion.cliente_id= cuerpo["cliente_id"];
      updateCotizacion.origen_id = cuerpo["origen_id"];
      updateCotizacion.destino_id = cuerpo["destino_id"];
      updateCotizacion.categoria = cuerpo["categoria"];
      updateCotizacion.precio = cuerpo["precio"];
      updateCotizacion.folio = cuerpo["folio"];
      updateCotizacion.aprobada = cuerpo["aprobada"];
      updateCotizacion.codigo_verificacion = cuerpo["codigo_verificacion"];
      updateCotizacion.INE = cuerpo["INE"];

      await updateCotizacion.save();
      response.status(200).json({
        type: "Exitoso",
        title: "Actualizacion exitosa",
        message: "La cotizacion fue actualizado exitosamente",
        data: updateCotizacion,
      });
    } else {
      response.status(404).send({ error: "cotizacion no encontrada" });
    }
  }

/**
 * @swagger
 * /api/cotizacion/{id}:
 *   delete:
 *     tags:
 *       - Cotizacion
 *     summary: Elimina una cotización por su ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cotización a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cotización eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (Exitoso)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                 data:
 *                   type: null
 *                   description: Datos nulos
 *       404:
 *         description: Cotización no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   description: Tipo de mensaje (error)
 *                 title:
 *                   type: string
 *                   description: Título del mensaje de error
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *                 data:
 *                   type: null
 *                   description: Datos nulos
 */
  public async destroy({params,response}: HttpContextContract) {
    const deleteCoti = await Cotizacion.query()
    .whereNotNull("id")
    .whereNull("deleted_at")
    .where("id", params.id)
    .first();

  if (deleteCoti) {
    deleteCoti.delete();
    response.status(200).json({
      type: "Exitoso",
      title: "recurso eliminado",
      message: "La cotizacion fue eliminada exitosamente",
      data: null,
    });
  } else {
    response.status(404).json({
      type: "error",
      title: "La cotizacion no fue encontrado",
      message: "La cotizacion no fue econtrado",
      data: null,
    });
  }
  }

/**
 * @swagger
 * /api/cotizacion/sendSms/{id}:
 *   post:
 *     tags:
 *       - Cotizacion
 *     summary: Send SMS
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the cotizacion to send SMS to
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sms:
 *                 type: string
 *                 example: Your message here
 *     responses:
 *       200:
 *         description: The SMS was sent successfully.
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
 *                   example: Recurso ensñado
 *                 message:
 *                   type: string
 *                   example: El mensaje fue enviado con exito
 *                 data:
 *                   type: object
 *                   properties:
 *                     person:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         cliente_id:
 *                           type: integer
 *                           example: 123456789
 *                     sms:
 *                       type: object
 *                       properties:
 *                         sms:
 *                           type: string
 *                           example: Your message here
 *       404:
 *         description: Cotizacion not found.
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
 *                   example: client error
 *                 message:
 *                   type: string
 *                   example: Id no encontrado 1
 *       409:
 *         description: Conflict, cannot send empty message.
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
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: No se pudo enviar mensaje vacio
 */
  public async sendSMS({ request, response, params }: HttpContextContract) {
    try {
      const id = params.id;

      const coti = await Cliente.query()
        .where("cliente_id", id)
        .whereNull("deleted_at")
        .first();
        
      const sms = request.only(["sms"]);
      
      if (!coti) {
        return response.status(404).send({
          type: "error",
          title: "client error",
          message: "Id no encontrado " + id,
        });
      }

      const accountSID = Env.get("TWILIO_ACCOUNT_SID");
      const authToken = Env.get("TWILIO_AUTH_TOKEN");
      const client = require("twilio")(accountSID, authToken);

      if (sms.sms == null) {
        return response.status(409).send({
          type: "error",
          title: "error ",
          message: "No se pudo enviar mensaje vacio",
        });
      }

      const codigo = await this.generarCodigo();

      await client.messages.create({
        body: "Tu codigo es: " + codigo,
        from: Env.get("TWILIO_FROM_NUMBER"),
        to: `+528180919984`,
      });

      return response.status(200).send({
        type: "success",
        title: "Recurso ensñado",
        message: "El mensaje fue enviado con exito"
      });
    } catch (error) {
      return response.json({
        e: error.message,
      });
    }
  }


public async generarCodigo() {
  let code: string = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  code += '-';

  for (let i = 0; i < 3; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

}
