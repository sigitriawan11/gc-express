import ProfileModel from '../../model/profile-model';
import { logout } from './logout';
import { SiginIn } from './signin';
export class AuthService {
    static async SiginIn(param: any) : Promise<any> {
        return await SiginIn(param)
    }
    static async logout(param: any) {
        await logout(param)
    }
    static async me(id_profile: string) {
        return await ProfileModel.findOrFail({
            where: {
                id: id_profile
            }
        })
    }
}