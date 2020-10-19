function ScoreBoardGameControl() {
  var POINT_GAME = 10;
  var TOTAL_CORRECT = 10;
  var total_corrects = 0;

  var score = 0;
  var TEXT_SCORE = 'Meu score : ';
  var corrects = 0;

  var _score = 0;
  var _TEXT_SCORE = "<span id='nomeAdversario'>" + getNameAdversario() + '</span> score : ';
  var _corrects = 0;

  this.updateScore = function () {
    var scoreDiv = document.getElementById('score');
    scoreDiv.innerHTML = TEXT_SCORE + score;

    var _scoreDiv = document.getElementById('_score');
    _scoreDiv.innerHTML = _TEXT_SCORE + _score;
  };

  this.incrementScore = function () {
    total_corrects++;

    if (!minhaVez) {
      corrects++;
    } else {
      _corrects++;
    }

    score += POINT_GAME;
    _score += POINT_GAME;

    if (total_corrects == TOTAL_CORRECT) {
      if (_score > score) {
        if (confirm('Fim de Jogo! Você perdeu\n O score do seu adversário foi ' + _score + '\n\n Deseja um novo jogo ?')) {
          novoJogoSolicitado();
        }
      } else if (score > _score) {
        if (confirm('Fim de Jogo! Parabéns você venceu!\n Seu Score foi ' + score + '\n\n Deseja um novo jogo ?')) {
          novoJogoSolicitado();
        }
      } else if (score == _score) {
        if (confirm('Jogo empatado!\n Seu Score foi ' + score + '\n\n Deseja um novo jogo ?')) {
          novoJogoSolicitado();
        }
      } else {
        if (confirm('Fim do jogo! \n\n Deseja um novo jogo ?')) {
          novoJogoSolicitado();
        }
      }

      setEndGame();
    }
  };

  this.decrementScore = function () {
    if (!minhaVez) {
      score -= POINT_GAME;
    } else {
      _score -= POINT_GAME;
    }
  };
}

function Card(picture) {
  var FOLDER_IMAGES = 'resources/imgs/';
  var IMAGE_QUESTION = 'question.png';
  this.picture = picture;
  this.visible = false;
  this.block = false;

  this.equals = function (cardGame) {
    if (this.picture.valueOf() == cardGame.picture.valueOf()) {
      return true;
    }
    return false;
  };
  this.getPathCardImage = function () {
    return FOLDER_IMAGES + picture;
  };
  this.getQuestionImage = function () {
    return FOLDER_IMAGES + IMAGE_QUESTION;
  };
}

function ControllerLogicGame() {
  var firstSelected;
  var secondSelected;
  var block = false;
  var TIME_SLEEP_BETWEEN_INTERVAL = 1000;
  var eventController = this;

  this.addEventListener = function (eventName, callback) {
    eventController[eventName] = callback;
  };

  this.doLogicGame = function (card, callback) {
    if (!card.block && !block) {
      if (firstSelected == null) {
        firstSelected = card;
        card.visible = true;
      } else if (secondSelected == null && firstSelected != card) {
        secondSelected = card;
        card.visible = true;
      }

      if (firstSelected != null && secondSelected != null) {
        block = true;
        var timer = setInterval(function () {
          if (secondSelected.equals(firstSelected)) {
            firstSelected.block = true;
            secondSelected.block = true;
            eventController['correct']();
          } else {
            firstSelected.visible = false;
            secondSelected.visible = false;
            eventController['wrong']();
          }
          firstSelected = null;
          secondSelected = null;
          clearInterval(timer);
          block = false;
          eventController['show']();
        }, TIME_SLEEP_BETWEEN_INTERVAL);
      }
      eventController['show']();
    }
  };
}

