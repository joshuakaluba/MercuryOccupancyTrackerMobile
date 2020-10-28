import { AsyncStorage, Platform } from 'react-native';
import 'react-native-get-random-values';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models';
import { PlatformEnum, StorageKeysEnum } from '../enums';
import { Config } from '../constants';


export class UserService {

    public async getUser(): Promise<User> {
        let user: User = { id: '' };

        let userId: string | null = await AsyncStorage.getItem(StorageKeysEnum.USER_KEY);
        if (userId !== null) {
            user.id = userId;
        } else {
            userId = uuidv4();
            await AsyncStorage.setItem(StorageKeysEnum.USER_KEY, userId || '');

            user.id = userId || '';
            user.platform = Platform.OS === 'ios' ? PlatformEnum.IOS : PlatformEnum.ANDROID;

            await this.createUser(user);
        }
        return user;
    }

    private async createUser(user: User): Promise<void> {
        const apiUrl = `${Config.serverUrl}/Users/Create`;
        const body = JSON.stringify(user);

        const response = await fetch(apiUrl, {
            method: "post",
            body,
            headers: {
                "Content-Type": "application/json"
            }
        });

        const json = await response.json();

        if (response.status != 200) {
            throw new Error(json.message ? json.message : 'Unable to create session');
        }

        return json;
    }
}