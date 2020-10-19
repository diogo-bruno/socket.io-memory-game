const open = require('open');

var express = require('express');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

app.use(express.static(__dirname + '/app'));

var users = [];
var posicao = '';
var permissao = true;

var jogoIniciado;

var jogadoresConectados;

io.on('connection', function (socket) {
  socket.emit('configuracao_inicial', {
    permisao: permissao,
    posicao: posicao,
    users: users,
  });

  socket.on('salvar_jogador', function (data) {
    users.push(data);

    if (users.length >= 2) {
      permissao = false;
    } else {
      permissao = true;
    }

    reiniciarJogo();

    io.emit('jogadores', users);
  });

  function reiniciarJogo() {
    idUserUltimasJogadas = [];
    jogoIniciado = false;

    var i = 20;
    var posicao = [];
    while (--i) {
      posicao.push(Math.floor(Math.random() * (i + 1)));
    }

    io.emit('reiniciar_game', { user: users[0], posicao: posicao });
  }

  socket.on('novo_jogo', function (data) {
    idUserUltimasJogadas = [];
    jogoIniciado = false;

    data.posicao = posicao;
    io.emit('novo_jogo_', data);
  });

  socket.on('enviar_posicao_imgs', function (data) {
    posicao = data;
  });

  socket.on('disconnect', function () {
    io.emit('jogador_desconectado', {
      permisao: permissao,
      posicao: posicao,
      users: users,
    });

    io.emit('jogadores', users);

    io.sockets.sockets.map(function (e) {
      //console.log(e.conn.server.clientsCount);
      jogadoresConectados = e.conn.server.clientsCount;
    });
  });

  socket.on('remover_jogador', function (obj) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].id == obj) {
        users.splice(i, 1);
      }
    }

    if (users.length == 0) {
      posicao = '';
    }

    if (users.length == 2) {
      permissao = false;
    } else {
      permissao = true;
    }

    if (users.length == 1) {
      io.emit('notificar_jogador_na_fila', users);
    }

    console.log(users);
  });

  var idUserUltimasJogadas = [];

  socket.on('event_click_img', function (obj) {
    jogoIniciado = true;

    var proximoJogador;

    idUserUltimasJogadas.push(obj.user.id);

    if (idUserUltimasJogadas.length == 2) {
      for (var i = 0; i < users.length; i++) {
        if (obj.user.id != users[i].id) {
          proximoJogador = users[i].id;
        }
      }

      idUserUltimasJogadas = [];
    } else {
      proximoJogador = obj.user.id;
    }

    obj.idDaJogada = obj.user.id;

    io.emit('event_click_img_', obj);

    io.emit('vez_jogada', proximoJogador);
  });
});

const port = 3000;

http.listen(port, function () {
  console.log(`Server start in port ${port}`);
  const startPage = async () => {
    await open(`http://localhost:${port}`);
  };
  startPage();
});
