import { User } from "@prisma/client";


function leaveRoom(userID:String | null, chatRoomUsers:User[]) {
    return chatRoomUsers.filter((user) => user.id != userID);
  }
  
export default leaveRoom;