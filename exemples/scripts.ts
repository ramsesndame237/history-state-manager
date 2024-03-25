import {History} from 'history-state-manager'

const state = [{username: "hector", name: 'victor', life: 122}, {
    username: "ramses",
    name: 'Ndame',
    life: 84
}, {username: "Blood", name: 'Becka', life: 213}, {username: "Other", name: 'Christofer', life: 10}]

const histories = new History()

histories.pushSync(state)

console.table(histories.get())

// Fonction pour mettre à jour la vie des utilisateurs
function updateLife(users: ({ name: string; life: number; username: string } | {
    name: string;
    life: number;
    username: string
} | { name: string; life: number; username: string } | { name: string; life: number; username: string })[]) {
    return users.map(user => ({
        ...user,
        life: user.life % 2 === 0 ? user.life : user.life - 1
    }));
}

// Appel de la fonction pour mettre à jour la vie des utilisateurs
const updatedState = updateLife(state);

console.log("this is the  new state", updatedState)

histories.pushSync(updatedState)

console.log("this is the undo histories", histories.undo().get())
console.log("this is the redo histories", histories.undo().redo())