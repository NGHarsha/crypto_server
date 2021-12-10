# crypto_server
Backend developed using Express.js for the crypto portfolio app I have been working on. 

## Controllers
- **/api/users:** For signing up and logging in users. Uses JWT.
- **/api/portfolio:** Every user can have one or more portfolios. Every portfolio contains one or more transactions. This controller provides multiple routes for portfolio actions.
- **/api/transactions:** Transaction controller. Every transaction is mapped to a portfolio and user.
- **/api/news:** This controller gets news updates from [Cryptopanic](https://cryptopanic.com/).


