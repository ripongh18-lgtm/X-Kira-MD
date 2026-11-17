
import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];

  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");

  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function"
    ? raw.toNumber()
    : Number(raw);

  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers) ? config.ownerNumbers : [];
  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show the branded X-KIRA MD menu and available command sections.",
    run: async ctx => {
      const menu = buildMenu({
        commands: ctx.commands,
        config: ctx.config,
        theme: ctx.theme
      });

      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption:
              "🤖 *𓆩 X-KIRA MD 𓆪*\n" +
              "✦ Premium WhatsApp Bot\n" +
              "🔗 Official pairing portal: " + ctx.config.botUrl + "\n" +
              "⚡ Powered by X-KIRA MD"
          });
        } catch (error) {
          console.warn(
            "X-KIRA MD menu artwork could not be sent; using the text menu:",
            error?.message || error
          );
        }
      }

      await ctx.reply(menu);
    }
  },

  {
    name: "help",
    category: "General",
    description: "List registered commands and their descriptions.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command =>
          ctx.config.prefix + command.name +
          (command.description ? " ─ " + command.description : "")
        );

      const header =
        "╭━━━〔 📚 X-KIRA MD HELP 〕━━━✦\n" +
        "┃ ❖ ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs : " + rows.length +
        "\n┃\n";

      const chunks = [];
      let current = header;

      for (const row of rows) {
        if (current.length + row.length + 1 > 3300) {
          chunks.push(current.trimEnd());
          current = "╭━━━〔 📚 X-KIRA MD HELP · ᴄᴏɴᴛɪɴᴜᴇᴅ 〕━━━✦\n┃\n";
        }

        current += "┃ ⬡ " + row + "\n";
      }

      if (current.trim()) {
        chunks.push(current.trimEnd() + "\n╰━━━━━━━━━━━━━━✦");
      }

      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    }
  },

  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null
        ? null
        : Math.max(0, Date.now() - timestamp);

      await ctx.reply([
        "╭━━━〔 🏓 X-KIRA MD · PONG 〕━━━✦",
        "┃",
        "┃ ❖ sᴛᴀᴛᴜs : " + (ctx.connectionOpen ? "ᴏɴʟɪɴᴇ 🟢" : "ᴄᴏɴɴᴇᴄᴛɪɴɢ 🟡"),
        "┃ ❖ ʀᴇsᴘᴏɴsᴇ : " + (responseMs === null ? "ᴜɴᴀᴠᴀɪʟᴀʙʟᴇ" : responseMs + " ms"),
        "┃ ❖ ᴜᴘᴛɪᴍᴇ : " + formatDuration(process.uptime()),
        "┃ ❖ ᴠᴇʀsɪᴏɴ : " + ctx.config.version,
        "┃",
        "╰━━━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },

  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status, mode and uptime.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━〔 🤖 X-KIRA MD 〕━━━✦",
        "┃",
        "┃ ❖ sᴛᴀᴛᴜs : " + (ctx.connectionOpen ? "ᴏɴʟɪɴᴇ 🟢" : "ᴄᴏɴɴᴇᴄᴛɪɴɢ 🟡"),
        "┃ ❖ ᴍᴏᴅᴇ : " + String(ctx.mode || "public").toUpperCase(),
        "┃ ❖ ᴜᴘᴛɪᴍᴇ : " + formatDuration(process.uptime()),
        "┃ ❖ ᴏᴡɴᴇʀ : " + ctx.config.ownerName,
        "┃",
        "╰━━━〔 ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ X-KIRA MD 〕━━━"
      ].join("\n"));
    }
  },

  {
    name: "owner",
    category: "General",
    description: "Show X-KIRA MD owner details.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);

      await ctx.reply([
        "╭━━━〔 👑 ʙᴏᴛ ᴏᴡɴᴇʀ 〕━━━✦",
        "┃",
        "┃ ❖ ɴᴀᴍᴇ : " + ctx.config.ownerName,
        ...(number ? ["┃ ❖ ɴᴜᴍʙᴇʀ : +" + number] : []),
        "┃",
        "╰━━━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },

  {
    name: "support",
    category: "General",
    description: "Show support guidance for X-KIRA MD.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━〔 🛟 X-KIRA MD SUPPORT 〕━━━✦",
        "┃",
        "┃ ❖ ɴᴇᴇᴅ ʜᴇʟᴘ?",
        "┃ For setup help or bug reports,",
        "┃ contact " + ctx.config.ownerName + ".",
        "┃",
        "┃ ❖ ɢɪᴛʜᴜʙ :",
        "┃ https://github.com/Benfeitech/FEI-XMD",
        "┃",
        "╰━━━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },

  {
    name: "time",
    category: "General",
    description: "Show the current server time in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());

      await ctx.reply(
        "🕒 ɴɪɢᴇʀɪᴀ ᴛɪᴍᴇ : " + value
      );
    }
  },

  {
    name: "date",
    category: "General",
    description: "Show the current date in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());

      await ctx.reply(
        "📅 ɴɪɢᴇʀɪᴀ ᴅᴀᴛᴇ : " + value
      );
    }
  },

  {
    name: "version",
    category: "General",
    description: "Show X-KIRA MD version and connection status.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━〔 🤖 X-KIRA MD 〕━━━✦",
        "┃",
        "┃ ❖ ᴠᴇʀsɪᴏɴ : " + ctx.config.version,
        "┃ ❖ sᴛᴀᴛᴜs : " + (ctx.connectionOpen ? "ᴏɴʟɪɴᴇ 🟢" : "ᴄᴏɴɴᴇᴄᴛɪɴɢ 🟡"),
        "┃ ❖ ᴍᴏᴅᴇ : " + String(ctx.mode || "public").toUpperCase(),
        "┃ ❖ ᴘʟᴀᴛғᴏʀᴍ : ʙᴀɪʟᴇʏs",
        "┃",
        "╰━━━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },

  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show the current chat and message sender IDs.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━〔 🆔 ᴄʜᴀᴛ ɪɴғᴏ 〕━━━✦",
        "┃",
        "┃ ❖ ᴄʜᴀᴛ ɪᴅ : " + ctx.jid,
        "┃ ❖ sᴇɴᴅᴇʀ ɪᴅ : " + (ctx.senderJid || "ᴜɴᴀᴠᴀɪʟᴀʙʟᴇ"),
        "┃",
        "╰━━━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },

  {
    name: "whoami",
    category: "General",
    description: "Show your WhatsApp sender information.",
    run: async ctx => {
      await ctx.reply([
        "╭━━━〔 👤 ᴜsᴇʀ ɪɴғᴏ 〕━━━✦",
        "┃",
        "┃ ❖ ɴᴀᴍᴇ : " + (ctx.msg?.pushName || "Unknown"),
        "┃ ❖ ʏᴏᴜʀ ɪᴅ : " + (ctx.senderJid || "Unavailable"),
        "┃ ❖ ᴏᴡɴᴇʀ : " + (ctx.owner ? "Yes 👑" : "No"),
        "┃",
        "╰━━━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  }
];

export default commands;

