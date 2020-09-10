import * as express from 'express';
import * as Sequelize from 'sequelize';
import Room from '../models/Room';
import Chatting from '../models/Chatting';
import Participant from '../models/Participant';
import { CreateRoomRequest, RoomListResponse } from '../types/chat';

const router = express.Router();

router.post("/room/create", async(req, res) => {
    const { type, room_name, identifier, participant } = req.body as CreateRoomRequest;
    try {
        const findRoom = await Room.findOne({
            where: { identifier },
        });
        if(findRoom) {
            const data = {
                room_id: findRoom.id,
                identifier: findRoom.identifier,
                type: findRoom.type,
                room_name,
                last_chat: findRoom.last_chat,
                updatedAt: findRoom.updatedAt,
            };
            return res.json({
                data,
                msg: "방이 이미 존재합니다."
            })
        }
        else{
            const room = await Room.create({
                type,
                identifier,
                last_chat: ""
            });
            await participant.forEach(person => {
                Participant.create({
                    user_id: person.id,
                    room_id: room.id,
                    room_name
                })
            })
            const data = {
                room_id: room.id,
                identifier: room.identifier,
                type: room.type,
                room_name,
                last_chat: room.last_chat,
                updatedAt: room.updatedAt,
            };
            return res.json({
                data,
                msg: "채팅방이 만들어졌습니다."
            })
        }
    } catch (err) {
        return res.status(400).json({
            data: false,
            msg: "채팅방을 추가하지 못했습니다."
        })
    }
})

router.get("/room", async(req,res) => {
    const room_id: number = Number(req.query.room_id);
    if(!room_id){
        throw new Error();
    }
    const cursor: number = Number(req.query.cursor) || 9999999999;
    const offset: number = 15 * (Number(req.query.offset) - 1) || 0;
    try {
        const chatting = await Chatting.findAll({
            attributes: ["id", "room_id", "send_user_id", "message", "createdAt"],
            where:{
                id: { [Sequelize.Op.lt]: cursor },
                room_id
            },
            order: [["id", "DESC"]],
            limit: 15,
        })

        return res.json({
            data: chatting.reverse(),
            msg: "채팅 목록을 불러왔습니다."
        })
    } catch (err) {
        return res.status(400).json({
            data: false,
            msg: "채팅 목록을 불러오지 못했습니다."
        })
    }
})

router.get("/roomList/:user_id", async(req,res) =>{
    const user_id = req.params.user_id;
    try {
        const roomData = await Participant.findAll({
            attributes: ["room_id", "room_name"],
            include: [{
                model: Room,
                attributes: ["identifier", "type", "last_chat", "updatedAt"],
                required: true,
                on: Sequelize.where(Sequelize.col("Participant.room_id"),"=",Sequelize.col("Room.id")),
                where: {
                    last_chat: {
                        [Sequelize.Op.ne]: "",
                    }
                }
            }],
            where: { 
                user_id,
             }
        })
        
        const response: Array<RoomListResponse> = await Promise.all(
            roomData.map(async(val) => {
                const participant = await Participant.findAll({
                    attributes: ["user_id"],
                    where:{room_id: val.room_id}
                }).reduce((acc, curr) => {
                    acc.push(curr.user_id);
                    return acc;
                },[] as Array<number>);

                const roomRow = val.Room?.toJSON() as Room;
                return {
                    room_id: val.room_id,
                    room_name: val.room_name,
                    type: roomRow.type,
                    identifier: roomRow.identifier,
                    participant,
                    last_chat: roomRow.last_chat,
                    updatedAt: roomRow.updatedAt
                };
            })
          )
        return res.json({
            data: response,
            msg: "채팅방 리스트 불러옴"
        })
    } catch (err) {
        return res.status(400).json({
            data: false,
            msg: "채팅방 리스트를 불러오지 못했습니다."
        })
    }
})
export default router;