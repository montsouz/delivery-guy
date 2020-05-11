# Delivery Guy

WhatsApp and Watson connections in an easy way.

## How to run

First of all 

`npm install`

I recommend using docker to run this project 

`docker-compose up`

If you're not using docker 

`npm start`

## Environment file

Here is where you're going to set up your keys, look up at your `.env` file

    # Find these at your Twilio project, if you're using Twillio
    TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN
    
    # Find these at your Watson dash board 
    WATSON_ASSISTANT_ID
    WATSON_ASSISTANT_IAM_APIKEY
    
    # Find this at your Zenvia project, if you're using Zenvia
    ZENVIA_API_TOKEN
    
    #Chose with service to enable eg. (twilio, zenvia)
    
    SERVICE=zenvia
    
    


