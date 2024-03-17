import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'


/**
 * Modelo para representar un cliente en la base de datos.
 *
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         cliente_id:
 *           type: number
 *           description: Identificador único del cliente.
 *         nombre:
 *           type: string
 *           description: Nombre del cliente.
 *         apellido:
 *           type: string
 *           description: Apellido del cliente.
 *         telefono:
 *           type: string
 *           description: Número de teléfono del cliente.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del cliente.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del cliente.
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de marcado como eliminado del cliente (borrado suave).
 */
export default class Cliente extends compose (BaseModel,SoftDeletes) {
  public static table = 'clientes'
  
  @column({ isPrimary: true })
  public cliente_id: number

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public telefono: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @column.dateTime({})
  public deleted_at: DateTime
}