function CardGame(cards, controllerLogicGame, scoreBoard) {
  var LINES = 4;
  var COLS = 5;
  this.cards = cards;
  var logicGame = controllerLogicGame;
  var scoreBoardGameControl = scoreBoard;

  this.clear = function () {
    var game = document.getElementById('game');
    game.innerHTML = '';
  };

  this.show = function () {
    this.clear();
    scoreBoardGameControl.updateScore();
    var cardCount = 0;
    var game = document.getElementById('game');
    for (var i = 0; i < LINES; i++) {
      for (var j = 0; j < COLS; j++) {
        card = cards[cardCount++];

        var cardImage = document.createElement('img');
        cardImage.setAttribute('id', 'l_' + (i + 1) + '-c_' + (j + 1));

        if (card.visible) {
          cardImage.setAttribute('src', card.getPathCardImage());
        } else {
          cardImage.setAttribute('src', card.getQuestionImage());
        }
        cardImage.onclick = (function (position, cardGame) {
          return function () {
            card = cards[position];
            var callback = function () {
              cardGame.show();
            };
            logicGame.addEventListener('correct', function () {
              scoreBoardGameControl.incrementScore();
              scoreBoardGameControl.updateScore();
            });
            logicGame.addEventListener('wrong', function () {
              scoreBoardGameControl.decrementScore();
              scoreBoardGameControl.updateScore();
            });

            logicGame.addEventListener('show', function () {
              cardGame.show();
            });

            logicGame.doLogicGame(card);

            emitSocketClikc(this.getAttribute('id'));
          };
        })(cardCount - 1, this);

        game.appendChild(cardImage);
      }
      var br = document.createElement('br');
      game.appendChild(br);
    }
  };
}

var positionSession = [];

function BuilderCardGame() {
  var pictures = new Array(
    '10.png',
    '10.png',
    '1.png',
    '1.png',
    '2.png',
    '2.png',
    '3.png',
    '3.png',
    '4.png',
    '4.png',
    '5.png',
    '5.png',
    '6.png',
    '6.png',
    '7.png',
    '7.png',
    '8.png',
    '8.png',
    '9.png',
    '9.png'
  );

  this.doCardGame = function () {
    shufflePictures();
    cards = buildCardGame();
    cardGame = new CardGame(cards, new ControllerLogicGame(), new ScoreBoardGameControl());
    cardGame.clear();
    return cardGame;
  };

  var shufflePictures = function () {
    var i = pictures.length,
      j,
      tempi,
      tempj;

    if (i == 0) return false;

    var a = 0;
    var position = [];
    while (--i) {
      if (positionSession.length) {
        j = positionSession[a];
      } else {
        j = Math.floor(Math.random() * (i + 1));
        position.push(j);
      }

      a++;
      tempi = pictures[i];
      tempj = pictures[j];
      pictures[i] = tempj;
      pictures[j] = tempi;
    }
    positionSession = position;
  };

  var buildCardGame = function () {
    var countCards = 0;
    cards = new Array();
    for (var i = pictures.length - 1; i >= 0; i--) {
      card = new Card(pictures[i]);
      cards[countCards++] = card;
    }
    return cards;
  };
}

function GameControl() {}

GameControl.createGame = function () {
  var builderCardGame = new BuilderCardGame();
  cardGame = builderCardGame.doCardGame();
  cardGame.show();
};

var socket = io();

var objMyUser = {};
var objUsers = [];
var minhaVez;

$(document).ready(function () {
  socket.on('jogador_desconectado', function (obj) {
    objUsers = [];
    objUsers.push(obj.users);

    console.log(objUsers);
  });

  socket.on('configuracao_inicial', function (data) {
    if (data.permisao) {
      var nome = undefined;

      while (nome == undefined) {
        nome = prompt('Oi, qual o seu nome?');
      }

      if (nome == '') {
        window.location.reload();
      }

      objMyUser = {
        id: new Date().getTime() + '_' + data.users.length,
        nome: nome,
      };

      socket.emit('salvar_jogador', objMyUser);

      if (data.users.length > 0) {
        objUsers.push(data.users[0]);
      }

      objUsers.push(objMyUser);

      if (data.posicao == '') {
        GameControl.createGame();
        socket.emit('enviar_posicao_imgs', positionSession);

        minhaVez = true;
      } else {
        positionSession = data.posicao;
        GameControl.createGame();

        minhaVez = false;
      }

      minhaVezDeJogar(minhaVez);
    } else {
      $('#control,#score').empty();
      $('#game img').remove();
      $('#main').append(
        "<div id='aguarde_novo_jogador'><div class='aguardeNovoJogador'></div><div class='bg_novoJogador'></div><p class='text_aguardandoNovoJogador'>AGUARDE SUA VEZ, JOGO EM ANDAMENTO!<br>...<br>QUANDO DISPONÍVEL VOCÊ SERÁ NOTIFICADO!</p></div>"
      );
    }
  });

  $(window).bind('beforeunload', function (e) {
    socket.emit('remover_jogador', objMyUser.id);
  });
});

