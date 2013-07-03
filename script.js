enchant();
window.onload = function(){
    //ゲームオブジェクトの生成
    var game = new Game(320,320);
    game.fps = 16;
    
    //画像の読み込み
    game.preload('http://enchantjs.com/assets/images/chara1.gif');
    
    //ロード完了時に呼ばれる
    game.onload = function() {
        //スプライトの生成
        var bear  = new Sprite(32,32);
        bear.image = game.assets['http://enchantjs.com/assets/images/chara1.gif'];
        bear.tick = 0;
        bear.anim = [10,11,10,12];
        game.rootScene.addChild(bear);
        
        //スプライトの定期処理
        bear.addEventListener(Event.ENTER_FRAME,function(){
            //スプライトのフレームの指定
            bear.tick++;
            bear.frame = bear.anim[bear.tick % 4];
            
            //右向き
            if (bear.scaleX == 1){
                bear.x += 3;
                //向き変更
                if (bear.x > 320 - 32) bear.scaleX = -1;
            }
            //左向き
            else {
                bear.x -= 3;
                //向き変更
                if (bear.x < 0) bear.scaleX = 1;
            }
        });
    };
    
    //ゲームの開始
    game.start();
};
