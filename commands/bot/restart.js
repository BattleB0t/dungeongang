
module.exports = {
    name: 'restart',
    aliases: [],
    usage: '-restart',
    description: '(bot owner only)',
    async execute() {
        let message = messageParam, args = argsParam, config = configParam, fs = fsParam
        if (isInRestart) return;
        if (!message.member.isOwner()) return;
        message.channel.send('Restarting...').then(m => {
            isInRestart = true
            setTimeout(function () {
                process.on("exit", function () {
                    require("child_process").spawn(process.argv.shift(), process.argv, {
                        cwd: process.cwd(),
                        detached : true,
                        stdio: "inherit"
                    });
                });
                process.exit();
            }, 2000);
        });
    }
}