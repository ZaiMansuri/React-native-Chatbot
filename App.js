 
import React, { Component } from 'react';
import { StyleSheet, View, Keyboard, Dimensions, Animated, Platform, } from 'react-native';
import { GiftedChat, Bubble, Actions } from 'react-native-gifted-chat';
import { Dialogflow_V2 } from 'react-native-dialogflow';

import { dialogflowConfig } from './env';

const BOT_USER = {
  _id: 2,
  name: 'Sparky Bot',
  avatar: 'https://cdn-images-1.medium.com/max/1600/1*Y1klwgS90g788BD8gf3aLw.png'
};

class App extends Component {
  state = {
    messages: [
      {
        _id: 1,
        text: `Hi! I am the Sparky bot 🤖. How may I help you with today?`,
        createdAt: new Date(),
        user: BOT_USER
      }
    ]
  };

  componentDidMount() {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id
    );
  }

  isDefined(obj) {
    if (typeof obj == 'undefined' || typeof obj == undefined) {
      return false;
    }
    if (!obj) { return false; }
    return obj != null;
  }

  handleGoogleResponse(result) {
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    this.sendBotResponse(text);
  }

  handleDialogFlowResponse(response) {
    let responseText = response.fulfillmentMessages.fulfillmentText;
    let messages = response.fulfillmentMessages[0].text.text[0];
    let action = response.action;
    let contexts = response.outputContexts;
    let parameters = response.parameters;

    if (this.isDefined(action)) {
      this.handleDialogFlowAction(action, messages, contexts, parameters);
    } else if (this.isDefined(messages)) {
      this.sendBotResponse(messages);
    } else if (responseText == '' && !this.isDefined(action)) {
      //dialogflow could not evaluate input.
      let text = "I'm not sure what you want. Can you be more specific?";
      this.sendBotResponse(text);
    } else if (this.isDefined(responseText)) {
      this.sendBotResponse(responseText);
    }
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));
    let message = messages[0].text;
    Dialogflow_V2.requestQuery(
      message,
      result => {
        console.log(result);
        this.handleDialogFlowResponse(result.queryResult)
      },
      error => console.log(error)
    );
  }

  sendBotResponse(text) {
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#cfd8e8',
          },
          right: {
            backgroundColor: '#cfd8e8',
          },
        }}
        textProps={{
          style: {
            color: props.position === 'left' ? '#385783' : '#385783',
          },
        }}
        textStyle={{
          left: {
            color: '#385783',
          },
          right: {
            color: '#385783',
          },
        }}
      />
    )
  }


  handleDialogFlowAction(action, messages, contexts, parameters, fulfillmentMessages) {

    switch (action) {
      case 'menu':
        alert(action);
        this.sendBotResponse(messages);
        setTimeout(function () {
          let buttons = [
            {
              type: "postback",
              title: "Desserts & Shakes Menu",
              payload: "DESSERTS&SHAKES"
            },
            {
              type: "postback",
              title: "Breakfast Menu",
              payload: "BREAKFAST"
            },
            {
              type: "postback",
              title: "Burgers",
              payload: "BURGERS"
            }
          ];
          this.sendBotResponse("which menu you would like to see?");
        }, 3000)
        break;
      case "book-table":
        console.log(contexts);
        this.sendBotResponse(messages);

        function reformatDate(date) {
          var b = date.split('T');
          var t = b[1].slice(0, 5).split(':');
          return [b[0], `${t[0] % 12 || 12}:${t[1]} ${t[0] < 12 ? 'am' : 'pm'}`];
        }

        if (this.isDefined(contexts[0]) && contexts[0].parameters) {
          var noOfPeople = (contexts[0].parameters.number_people);
          var bookingDate = (contexts[0].parameters.booking_date);
          var bookingTime = (contexts[0].parameters.booking_time);
          var phone_number = (contexts[0].parameters.phone_number);
          var bookingname = (contexts[0].parameters.username);
        }
        var bookingdate = reformatDate(bookingDate);
        var bookingtime = reformatDate(bookingTime);

        if (noOfPeople !== '' && bookingname != '') {
          let reply = 'Dear ' + bookingname + ', You have booked a table for ' + noOfPeople + ' on date '
            + bookingdate[0] + ' at ' + bookingtime[1] + ' in case of any emergency we will contact you on ' + phone_number;
          this.sendBotResponse(reply);
        } else {
          console.error(response.error);
        }
        break;
      default:
        //unhandled action, just send back the text
        this.sendBotResponse(messages)

    }
  }



  render() {
    const gradientBackground = '#f98a87';
    const gradientHeight = 300;
    const data = Array.from({ length: gradientHeight });
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {data.map((_, i) => (
          <View style={{
            flex: 1, position: 'absolute',
            backgroundColor: gradientBackground,
            height: 1,
            bottom: (gradientHeight - i),
            right: 0,
            left: 0,
            zIndex: 2,
            opacity: (1 / gradientHeight) * (i + 1)
          }} />
        ))}
        <GiftedChat
          renderBubble={this.renderBubble}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
        />

      </View>
    );
  }
}

export default App;