enchant();
//自機のクラス
var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y){
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['graphic.png'];
        this.x = x; this.y = y; this.frame = 0;
          //自機の操作　タッチで移動する
        game.rootScene.addEventListener('touchstart',
                function(e){ player.y = e.y; game.touched = true; });
        game.rootScene.addEventListener('touchend',
                function(e){ player.y = e.y; game.touched = false; });
        game.rootScene.addEventListener('touchmove',
                function(e){ player.y = e.y; });
        this.addEventListener('enterframe', function(){
            if(game.touched && game.frame % 3 == 0){     //3フレームに一回、自動的に撃つ
                     var s = new PlayerShoot(this.x, this.y); }
        });
        game.rootScene.addChild(this);
    }
});
//敵のクラス
var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, omega){
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['graphic.png'];
        this.x = x; this.y = y; this.frame = 3; this.time = 0;
       
          this.omega = omega*Math.PI / 180; //ラジアン角に変換
          this.direction = 0; this.moveSpeed = 3;

          //敵の動きを定義する
        this.addEventListener('enterframe', function(){
            this.direction += this.omega;
            this.x -= this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);

               //画面外に出たら消える
            if(this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height){
                this.remove();
            }else if(this.time++ % 10 == 0){ //10フレームに一回、撃つ
                var s = new EnemyShoot(this.x, this.y);
            }
        });
        game.rootScene.addChild(this);
    },
    remove: function(){
        game.rootScene.removeChild(this);
        delete enemies[this.key]; delete this;
    }
});
//弾のクラス
var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, direction){
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['graphic.png'];
        this.x = x; this.y = y; this.frame = 1;
        this.direction = direction; this.moveSpeed = 10;
        this.addEventListener('enterframe', function(){ //弾は決められた方向にまっすぐ飛ぶ
            this.x += this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);
            if(this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height){
                this.remove();
            }
        });
        game.rootScene.addChild(this);
    },
    remove: function(){ game.rootScene.removeChild(this); delete this; }
});
//プレイヤーの撃つ弾のクラス

var PlayerShoot = enchant.Class.create(Shoot, { //弾のクラスを継承
    initialize: function(x, y){
        Shoot.call(this, x, y, 0);
        this.addEventListener('enterframe', function(){
            // 自機の弾が敵機に当たったかどうかの判定
            for(var i in enemies){
                if(enemies[i].intersect(this)){
                    //当たっていたら敵を消去
                    this.remove(); enemies[i].remove();
                    game.score += 100; //スコアを加算
                }
            }
        });
    }
});

//敵機の撃つ弾のクラス
var EnemyShoot = enchant.Class.create(Shoot, { //弾のクラスを継承
    initialize: function(x, y){
        Shoot.call(this, x, y, Math.PI);
        this.addEventListener('enterframe', function(){
            if(player.within(this, 8)){     //プレイヤーに弾が当たったらゲームオーバー
                     game.end(game.score, "SCORE: " + game.score)
                }
        });
    }
});

window.onload = function() {
     //初期設定
    game = new Game(320, 320);
    game.fps = 24; game.score = 0; game.touched = false; game.preload('graphic.png');
    game.onload = function() {
        player = new Player(0, 152);//プレイヤーを出現させる
        enemies = [];
        game.rootScene.backgroundColor = 'black';

        game.rootScene.addEventListener('enterframe', function(){
               //ゲームを進行させる
            if(rand(100)<10){
                    //ランダムに敵キャラを登場させる
                var y = rand(320);
                var omega = y < 160 ? 1 : -1;
                var enemy = new Enemy(320, y, omega);
                enemy.key = game.frame;
                    enemies[game.frame] = enemy;
            }
            scoreLabel.score = game.score;
        });
        scoreLabel = new ScoreLabel(8, 8);
        game.rootScene.addChild(scoreLabel);
    }
    game.start();
}
