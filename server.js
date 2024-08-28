const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('your-secret-key-here'); // Replace with your secret Stripe API key

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/charge', async (req, res) => {
    try {
        const { amount, source, receipt_email } = req.body;
        const charge = await stripe.charges.create({
            amount,
            currency: 'usd',
            source,
            description: 'Food Order',
            receipt_email,
        });
        res.status(200).send({ success: true });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
        paymentMessage.textContent = error.message;
    } else {
        try {
            const response = await fetch('/charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1999, // Example amount in cents
                    source: token.id,
                    receipt_email: 'customer@example.com', // Replace with customer email
                }),
            });
            const result = await response.json();

            if (result.success) {
                paymentMessage.textContent = 'Payment successful!';
            } else {
                paymentMessage.textContent = `Error: ${result.error}`;
            }
        } catch (err) {
            paymentMessage.textContent = `Error: ${err.message}`;
        }
    }
});
