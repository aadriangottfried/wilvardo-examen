import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cotizacion from 'App/Models/Cotizacion';
import Env from '@ioc:Adonis/Core/Env'
import Cliente from 'App/Models/Cliente';
import Destino from 'App/Models/Destino';
import codigo_cotizacion from 'App/Models/codigo_cotizacion';
import Mail from '@ioc:Adonis/Addons/Mail';

export default class CotizacionesController {

  /**
   * @swagger
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
  public async index({ response }: HttpContextContract) {
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
   * /api/cotizacion/{destino_id}:
   *   post:
   *     tags:
   *       - Cotizacion
   *     summary: Crear una nueva cotización
   *     description: Crea una nueva cotización con los datos proporcionados.
   *     parameters:
   *       - in: path
   *         name: destino_id
   *         required: true
   *         description: ID del destino.
   *         schema:
   *           type: integer 
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               codigo_verificacion:
   *                 type: string
   *                 description: Código de verificación del cliente.
   *               categoria:
   *                 type: string
   *                 enum: [primera_clase, clase_media, comercial]
   *                 description: Categoría de la cotización.
   *               ine:
   *                 type: string
   *                 format: binary
   *                 description: Imagen de la INE del cliente.
   *     responses:
   *       '201':
   *         description: Cotización creada exitosamente.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 type:
   *                   type: string
   *                   example: creada
   *                 title:
   *                   type: string
   *                   example: Recurso creado
   *                 message:
   *                   type: string
   *                   example: El recurso fue creado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Cotizacion'
   *       '409':
   *         description: Error en la solicitud o datos proporcionados.
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
   *                   example: El cliente no se encuentra
   *       '500':
   *         description: Error interno del servidor.
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
   *                   example: error al crear una cotizacion
   *                 message:
   *                   type: string
   *                   example: el recurso no fue creado exitosamente
   *                 error:
   *                   type: string
   *                   example: Mensaje de error detallado
   */
  public async store({ response, request, params }: HttpContextContract) {
    try {
      const cotizacion = new Cotizacion();
      const id_cp = params.destino_id;

      cotizacion.codigo_verificacion = request.input("codigo_verificacion");
      const cliente = await codigo_cotizacion.query().where('codigo_verificacion', cotizacion.codigo_verificacion).first()

      if (!cliente) {
        return response.status(409).json({
          type: "error",
          title: "Error de cliente",
          message: "El cliente no se encuentra",
        });
      }

      cotizacion.codigo_verificacion = cliente.codigo_verificacion;
      cotizacion.cliente_id = cliente.cliente_id;

      const cp = await Destino.query().where('destino_id', id_cp).first();

      if (!cp) {
        return response.status(409).json({
          type: "error",
          title: "Error de cliente",
          message: "El destino no se encuentra",
        });
      }

      cotizacion.destino_id = cp.destino_id;

      // Calcular total
      let total = cp.precio_km * cp.km;
      let porcentaje = 0;

      if (request.input('categoria') == 'primera_clase') {
        cotizacion.categoria = 'primera_clase';
        porcentaje = 25;
        total = (porcentaje / 100) * total;
      } else if (request.input('categoria') == 'clase_media') {
        cotizacion.categoria = 'clase_media';
        porcentaje = 10;
        total = (porcentaje / 100) * total;
      } else if (request.input('categoria') == 'comercial') {
        cotizacion.categoria = 'comercial';
        porcentaje = 0;
      }

      cotizacion.precio = total;

      const ine = request.file('ine');

      if (!ine) {
        return response.status(409).json({
          type: "error",
          title: "Error de cliente",
          message: "El archivo no fue encontrado",
        });
      }

      await ine.move('uploads', {
        name: `${cotizacion.codigo_verificacion}.jpg`,
      });

      cotizacion.INE = `uploads/${cotizacion.codigo_verificacion}.jpg`;

      const randomDigits = Math.floor(Math.random() * 100000);
      const folio = `FO-A-${randomDigits.toString().padStart(5, '0')}`;
      cotizacion.folio = folio;

      cotizacion.porcentaje_categoria = porcentaje;

      await cotizacion.save();
      return response.status(201).json({
        type: "creada",
        title: "Recurso creado",
        message: "El recurso fue creado exitosamente",
        data: cotizacion,
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
  public async show({ response, params }: HttpContextContract) {
    const id = params.id;

    const cotizac: any = await Cotizacion.query()
      .where("cotizacion_id", id)
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
   *     summary: Actualizar una cotización existente
   *     description: Actualiza una cotización existente con los datos proporcionados.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID de la cotización a actualizar.
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               codigo_verificacion:
   *                 type: string
   *                 description: Código de verificación del cliente.
   *               codigo_postal:
   *                 type: string
   *                 description: Código postal del destino.
   *               categoria:
   *                 type: string
   *                 enum: [primera_clase, clase_media, comercial]
   *                 description: Categoría de la cotización.
   *               ine:
   *                 type: string
   *                 format: binary
   *                 description: Imagen de la INE del cliente.
   *     responses:
   *       '200':
   *         description: Cotización actualizada exitosamente.
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
   *                   example: Recurso actualizado
   *                 message:
   *                   type: string
   *                   example: El recurso fue actualizado exitosamente
   *                 data:
   *                   $ref: '#/components/schemas/Cotizacion'
   *       '404':
   *         description: La cotización o alguno de los recursos relacionados no fueron encontrados.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: La cotizacion no fue encontrada
   *       '500':
   *         description: Error interno del servidor.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 e:
   *                   type: string
   *                   example: Mensaje de error detallado
   */
  public async update({ response, request, params }: HttpContextContract) {
    try {
      const cotizacion_id = params.id;
      const cotizacion = await Cotizacion.query().where("cotizacion_id", cotizacion_id).first();

      if (!cotizacion) {
        return response.status(404).json({
          error: "La cotizacion no fue encontrada",
        });
      }

      const cuerpo = request.all();
      const updateCotizacion = await Cotizacion.query()
        .whereNull("deleted_at")
        .where("cotizacion_id", cotizacion_id)
        .first();

      if (updateCotizacion) {
        updateCotizacion.codigo_verificacion = cuerpo.codigo_verificacion;
        const cliente = await codigo_cotizacion.query().where('codigo_verificacion', updateCotizacion.codigo_verificacion).first()
        if (!cliente) {
          return response.status(404).json({
            error: "El cliente no fue encontrado",
          });
        }

        const cp = await Destino.query().where('codigo_postal', cuerpo.codigo_postal).first();
        console.log(cp)
        console.log(cuerpo.codigo_postal)
        if (!cp) {
          return response.status(404).json({
            error: "El destino no fue encontrado",
          });
        }

        updateCotizacion.destino_id = cp.destino_id;

        // Calcular total
        let total = cp.precio_km * cp.km;
        let porcentaje = 0;

        if (cuerpo.categoria == 'primera_clase') {
          updateCotizacion.categoria = 'primera_clase';
          porcentaje = 25;
          total = (porcentaje / 100) * total;
        } else if (cuerpo.categoria == 'clase_media') {
          updateCotizacion.categoria = 'clase_media';
          porcentaje = 10;
          total = (porcentaje / 100) * total;
        } else if (cuerpo.categoria == 'comercial') {
          updateCotizacion.categoria = 'comercial';
          porcentaje = 0;
        }

        updateCotizacion.precio = total;

        const ine = request.file('ine');

        if (!ine) {
          return response.status(404).json({
            error: "El archivo no fue encontrado",
          });
        }

        await ine.move('uploads', {
          name: `${updateCotizacion.codigo_verificacion}.jpg`,
        });

        updateCotizacion.INE = `uploads/${updateCotizacion.codigo_verificacion}.jpg`;

        updateCotizacion.porcentaje_categoria = porcentaje;

        await updateCotizacion.save();
        return response.status(200).json({
          type: "Exitoso",
          title: "Recurso actualizado",
          message: "El recurso fue actualizado exitosamente",
          data: updateCotizacion,
        });

      }
    } catch (error) {
      return response.status(500).json({
        e: error.message,
      });
    }
  }

  /**
 * @swagger
 * /api/cotizaciones/{id}:
 *   delete:
 *     tags:
 *       - Cotizacion
 *     summary: Eliminar una cotización existente
 *     description: Elimina una cotización existente según su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la cotización a eliminar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_verificacion:
 *                 type: string
 *                 description: Código de verificación del cliente.
 *     responses:
 *       '200':
 *         description: Cotización eliminada exitosamente.
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
 *                   example: La cotizacion fue eliminada exitosamente
 *                 data:
 *                   type: null
 *       '404':
 *         description: La cotización o alguno de los recursos relacionados no fueron encontrados.
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
 *                   example: El cliente no fue encontrado
 *                 data:
 *                   type: null
 */
  public async destroy({ params, response, request }: HttpContextContract) {
    const id = params.id;
    const codigo = request.all();

    const codigo_verificacion = await codigo_cotizacion.query().where('codigo_verificacion', codigo.codigo_verificacion).first();

    if (!codigo_verificacion) {
      return response.status(404).json({
        type: "error",
        title: "Error de cliente",
        message: "El cliente no fue encontrado",
      });
    }

    const deleteCoti = await Cotizacion.query()
      .whereNotNull("id")
      .whereNull("deleted_at")
      .where("id", id)
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
   * /api/cotizacion/send-sms/{id}:
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
  public async sendSMS({ response, params }: HttpContextContract) {
    try {
      const id = params.id;

      const coti = await Cliente.query()
        .where("cliente_id", id)
        .whereNull("deleted_at")
        .first();

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

      const codigo = await this.generarCodigo();

      const a = new codigo_cotizacion();
      a.codigo_verificacion = codigo;
      a.cliente_id = coti.cliente_id;

      await a.save();
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

    for (let i = 0; i < 3; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return code;
  }
  /**
 * @swagger
 * /api/cotizacion/{cotizacion}/aceptacion:
 *   post:
 *     summary: Aceptar una cotización
 *     description: Acepta una cotización especificada por su ID.
 *     tags:
 *       - Cotización
 *     parameters:
 *       - in: path
 *         name: cotizacion
 *         required: true
 *         description: ID de la cotización a aceptar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_verificacion:
 *                 type: string
 *                 description: Código de verificación del cliente
 *     responses:
 *       200:
 *         description: Cotización aceptada exitosamente
 *         schema:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: Exitoso
 *               description: Tipo de respuesta
 *             title:
 *               type: string
 *               example: Recurso actualizado
 *               description: Título de la respuesta
 *             message:
 *               type: string
 *               example: El recurso fue actualizado exitosamente
 *               description: Mensaje de éxito
 *             data:
 *               $ref: '#/definitions/Cotizacion'
 *       404:
 *         description: Error si la cotización o el código de verificación no se encuentra
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Descripción detallada del error
 *       default:
 *         description: Error interno del servidor al procesar la solicitud
 *         schema:
 *           type: object
 *           properties:
 *             e:
 *               type: string
 *               description: Descripción del error interno
 */
  public async aceptacion({ response, params, request }: HttpContextContract) {
    try {
      const id = params.cotizacion;
      const codigo = request.all();
      const cotizacion = await Cotizacion.query().where('cotizacion_id', id).first();
      if (!cotizacion) {
        return response.status(404).json({
          error: "La cotizacion no fue encontrada",
        });
      }
      const cliene = await Cliente.query().where('cliente_id', cotizacion.cliente_id).first();

      if (!cliene) {
        return response.status(404).json({
          error: "El cliente no fue encontrado",
        });
      }

      const destino = await Destino.query().where('destino_id', cotizacion.destino_id).first();

      if (!destino) {
        return response.status(404).json({
          error: "El destino no fue encontrado",
        });
      }

      const codigo_verificacion = await codigo_cotizacion.query().where('codigo_verificacion', codigo.codigo_verificacion).first();

      if (!codigo_verificacion) {
        return response.status(404).json({
          error: "El codigo de verificacion no fue encontrado",
        });
      }

      codigo_verificacion.estado = true;
      await codigo_verificacion.save();



      cotizacion.aprobada = 'aceptada';

      await Mail.send((message) => {
        message
          .from(Env.get('SMTP_USERNAME'))
          .to('wilvardo@gmail.com')
          .subject('Cotización aceptada')
          .htmlView("emails/cotizacion", {
            folio: cotizacion.folio,
            precio: cotizacion.precio,
            categoria: cotizacion.categoria,
            aprobada: cotizacion.aprobada,
            codigo_verificacion: cotizacion.codigo_verificacion,
            destino: destino.estado,
            total_km: destino.km,
            precio_km: destino.precio_km,
            porcentaje_categoria: cotizacion.porcentaje_categoria,
            cliente: cliene.nombre,
          })
          .attach(cotizacion.INE)
      });

      await cotizacion.save();
      return response.status(200).json({
        type: "Exitoso",
        title: "Recurso actualizado",
        message: "El recurso fue actualizado exitosamente",
        data: cotizacion,
      });
    } catch (error) {
      return response.json({
        e: error.message,
      });
    }
  }
  /**
 * @swagger
 * /api/cotizacion/{cotizacion}/rechazo:
 *   post:
 *     summary: Rechazar una cotización
 *     description: Rechaza una cotización especificada por su ID.
 *     tags:
 *       - Cotización
 *     parameters:
 *       - in: path
 *         name: cotizacion
 *         required: true
 *         description: ID de la cotización a rechazar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo_verificacion:
 *                 type: string
 *                 description: Código de verificación del cliente
 *     responses:
 *       200:
 *         description: Cotización rechazada exitosamente
 *         schema:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               example: Exitoso
 *               description: Tipo de respuesta
 *             title:
 *               type: string
 *               example: Recurso actualizado
 *               description: Título de la respuesta
 *             message:
 *               type: string
 *               example: El recurso fue actualizado exitosamente
 *               description: Mensaje de éxito
 *             data:
 *               $ref: '#/definitions/Cotizacion'
 *       404:
 *         description: Error si la cotización, el cliente, el destino o el código de verificación no se encuentra
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               description: Descripción detallada del error
 *       default:
 *         description: Error interno del servidor al procesar la solicitud
 *         schema:
 *           type: object
 *           properties:
 *             e:
 *               type: string
 *               description: Descripción del error interno
 */
  public async rechazo({ response, params, request }: HttpContextContract) {
    try {
      const id = params.cotizacion;
      const codigo = request.all();
      const cotizacion = await Cotizacion.query().where('cotizacion_id', id).first();
      if (!cotizacion) {
        return response.status(404).json({
          error: "La cotizacion no fue encontrada",
        });
      }
      const cliene = await Cliente.query().where('cliente_id', cotizacion.cliente_id).first();

      if (!cliene) {
        return response.status(404).json({
          error: "El cliente no fue encontrado",
        });
      }

      const destino = await Destino.query().where('destino_id', cotizacion.destino_id).first();

      if (!destino) {
        return response.status(404).json({
          error: "El destino no fue encontrado",
        });
      }

      const codigo_verificacion = await codigo_cotizacion.query().where('codigo_verificacion', codigo.codigo_verificacion).first();

      if (!codigo_verificacion) {
        return response.status(404).json({
          error: "El codigo de verificacion no fue encontrado",
        });
      }

      codigo_verificacion.estado = false;
      await codigo_verificacion.save();

      cotizacion.aprobada = 'canecalada';

      await Mail.send((message) => {
        message
          .from(Env.get('SMTP_USERNAME'))
          .subject('Cotización rechazada')
          .to('wilvardo@gmail.com')
          .htmlView("emails/cotizacion", {
            folio: cotizacion.folio,
            precio: cotizacion.precio,
            categoria: cotizacion.categoria,
            aprobada: cotizacion.aprobada,
            codigo_verificacion: cotizacion.codigo_verificacion,
            destino: destino.estado,
            total_km: destino.km,
            precio_km: destino.precio_km,
            porcentaje_categoria: cotizacion.porcentaje_categoria,
            cliente: cliene.nombre,
          })
          .attach(cotizacion.INE)
      });

      await cotizacion.save();
      return response.status(200).json({
        type: "Exitoso",
        title: "Recurso actualizado",
        message: "El recurso fue actualizado exitosamente",
        data: cotizacion,
      });
    } catch (error) {
      return response.json({
        e: error.message,
      });
    }
  }
}
