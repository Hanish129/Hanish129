// Initialize cart
let cart = [];
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

function updateCart() {
    cartCount.textContent = cart.length;
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - $${item.price}`;
        cartItems.appendChild(listItem);
        total += parseFloat(item.price);
    });
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = button.getAttribute('data-price');
            cart.push({ name, price });
            updateCart();
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const stripe = Stripe('your-publishable-key-here'); // Replace with your public Stripe API key
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    const form = document.getElementById('payment-form');
    const paymentMessage = document.getElementById('payment-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const { token, error } = await stripe.createToken(cardElement);

        if (error) {
            paymentMessage.textContent = error.message;
        } else {
            paymentMessage.textContent = 'Payment successful!';
            // You need to send this token to your server to complete the payment
            console.log('Token:', token);
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const payButton = document.getElementById('pay-button');
    const paymentMessage = document.getElementById('payment-message');

    payButton.addEventListener('click', () => {
        // Create a Razorpay order
        fetch('/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 1999 }) // Amount in paise
        })
        .then(response => response.json())
        .then(data => {
            if (data.orderId) {
                var options = {
                    key: 'your-razorpay-key', // Replace with your Razorpay key
                    amount: data.amount, // Amount in paise
                    currency: 'INR',
                    name: 'Foodie Haven',
                    description: 'Food Order Payment',
                    order_id: data.orderId,
                    handler: function (response) {
                        // Handle payment success
                        fetch('/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: data.orderId,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                paymentMessage.textContent = 'Payment successful!';
                            } else {
                                paymentMessage.textContent = 'Payment verification failed!';
                            }
                        });
                    },
                    prefill: {
                        name: 'Customer Name',
                        email: 'customer@example.com',
                        contact: '9999999999'
                    },
                    theme: {
                        color: '#3399cc'
                    }
                };
                
                var rzp1 = new Razorpay(options);
                rzp1.open();
            } else {
                paymentMessage.textContent = 'Error creating order.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            paymentMessage.textContent = 'Payment failed!';
        });
    });
});
