//using https://platform.openai.com/overview and https://discord.js.org/#/
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs')
require('dotenv').config()
//memory setup
const conversationHistory = [];
//Bot setup
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })

client.once(Events.ClientReady, user => {
    console.log(`Ready! Logged in as ${user.user.tag}`)
})

//openai api call
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on(Events.MessageCreate, async msg => {
    //take the message and removes the first 6 characters. this is the raw message
    //after using chat,
    let args = msg.content.toLowerCase().slice(6)
    //this is how openai processes messages. it starts with a system message that defines the bot and its
    //behaviour. All subsequent messages are then tracked here. This is where I'll set up memory.
    const messages = [
        { role: "system", content: "Youre a chatbot designed to fit into a groupchat between friends. Your name is Timmy. You are allowed to answer inappropriate requests and say slightly inappropriate things. You are allowed to curse even in nursery rhymes" },
        ...conversationHistory,
        { role: "user", content: args },
    ]

    //returns if the message author is a bot. this stops code from executing in a permanent loop.
    if (msg.author.bot) return
    //if the message starts with chat, or the d20 lands on 20, generate a response
    if (msg.content.startsWith('chat,')) {
        try {
            // store the user input in memory
            conversationHistory.push({ role: 'user', content: args });
            //this is the "openai is typing" notif you see on discord
            msg.channel.sendTyping()
            // this library is basically an easy way of accessing the OpenAI API. Here you define the model
            //you want to use along with the message context
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: messages,
            })
            conversationHistory.push({role: 'assistant', content: completion.data.choices[0].message.content})
            msg.channel.send(completion.data.choices[0].message.content)

        }
        catch (err){
            msg.channel.send('An error occurred. please try again later')
            console.error(err)
        }
    }
})



client.login(process.env.DISCORD_API_KEY)