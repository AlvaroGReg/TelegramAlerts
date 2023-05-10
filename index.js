const TelegramBot = require('node-telegram-bot-api')
const schedule = require('node-schedule')
require('dotenv').config();
// Token del bot
const token = process.env.BOT_TOKEN

// Crea un objeto bot con el token
const bot = new TelegramBot(token, { polling: true })

// Maneja el comando /alerta
bot.onText(/\/alerta/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Ingresa la fecha y hora para programar la alerta en formato dd-mm-yyyy hh:mm: ')

  // Escucha los mensajes posteriores del usuario
  bot.on('message', (msg) => {
    const chatId = msg.chat.id

    // Obtén la fecha y hora de la entrada del usuario
    const [day, month, year, hour, minute] = msg.text.split(/[-: ]/).map(n => parseInt(n))

    // Comprueba si la alerta debe ser periódica
    bot.sendMessage(chatId, '¿Quieres que la alerta sea periódica? (sí o no)')
    bot.on('message', (msg) => {
      const chatId = msg.chat.id
      const respuesta = msg.text.toLowerCase()

      // Configura el intervalo de la alerta
      let intervalo = null
      if (respuesta === 'sí') {
        bot.sendMessage(chatId, '¿Quieres que la alerta sea diaria, semanal, mensual o anual?')
        bot.on('message', (msg) => {
          const chatId = msg.chat.id
          const respuesta = msg.text.toLowerCase()

          if (respuesta === 'diaria') {
            intervalo = '0 0 * * * *'
          } else if (respuesta === 'semanal') {
            intervalo = '0 0 * * 0 *'
          } else if (respuesta === 'mensual') {
            intervalo = `0 ${minute} ${hour} ${day} * *`
          } else if (respuesta === 'anual') {
            intervalo = `0 ${minute} ${hour} ${day} ${month} *`
          } else {
            bot.sendMessage(chatId, 'Lo siento, no entiendo esa respuesta. Inténtalo de nuevo.')
            return
          }

          // Programa la alerta
          const alerta = schedule.scheduleJob(intervalo, () => {
            bot.sendMessage(chatId, '¡Es hora de tu alerta!')
          })

          // Confirmación
          bot.sendMessage(chatId, `Alerta programada con éxito. ${intervalo ? `Será ${respuesta} ` : ''}para el ${day}/${month}/${year} a las ${hour}:${minute}.`)

          // Limpia los escuchadores de eventos
          bot.removeAllListeners('message')
        });
      } else {
        // Programa la alerta
        const fecha = new Date(year, month - 1, day, hour, minute)
        const alerta = schedule.scheduleJob(fecha, () => {
          bot.sendMessage(chatId, '¡Es hora de tu alerta!')
        })

        // Confirmación
        bot.sendMessage(chatId, `Alerta programada con éxito para el ${day}/${month}/${year} a las ${hour}:${minute}.`)

        // Limpia los escuchadores de eventos
        bot.removeAllListeners('message')
      }
    })
  })
})
