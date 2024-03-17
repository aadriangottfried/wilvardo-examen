import { DateTime } from 'luxon'
import { BaseModel, column} from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'


/**
 * Modelo para representar un administrador en la base de datos.
 *
 * @swagger
 * components:
 *   schemas:
 *     Administrador:
 *       type: object
 *       properties:
 *         admin_id:
 *           type: number
 *           description: Identificador único del administrador.
 *         nombre:
 *           type: string
 *           description: Nombre del administrador.
 *         apellido:
 *           type: string
 *           description: Apellido del administrador.
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del administrador.
 *         contraseña:
 *           type: string
 *           description: Contraseña del administrador.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del administrador.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del administrador.
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de marcado como eliminado del administrador (borrado suave).
 */
export default class Administrador extends compose( BaseModel, SoftDeletes) {
  public static table='Administradores'

  @column({ isPrimary: true })
  public admin_id: number

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public email: string

  @column()
  public contrasena: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @column.dateTime({})
  public deleted_at: DateTime

}
