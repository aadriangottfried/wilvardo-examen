import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'

export default class Origen extends compose (BaseModel, SoftDeletes) {
  public static table = 'origenes'

  @column({ isPrimary: true })
  public id: number

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

  @column.dateTime({})
  public deleted_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
