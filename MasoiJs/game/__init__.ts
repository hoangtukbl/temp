import {AllowedMentionsTypes, ChannelType, EmbedBuilder, PermissionsBitField} from "discord.js";

const Bodyguard = require('./role/bodyguard');
const Seer = require('./role/seer');
const Villager = require('./role/villagers');
const Witch = require('./role/witch');
const Wolf = require('./role/wolf');
const Player = require('./role/player');
const {ActionRowBuilder, Events, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

export class Init {
    private listAttend: object[] = [];
    private listRole: string[] = ["bodyguard", "witch", "wolf", "wolf", "village", "village",
        "cursed", "hunter", "mayor", "wolf", "diviner", "village"];
    private listEmoji: string[] = ["ð", "ð¤ª", "ð¥", "ð", "ð¤£",
        "ð¡", "ð¥¶", "ð¤¢", "ð", "ð¤", "ð¤¡", "ð½", "â "];
    private listPlayer: any[] = [];
    private queueKill: any[] = [];
    private queueKillCertain: any[] = [];
    private queueRev: any[] = [];
    private killByWolf: string = '';
    bot: any;
    private protect: any;
    client: any;

    constructor(listPlayer: any, bot: any, client: any) {
        this.setListPlayer(listPlayer);
        this.bot = bot;
        this.client = client
    }

    setKillByWolf(idPlayer: string) {
        this.killByWolf = idPlayer;
    }

    getKillByWolf(idPlayer: string): string {
        return this.killByWolf;
    }


    setListPlayer(listAttend: any) {
        this.listAttend = listAttend;
    }

    command = async () => {
        await this.bot.reply("Hello, tui gá»­i tá»« ma sÃ³i");
    }

    setKillCertain(idPlayer: string) {
        this.queueKillCertain.push(idPlayer);
    }

    async setKillList(idPlayer: string) {
        await this.queueKill.push(idPlayer);
    }

    async setRevList(idPlayer: string) {
        await this.queueRev.push(idPlayer);
    }

    getListPlayer() {
        return this.listPlayer;
    }

    getPlayerLife() {
        const data = this.listPlayer.filter((each: any) => each.getState())
        return data;
    }

    addToQueueKill(idPlayer: string) {
        this.queueKill.push(idPlayer);
    }

    addToQueueRev(idPlayer: string) {
        this.queueRev.push(idPlayer);
    }

    async setProtected(protect: string) {
        if (protect !== this.protect) {
            console.log("Protected");
            this.protect = protect;
            return true;
        }
        return false;
    }

    getProtected() {
        return this.protect;
    }

    async handleKill() {
        if (this.queueKill.length > 0) {
            await this.queueKill.forEach((idPlayer: string) => {
                this.listPlayer.forEach((player: any) => {
                    if (idPlayer === player.getId() && idPlayer !== this.protect) {
                        player.setState(false);
                    }
                })
            })
        }
        if (this.queueKillCertain.length > 0) {
            await this.queueKillCertain.forEach((idPlayer: string) => {
                this.listPlayer.forEach((player: any) => {
                    if (idPlayer === player.getId()) {
                        player.setState(false);
                    }
                })
            })
        }
    }

    async handleRev() {
        await this.queueRev.forEach((idPlayer: any) => {
            this.listPlayer.forEach((player: any) => {
                if (idPlayer === player.getId()) {
                    player.setState(true);
                }
            })
        })
    }

    setRole = async () => {
        await this.listAttend.sort(() => Math.random() - 0.5);
        for (let i = 0; i < this.listAttend.length; i++) {
            const each: any = this.listRole[i];
            const player: any = this.listAttend[i];
            switch (each) {
                case 'witch':
                    this.listPlayer.push(await new Witch(player.name, player.id));
                    break;
                case 'village':
                    this.listPlayer.push(await new Villager(player.name, player.id));
                    break;
                case "bodyguard":
                    this.listPlayer.push(await new Bodyguard(player.name, player.id));
                    break;
                case 'wolf':
                    this.listPlayer.push(await new Wolf(player.name, player.id));
                    break;
                case 'seer':
                    this.listPlayer.push(await new Seer(player.name, player.id));
                    break;
            }
        }
        await this.listPlayer.sort(() => Math.random() - 0.5);
    }


    async findRole(role: string) {
        return await this.listPlayer.find(player => player.role === role);
    }


    getPlayerById(id: string): typeof Player {
        const player = this.listPlayer.filter(each => each.getId() === id);
        return player[0];
    }

    async countGood() {
        let quan = 0;
        await this.listPlayer.forEach(each => {
            if (each.getState() && each.getLegit()) {
                quan++;
            }
        })
        return quan;
    }

    async countEvil() {
        let quan = 0;
        await this.listPlayer.forEach(each => {
            if (each.getState() && !each.getLegit()) {
                quan++;
            }
        })
        return quan;
    }

    async clear() {
        this.queueRev = [];
        this.queueKill = [];
        this.queueKillCertain = [];
        this.killByWolf = '';
    }

    async checkFinish() {
        if (await this.countEvil() >= await this.countGood()) {
            return "Soi thang";
        } else if (await this.countEvil() === 0) {
            return "Dan thang";
        } else {
            return "Continue";
        }
    }

    sleepTime(second = 0) {
        return new Promise(resolve => setTimeout(resolve, second));
    }

    initSelectOption = async (agent: string) => {                               //Initialize selection menu
        const option: any[] = [];
        await this.listPlayer.forEach(each => {
            if (each.getState()) {
                option.push({label: each.getName().username, value: each.getId()})
            }
        })

        const row = await new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId(`select-by-${agent}`)
                .setPlaceholder('Choose Someone...')
                .addOptions(
                    option
                ),
            );
        return row;
    }

    async countDown(second: number = 0, message: any) {             // Function countdown
        // const msg = await this.bot.channel.send(`${message}: ${second}s`);
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(message)
            .setDescription(`${message}: ${second}s`);
        const msg = await this.bot.channel.send({embeds: [embed]});
        return new Promise(resolve => {
            let interval = setInterval(async () => {
                const newEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(message)
                    .setDescription(`${message}: ${second--}s`);
                await msg.edit({embeds: [newEmbed]});
                if (second < 0) {
                    resolve(clearInterval(interval));
                    const endEmbeed = new EmbedBuilder()
                        .setColor(0xD83C3E)
                        .setTitle("Háº¿t thá»i gian !!!")
                        .setDescription(`Háº¿t thá»i gian !!!`);
                    await msg.edit({embeds: [endEmbeed]});
                }
            }, 1000);
        })
    }


    async start() {
        const wolfList = this.listPlayer.filter((each: any) => each.getRole() === 'wolf');  // Find out all players are wolves
        const wolfIdList = wolfList.map((each: any) => each.getId());
        
        
        const wolfchannel = await this.bot.guild.channels.create({
            name: "newchannel",
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: '1028203246516437074',
                    deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                }
            ]
        })
        console.log(wolfchannel);
        wolfList.forEach((each:any)=>{
            //wolfchannel.permissionOverwrites
            // wolfchannel.permissionOverwrites(each.id,{VIEW_CHANNEL:true})
            console.log(each.id);
        });

    
        while (true) {
            this.checkFinish();
            // const players = this.listPlayer;
            //===================Bodyguard=======================
            const listProtected = await this.initSelectOption('guard');
            let playerRole = await this.findRole('bodyguard');
            // await this.client.users.fetch(playerRole.getId(), false)
            //     .then(async (user: any) => await user.send("Báº¡n lÃ  báº£o vá» ÄÃ³, hÃ£y vÃ o Äá» chá»n ngÆ°á»i Äá» báº£o vá» nÃ o"));
            await this.bot.channel.send({content: 'Báº¡n muá»n chá»n ai Äá» báº£o vá» ÄÃªm nay: ', components: [listProtected]});
            await this.countDown(10, "Thá»i gian bÃ¬nh chá»n cÃ²n láº¡i");

            //====================Wolf============================
            await this.bot.wolfchannel.send({content: 'Chá»n ngÆ°á»i Äá» giáº¿t ÄÃªm nay(sÃ³i)'});
            //const wolfList = this.listPlayer.filter(each => each.getRole() === 'wolf');  // Find out all players are wolves
            // wolfList.forEach(each => {
            //     this.client.users.fetch(each.getId(), false).then(async (user: any) => await user.send("Hello"));
            // })

            await this.countDown(10, "Thá»i gian bÃ¬nh chá»n cÃ²n láº¡i");

            //=====================Witch==========================
            const buttonWitch = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('kill-by-witch')
                        .setLabel('Kill')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('revival-by-witch')
                        .setLabel('Save')
                        .setStyle(ButtonStyle.Primary)
                );
            playerRole = await this.findRole('witch');
            // await this.client.users.fetch(playerRole.getId(), false)
            //     .then(async (user: any) => await user.send("Báº¡n lÃ  phÃ¹ thuá»· ÄÃ³, hÃ£y mau vÃ o lÃ m nhiá»m vá»¥ cá»§a mÃ¬nh nÃ o !!!"));

            await this.bot.channel.send({
                content: `${this.getPlayerById('869927501634359357').getName().username} will die, choose 'Save' or 'Kill Someone'`,
                components: [buttonWitch]
            });

            await this.countDown(10, "Thá»i gian bÃ¬nh chá»n cÃ²n láº¡i");
            await this.handleKill(); // Handle kill
            await this.handleRev(); // Rev
            await this.getListPlayerss(); // Display all players is live
            await this.clear(); // Reset All List (Kill, Rev)
            let content: string = "";
            let emojis: string[] = [];

            //Vote phase of village
            await this.listPlayer.forEach((each, index) => {
                if (each.getState()) {
                    content += `${this.listEmoji[index]}: ${each.getName().username}\n`
                    emojis.push(this.listEmoji[index])
                }
            })
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("Chá»n ngÆ°á»i chÆ¡i Äá» treo cá»")
                .setDescription(`${content}`);
            const voteMsg = await this.bot.channel.send({
                embeds: [embed],
                fetchReply: true
            })
            await emojis.forEach((each: string) => {
                voteMsg.react(`${each}`);
            })

            //Check vote to kill
            const players = await this.getListPlayerss();
            voteMsg.awaitReactions({time: 10000})
                .then(async (collected: any) => {
                    let index = 0;
                    let max = 0;
                    await collected.forEach(async (each: any) => {
                        if (each.count > max) {
                            this.queueKillCertain.splice(0);
                            this.queueKillCertain.push(players[index].getId());
                            max = each.count;
                        } else if (each.count === max) {
                            this.queueKillCertain.push(players[index].getId());
                        }
                        index++;
                    })
                })
            await this.countDown(20, "Thá»i gian tháº£o luáº­n cá»§a dÃ¢n lÃ ng");
            if (await this.queueKillCertain.length === 1) {
                await this.handleKill();
            }
            await this.clear();
            if (await this.checkFinish() === "Dan thang") {
                await this.bot.reply("DÃ¢n tháº¯ng !!!");
                break;
            } else if (await this.checkFinish() === "Soi thang") {
                await this.bot.reply("SÃ³i tháº¯ng !!!");
                break;
            }
        }
    }

    getListPlayerss = async () => {
        let a = '';
        const rs: any[] = [];
        await this.listPlayer.forEach(async (each: any) => {
            if (each.getState() === true) {
                a += each.getName().username + ", role =" + each.getRole() + "\n";
                await rs.push(each);
            }
        })
        this.bot.channel.send(a);
        return rs;
    }

}

