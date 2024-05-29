import { UsersList } from "../UsersList/UsersList"
import "./Chat.css"
import { Message } from "../Messages/Message";

export const Chat = () => {
    return (
        <div className="page">
            <div className="column column-left">
                <UsersList fieldName="firstname" secondFieldName="lastname"></UsersList>
            </div>
            <div className="column column-right column-reversed">
                <Message></Message>
            </div>
        </div>
    )
}