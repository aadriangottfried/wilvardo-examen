import axios from "axios";
import Env from '@ioc:Adonis/Core/Env'

export default class CopoMexResources {

    public static async obtenerDestinos(codigo_postal: string) {
        try {
            const copomex = await axios.get(`https://api.copomex.com/query/info_cp/${codigo_postal}?type=simplified&token=${Env.get("COPOMEX_PRUEBA")}`);

            return {
                status: copomex.status,
                type: 'Exitoso',
                message: 'Recurso encontrado',
                cp: "Codigo Postal ",
                data: copomex.data
            }
        } catch (error) {
            return {
                type: 'error',
                cp: "Codigo Postal ",
                message: error.message,
                data: error.response.data
            }
        }
    }
}