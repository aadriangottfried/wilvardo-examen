import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'

/**
 * Modelo para representar un destino en la base de datos.
 *
 * @swagger
 * components:
 *   schemas:
 *     Destino:
 *       type: object
 *       properties:
 *         destino_id:
 *           type: number
 *           description: Identificador único del destino.
 *         codigo_postal:
 *           type: string
 *           description: Código postal del destino.
 *         pais:
 *           type: string
 *           description: País del destino.
 *         ciudad:
 *           type: string
 *           description: Ciudad del destino.
 *         estado:
 *           type: string
 *           description: Estado del destino.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del destino.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del destino.
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de marcado como eliminado del destino (borrado suave).
 */
export default class Destino extends compose (BaseModel,SoftDeletes ){
  public static table = 'Destinos'

  @column({ isPrimary: true })
  public destino_id: number

  @column()
  public codigo_postal: string

  @column()
  public pais: string

  @column()
  public ciudad: string

  @column()
  public estado: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @column.dateTime({})
  public deleted_at: DateTime
}
