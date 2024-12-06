import 'dotenv/config'
import axios from 'axios'
import express from 'express'
import cors from 'cors'

async function sendMessage(text) {
    const url = `https://api.telegram.org/bot${tg.token}/sendMessage` // The url to request

    const obj = {
        chat_id: tg.chat_id, // Telegram chat id
        text: text // The text to send
    };

    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    });
}

let tg = {
    token: process.env.tg_token, // Your bot's token that got from @BotFather
    chat_id: process.env.chat_id // The user's(that you want to send a message) telegram chat id
}


const access_token = process.env.access_token
const domain = process.env?.domain ? process.env?.domain : "agoi_sochi"

let LAST_ID = process.env.last_id

async function getStates() {

    let states = []

    const response = await axios.post('https://api.vk.com/method/wall.get', {
        domain: domain,
        access_token: access_token,
        v: "5.199"
    }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    )

    for (let element of response?.data?.response?.items) {

        const description = element?.text

        let state = element?.attachments.find((el) => el?.type == "link")
        if (state) {

            let link = state?.link
            states.push({
                title: link?.title,
                url: link?.url,
                photo: link?.photo?.orig_photo?.url,
                description: description,
                id: element?.id
            })
        }
    }

    return states

}

async function sendStates() {
    let all_states = await getStates()

    all_states = all_states.sort((a,b) => a?.id - b?.id)

    for(let state of all_states){

        if(state?.id > +LAST_ID){
            await sendMessage(state?.description)
            await sendMessage(state?.url)
            LAST_ID = state?.id
        }
    }
}


// MAIN

const port = process.env?.port ? process.env?.port : 3000

setInterval(async () => {
    await sendStates()
}, process.env.timout)

const app = express()

app.use(cors())

app.get('/', async (req, res) => {
    res.json(+LAST_ID)
})

app.listen(port, () => {
    console.log(`Backend for Legenda BOT Sender states listening on port ${port}`)
})