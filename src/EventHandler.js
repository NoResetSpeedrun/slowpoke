import moment from 'moment';
import emoji from 'node-emoji';

class EventHandler {
  constructor(client, msg, type) {
    this.client = client;
    this.message = null;
    this.yes = [];
    this.no = [];
    this.maybe = [];
    this.restOfMessage = null;

    if (type === 'new') {
      const input = msg.content.slice('!').trim();
      const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
      this.restOfMessage = commandArgs;
      this.createNewEvent(msg);
    } else if (type === 'existing') {
      this.message = msg;
      this.hookEvent();
    }
    this.listenReactions();
  }

  async hookEvent() {
    await this.message.reactions
      .get(emoji.get('thumbsup'))
      .fetchUsers()
      .then(users => {
        this.yes = users
          .map(user => {
            if (user.bot) return;
            return this.client.users.get(user.id);
          })
          .filter(e => e);
      });
    await this.message.reactions
      .get(emoji.get('thumbsdown'))
      .fetchUsers()
      .then(users => {
        this.no = users
          .map(user => {
            if (user.bot) return;
            return this.client.users.get(user.id);
          })
          .filter(e => e);
      });
    await this.message.reactions
      .get(emoji.get('question'))
      .fetchUsers()
      .then(users => {
        this.maybe = users
          .map(user => {
            if (user.bot) return;
            return this.client.users.get(user.id);
          })
          .filter(e => e);
      });
    this.editMessage();
    console.log(`Hooking up existing event, ID ${this.message.id}`);
  }

  addUser(type, user) {
    if (this[type].find(e => e.id === user.id)) {
      console.log(`${type} - user ${user.tag} already in event`);
    } else {
      this[type].push(user);
      console.log(`${type} - Added user ${user.tag}`);
    }
  }

  removeUser(type, user) {
    if (this[type].find(e => e.id === user.id)) {
      this[type].splice(
        this[type].findIndex(usr => usr.id === user.id),
        1,
      );
      console.log(`${type} - Removed user ${user.tag}`);
    } else {
      console.log(`${type} - user ${user.tag} not in event`);
    }
  }

  displayRole(type) {
    let str = this[type].length ? '' : 'Nobody !';
    this[type].forEach(user => {
      str = str.concat(`- <@${user.id}>\n`);
    });
    return str;
  }

  generateEmbed() {
    return {
      color: 16711680,
      footer: {
        text: `React with ${emoji.get('thumbsup')}, ${emoji.get('thumbsdown')}, ${emoji.get(
          'question',
        )} in order to declare your attendance to "${this.restOfMessage}".`,
      },
      fields: [
        {
          inline: true,
          name: `${emoji.get('thumbsup')} Yes (${this.yes.length})`,
          value: this.displayRole('yes'),
        },
        {
          inline: true,
          name: `${emoji.get('thumbsdown')} No (${this.no.length})`,
          value: this.displayRole('no'),
        },
        {
          inline: true,
          name: `${emoji.get('question')} Maybe (${this.maybe.length})`,
          value: this.displayRole('maybe'),
        },
      ],
    };
  }

  listenReactions() {
    this.client.on('messageReactionAdd', async (reaction, user) => {
      if (reaction.message.id !== this.message.id || user.bot) return;

      if (emoji.which(reaction.emoji.name) === 'thumbsup') {
        this.addUser('yes', user);
      } else if (emoji.which(reaction.emoji.name) === 'thumbsdown') {
        this.addUser('no', user);
      } else if (emoji.which(reaction.emoji.name) === 'question') {
        this.addUser('maybe', user);
      }

      this.editMessage();
    });

    this.client.on('messageReactionRemove', (reaction, user) => {
      if (reaction.message.id !== this.message.id || user.bot) return;

      if (emoji.which(reaction.emoji.name) === 'thumbsup') {
        this.removeUser('yes', user);
      } else if (emoji.which(reaction.emoji.name) === 'thumbsdown') {
        this.removeUser('no', user);
      } else if (emoji.which(reaction.emoji.name) === 'question') {
        this.removeUser('maybe', user);
      }
      this.editMessage();
    });
  }

  async editMessage() {
    await this.message.edit({
      content: `@here Attendance check is up for "${
        this.restOfMessage
      }" \n Last edit : ${moment().format('Do MMMM, HH:mm:ss')} (GMT)`,
      embeds: [this.generateEmbed()],
    });
    console.log(`Edited event ${this.message.id}`);
  }

  async createNewEvent(msg) {
    this.message = await msg.channel.send({
      content: `@here Attendance check is up for "${
        this.restOfMessage
      }" \n Last edit : ${moment().format('Do MMMM, HH:mm:ss')} (GMT)`,
      embeds: [this.generateEmbed()],
    });
    await this.message.react(emoji.get('thumbsup'));
    await this.message.react(emoji.get('thumbsdown'));
    await this.message.react(emoji.get('question'));

    //might not need this
    /*const newEvent = new Event({
      messageID: this.message.id,
      channelID: this.message.channel.id
    });
    newEvent.save();*/

    console.log(`Created new event, id ${this.message.id}`);
  }
}

export default EventHandler;
