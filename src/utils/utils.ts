import { Helpers } from "./helpers"

export class Utils extends Helpers {
    static isJSON(str:string) : boolean{
        try {
            JSON.parse(str)
            return true
        } catch (error) {
            return false
        }
      }
}