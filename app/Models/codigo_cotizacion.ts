import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class codigo_cotizacion extends BaseModel {
  public static table = 'codigo_cotizacion'

  @column({ isPrimary: true })
  public id: number

  @column()
  public cliente_id: number

  @column()
  public codigo_verificacion: string

  @column()
  public estado: boolean

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime
}