socket.on('vez_jogada', function (obj) {
  if (objMyUser) {
    if (obj == objMyUser.id) {
      minhaVez = true;
    } else {
      minhaVez = false;
    }
  }

  minhaVezDeJogar(minhaVez);
});

socket.on('jogadores', function (obj) {
  objUsers = obj;

  setLabelJogadores(obj);

  if (obj.length <= 1) {
    aguardeUmNovoJogador(true);
    minhaVezDeJogar(true);
  } else {
    aguardeUmNovoJogador(false);
  }
});

function setLabelJogadores(users) {
  var jogadores = '';

  for (var i = 0; i < users.length; i++) {
    if (users[i].id != objMyUser.id) {
      $('#nomeAdversario').text(users[i].nome);
    }
    jogadores += '<b>' + users[i].nome + '</b> X ';
  }

  jogadores = jogadores.substring(0, jogadores.length - 2);

  $('#jogadores').html('<p>' + jogadores + '</p>');
}

function getNameAdversario() {
  var nome = '';
  for (var i = 0; i < objUsers.length; i++) {
    if (objUsers[i].id != objMyUser.id) {
      nome = objUsers[i].nome;
    }
  }
  nome = nome == '' ? 'Adversário' : nome;
  return nome;
}

function aguardeUmNovoJogador(opt) {
  if (opt) {
    $('#game').append("<div class='noGame'></div>");
    $('#main').append(
      "<div id='aguarde_novo_jogador'><div class='aguardeNovoJogador'></div><div class='bg_novoJogador'></div><p class='text_aguardandoNovoJogador'>AGUARDANDO UM NOVO JOGADOR SE CONECTAR.</p></div>"
    );
  } else {
    $('#aguarde_novo_jogador').each(function () {
      $(this).remove();
    });
    $('.noGame').each(function () {
      $(this).remove();
    });
  }
}

socket.on('event_click_img_', function (obj) {
  if (!minhaVez) {
    $('#' + obj.idButton).trigger('click');
  }
});

socket.on('notificar_jogador_na_fila', function (users) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].id != objMyUser.id) {
      //alert("Olá, agora você já pode jogar!\n\nClique em JOGAR!");
      $('#main #aguarde_novo_jogador p').append("<br><center><span class='btn' onclick='window.location.reload();'>JOGAR</span></center>");
    }
  }
});

function setEndGame() {
  $('#game img').remove();
  $('#main').append(
    "<div id='theEndGame'>" + "<div class='aguardeNovoJogador'></div>" + "<p class='text_aguardandoNovoJogador'><br>O JOGO TERMINOU<br></p></div>"
  );
}

function emitSocketClikc(id) {
  if (minhaVez) {
    socket.emit('event_click_img', { idButton: id, user: objMyUser });
  }
}

function minhaVezDeJogar(opc) {
  $('#aguardeJogada').each(function () {
    $(this).remove();
  });

  $('#novojogo').attr('disabled', false);

  if (!opc) {
    var html = "<label style='color: red'>" + objMyUser.nome + ', aguarde o outro jogador fazer suas jogadas.</label>';

    $('#label_info_jogador').html(html);
    $('body').append("<div id='aguardeJogada'><div class='aguardeJogada'></div><div class='bg'></div></div> ");

    $('#novojogo').attr('disabled', true);
  } else {
    var html = "<label style='color: #008800'>" + objMyUser.nome + ', sua vez de jogar.</label>';
    $('#label_info_jogador').html(html);
  }
}

function novoJogoSolicitado() {
  var msg = objMyUser.nome + ', solicitou um novo jogo!';
  var objNovoJogo = {};
  objNovoJogo.msg = msg;
  objNovoJogo.user = objMyUser;

  positionSession = [];
  GameControl.createGame();
  socket.emit('enviar_posicao_imgs', positionSession);
  socket.emit('novo_jogo', objNovoJogo);
}

socket.on('novo_jogo_', function (obj) {
  if (obj.user.id == objMyUser.id) {
    minhaVez = true;
  } else {
    $('#theEndGame').each(function () {
      $(this).remove();
    });
    alert(obj.msg);
    positionSession = obj.posicao;
    GameControl.createGame();
    minhaVez = false;
  }
  minhaVezDeJogar(minhaVez);
});

socket.on('reiniciar_game', function (obj) {
  if (obj.user.id == objMyUser.id) {
    minhaVez = true;
  } else {
    minhaVez = false;
  }

  positionSession = obj.posicao;

  GameControl.createGame();

  minhaVezDeJogar(minhaVez);
});
