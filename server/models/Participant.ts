import { Model } from 'sequelize';
import Room from './Room';

export default class Participant extends Model {
    public id!: number;
    public user_id!: number;
    public room_id!: number;
    public room_name!: string;
    
    public readonly Room?: Room;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}