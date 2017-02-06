<chat>
  <ul id="messages">
    <li each={ message, i in messages }>{ message }</li>
  </ul>
  <form onsubmit={ add }>
    <input ref="input" onkeyup={ edit } autocomplete="off"/>
    <button disabled={ !text }>Send</button>
  </form>

  <script>
    var self = this;

    this.messages = [];

    // this.on('*', function (eventName) { console.info(eventName) })

    edit(e) {
      this.text = e.target.value
    }

    add(e) {
      event.preventDefault();
      socket.emit('chat message', this.text);
      this.text = this.refs.input.value = '';
    }

    this.on('mount', function () {
      socket.on('chat message', function (msg) {
        self.messages.push(msg);
        self.update();
      });
    });

    this.on('unmount', function () {
      socket.off('chat message');
    });
  </script>

  <style>
    form {
      background: #000;
      padding: 3px;
      position: fixed;
      bottom: 0;
      width: 100%;
    }

    form input {
      border: 0;
      padding: 10px;
      width: 90%;
      margin-right: 0.5%;
    }

    form button {
      width: 9%;
      background: rgb(130, 224, 255);
      border: none;
      padding: 10px;
    }

    #messages {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    #messages li {
      padding: 5px 10px;
    }
    #messages li:nth-child(odd) {
      background: #eee;
    }

  </style>
</chat>
