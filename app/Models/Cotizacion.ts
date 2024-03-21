import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'


export default class Cotizacion extends compose (BaseModel, SoftDeletes) {
  public static table = 'cotizaciones'

  @column({ isPrimary: true })
  public cotizacion_id: number

  @column()
  public cliente_id: number

  @column()
  public destino_id: number

  @column()
  public categoria: string

  @column()
  public porcentaje_categoria: number

  @column()
  public precio: number

  @column()
  public folio: string

  @column()
  public aprobada: string

  @column()
  public codigo_verificacion: string

  @column()
  public INE: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({})
  public deleted_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
