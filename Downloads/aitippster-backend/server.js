
const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_your_secret_key'); // Cseréld ki a saját titkos kulcsodra
const bodyParser = require('body-parser');
const axios = require('axios');
const endpointSecret = 'your_stripe_webhook_secret'; // Ezt a Stripe-ben állítjuk be
const TELEGRAM_BOT_TOKEN = '7637401354:AAHK9M3S7KiwdauaMizhQhCxZG1P9yvQoOQ';
const TELEGRAM_CHAT_ID = '-1001745398666';

app.use(bodyParser.json());

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        console.log('Webhook signature verification failed.');
        return response.sendStatus(400);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Automatikus Telegram üzenet küldése
        axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: `Új előfizető: ${session.customer_email || 'ismeretlen felhasználó'}
Üdvözlünk az AITippster VIP csoportban!`
        }).then(() => {
            console.log("Üzenet elküldve a Telegramra.");
        }).catch(error => {
            console.error("Hiba a Telegram üzenetküldésnél:", error);
        });
    }

    response.status(200).send('Webhook fogadva');
});

app.listen(4242, () => console.log('Szerver fut a 4242-es porton'));
