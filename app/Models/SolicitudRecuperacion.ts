import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class SolicitudRecuperacion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public administrador_id: number

  @column()
  public codigo_verificacion: string

  @column()
  public utilizado: boolean

  @column.dateTime({ autoCreate: true })
  public created_At: DateTime

  @column.dateTime({})
  public expariesAt: DateTime
}
