module.exports = {
    name: 'emotes',
    aliases: [],
    usage: 'emotes [user]',
    description: 'See the emojis that a user has',
    async execute(message, args, config, fs) {
        if(args.length == 1){
        }
    },
};

async function updateAvailableEmotes(message, emotes, fs){
    let emotes = JSON.parse(fs.readFileSync('./data/verified.json'))
    if(message.member.roles.cache.has(config.tpPlus_role) && !emotes.users.unlocked_emotes.includes('★')){
        emotes.users.unlocked_emotes.push('★')
    }
    if(message.member.roles.cache.has(config.tpPlus_role) && message.member.roles.cache.has(config.subFour_role) && !emotes.users.unlocked_emotes.includes('⭐')){
        emotes.users.unlocked_emotes.push('⭐')
    }
}