import {ActionRowBuilder, ChannelType, Events, PermissionsBitField, StringSelectMenuBuilder} from "discord.js";
import {Init} from "../../game/__init__"

let game:any;

export const wolfGameCmd = {
    wolfCmd: (client: any) => {
        client.on('messageCreate', async (interaction: any) => {
            const message = interaction.content.toLowerCase();
            switch (message) {
                case '$wolf':
                    await startGame(interaction, client);
                    break;
            }
        })
        client.on(Events.InteractionCreate, async (interaction: any) => {
            if (!interaction.isStringSelectMenu()) return;
            const selected = interaction.values[0];
            if(interaction.customId === 'select-by-wolf') {
                await interaction.reply("Chọn thành công");
                await interaction.channel.send(`Người chơi bị vote bởi sói là: ${selected}`);
                await game.setListByWolf(selected);
                await game.setKillList(selected);
            }
            else if(interaction.customId === 'select-by-witch'){
                const witch = await game.findRole('witch');
                // const check = witch.checkPoison();
                if(witch?.checkPoison()){
                    await game.setKillCertain(selected);
                    await witch.empoison();
                    // console.log(interaction.message.components[0].components);
                    await interaction.update({content: "Phù thuỷ chọn người để đầu độc thành công", components: []});
                    // await interaction.disable(true);
                    // await interaction.channel.send(`Người chơi bị vote bởi phù thuỷ là: ${selected}`);
                }
                else{
                    await interaction.reply("Bạn đã hết thuốc độc");
                }
            }
            else if(interaction.customId === 'select-by-guard'){
                const check = await game.setProtected(selected);
                if(await !check){
                    await interaction.reply("Người này đã được bảo vệ ở đêm hôm qua, vui lòng chọn người khác");
                }else{
                    await interaction.reply("Đã chọn thành công người để bảo vệ đêm nay");
                }
            }
        });
        client.on(Events.InteractionCreate, async (interaction: any) => {
            if (!interaction.isButton()) return;
            const listChooseKillByWitch = await game?.initSelectOption('witch');
            const witch = await game.findRole('witch');
            if(interaction.customId==='kill-by-witch'){
                if(witch.checkPoison()) {
                    interaction.reply({
                        content: 'Chọn người bạn muôn đầu độc để giết đêm nay: ',
                        components: [listChooseKillByWitch]
                    });
                }else{
                    interaction.reply("Bạn đã hết bình thuốc độc");
                }
            }
            else if(interaction.customId === 'revival-by-witch'){
                const witch = await game.findRole('witch');
                if(await witch.checkRes()) {
                    const idKilled = game.getKillByWolf();
                    game.setRevList(idKilled);
                    witch.resurrect();
                }else{
                    await interaction.reply("Bạn đã hết thuốc hồi sinh");
                }
            }
        });
    }
}


const startGame = async (interaction: any, client: any) => {
    const message = await interaction.reply({
        content: 'Game đã sẵn sàng, hãy thả like vào tin nhắn này để join game',
        fetchReply: true
    });
    await message.react('👍');
    const filter = (reaction: any, user: any) => {
        return ['👍', '👎'].includes(reaction.emoji.name);
    };

    message.awaitReactions({max: 20, time: 5000})
        .then(async (collected: any) => {
            const reaction = collected.first();
            const players: any[] = [];
            await reaction.users.fetch().then((users: any) => {
                users.forEach((user: any) => {
                    if (!user.bot) {
                        players.push({name: user, id: '690156974691844110'});
                        players.push({name: user, id: '756141653185790033'});
                        players.push({name: user, id: '756029363853721672'});
                        players.push({name: user, id: '885063079627464744'});
                        players.push({name: user, id: '669205796508270622'});
                        players.push({name: user, id: '869927501634359357'});
                    }
                })
            })
            if (players.length) {
                let listPlayer = '';
                players.forEach(each => listPlayer += each.name.username + '\n');
                interaction.reply(`Game có ${players.length} người chơi.\nList player: \n${listPlayer}`);
                game = await new Init(players, interaction, client);
                await game.setRole();
                await game.getListPlayerss();
                
                await game.start();
            }
        })
        .catch((collected: any) => {
            console.log(collected);
            interaction.channel.send(`Không đủ người chơi, bye!`);
        });
}

