enchant();

var player;
var enemies = [];
var bg;
var scorelabel;

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
        
          game.rootScene.addEventListener('touchstart',
                function(e){ player.x = e.x; game.touched = true; });
        game.rootScene.addEventListener('touchend',
                function(e){ player.x = e.x; game.touched = false; });
        game.rootScene.addEventListener('touchmove',
                function(e){ player.x = e.x; });
        
        this.addEventListener('enterframe', function(){
            if(game.touched && game.frame % 3 == 0){     //3フレームに一回、自動的に撃つ
                     var s = new PlayerShoot(this.x, this.y); }
        });
        game.rootScene.addChild(this);
    }
});
//敵のクラス(倒せない)
var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, omega){
        enchant.Sprite.call(this, 64, 64);
        this.image = game.assets['space1.png'];
        this.x = x; this.y = y; this.frame = 0; this.time = 0;
       
          this.omega = omega*Math.PI / 180; //ラジアン角に変換
          this.direction = 0; this.moveSpeed = 4;

          //敵の動きを定義する
        this.addEventListener('enterframe', function(){
            this.direction += this.omega;
            this.x -= this.moveSpeed ;
           

               //画面外に出たら消える
            if(this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height){
                this.remove();
            
            }
            
              //自機への当たり判定
            if(player.within(this, 20)){     //プレイヤーに当たったらゲームオーバー
                     game.end(game.score, "SCORE: " + game.score)
                }
        });
        
        game.rootScene.addChild(this);
    },
    remove: function(){
        game.rootScene.removeChild(this);
        delete enemies[this.key]; delete this;
    }
     
});

//敵のクラス（倒せる）

var Enemy2 = enchant.Class.create(enchant.Sprite, {
    initialize: function(x, y, omega){
        enchant.Sprite.call(this, 16, 16);
        this.image = game.assets['graphic.png'];
        this.x = x; this.y = y; this.frame = 6; this.time = 0;
       
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
            }else if(this.time++ % 100 == 10){ //10フレームに一回、撃つ
                var s = new EnemyShoot(this.x, this.y);
            }
                //自機への当たり判定
            if(player.within(this, 8)){     //プレイヤーに当たったらゲームオーバー
                     game.end(game.score, "SCORE: " + game.score)
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
            if(player.within(this, 8)){this.remove();}
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

//背景クラス
var Background = enchant.Class.create(enchant.Sprite,{
    initialize: function(){
        //ちょっと大きめの背景を用意する
        enchant.Sprite.call(this,640,340);
        this.x=0;
        this.y=0;
        this.image=game.assets['bg.png'];
        this.label = new Label("score：0");
        this.label.color = "#FFFFFF";
        game.rootScene.addChild(this.label);
        this.addEventListener('enterframe',function(){
            
            //背景をスクロール
            this.x--;
            //端まで来たら背景を巻き戻すを繰り返し
            if(this.x<=-320)this.x=0;
            this.labe = "score： " + game.score;
            //
            if(rand(100) < 10){
                var y = rand(320);
                var omega = y < 160 ? 1 : -1;
                var num = rand(100);
                var enemy = (num > 40)? new Enemy(320, y, omega) : new Enemy2(320, y, omega);
                enemy.key = game.frame;
                enemies[game.frame] = enemy;
            }
            game.score += 5;
        });
        game.rootScene.addChild(this);
    }
});

window.onload = function() {
    game = new Game(320, 320);
    game.fps = 24;
    game.score = 0;
    game.touched = false;
    game.preload('space1.png','graphic.png','space.png','bg.png');
    game.onload = function(){
        title = new Sprite(320, 320);
        title.image = game.assets['space.png'];
        game.rootScene.addChild(title);
        title.ontouchstart = function(){
            title.visible = false;
            bg = new Background();
            player = new Player(0, 152);
        }
    }
    game.start();
}
