const Discord = require('discord.js')
const client = new Discord.Client()
const {
    categoryName,
    channelName,
    testGuild,
    token
    } = require('./config.json')

let textIDs = new Discord.Collection()



client.on('ready', () => {
    console.log(`${client.user.tag} ready! Watching ${client.guilds.cache.size} guilds.`)
    client.user.setPresence({
      status: 'idle',
      activity: {
          name: 'You To Join Channel',
          type: 'WATCHING',
      }
  })


    client.guilds.cache.forEach(guild => {
        const addCategory = guild.channels.cache.find(channel => channel.name == `${categoryName}` && channel.type === "category")
        if (addCategory) {
            guild.channels.cache.forEach(channel => {
                if (channel.parentID === addCategory.id && channel.name !== `${channelName}` && channel.guild.id === `${testGuild}` && channel.deletable) channel.delete()
            })
        }
    })
})

client.on('voiceStateUpdate', (oldState, newState) => {
    // Only watch user moves
    if (oldState.channelID === newState.channelID) return

    const member = newState.member

    // Fetch Voice Category
    const addCategory = newState.guild.channels.cache.find(channel => channel.name == `${categoryName}` && channel.type === "category")

    // Fetch Create Channel channel
    const addChannel = newState.guild.channels.cache.find(channel => channel.name == `${channelName}` && channel.type === "voice")

    // Does it exist?
    if (!addChannel) return console.error('No Creation Channel Found')
    if (!addCategory) return console.error('No Creation Category Found')

    // Create new channel
    if (newState.channel == addChannel) {
        addChannel.guild.channels.create(member.user.username.toLowerCase(), {
            type: 'voice',
            parent: addCategory.id,
            permissionOverwrites: [{
                id: member.id,
                allow: ['MANAGE_CHANNELS', 'MANAGE_ROLES']
            }]
        }).then(channel => {
            newState.setChannel(channel)
            .then(c => {
                textIDs.set(channel.id, c.id)
            })
        }).catch(console.error)
    }

    // Don't delete add channel
    if (!oldState.channel || oldState.channel === addChannel) return

    // Remove empty channels
    if (oldState.channel.parent && oldState.channel.parent === addCategory && oldState.channel.members && oldState.channel.members.size === 0) {
        const textChannel = oldState.guild.channels.cache.get(textIDs.get(oldState.channel.id))
        if (textChannel) textChannel.delete().catch(console.error)
        oldState.channel.delete().catch(console.error)
        textIDs.delete(oldState.channel.id)
        return
    }

    if (oldState.channel.parent && oldState.channel.parent === addCategory && oldState.channel.members && oldState.channel.members.size > 0 && oldState.channel.name === member.user.username.toLowerCase()) {
        const newOwner = oldState.channel.members.random()
        oldState.channel.edit({
            name: newOwner.user.username.toLowerCase(),
            type: 'voice',
            parent: addCategory.id,
            permissionOverwrites: [{
                id: newOwner.id,
                allow: ['MANAGE_CHANNELS', 'MANAGE_ROLES']
            }]
        }).catch(console.error)
    }
    // ToDo 
    // ???
})

client.login(token).catch(console.error)
