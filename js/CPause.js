function CPause() {

    var _oContainer;
    var _oFade;

    this._init = function () {
        var oContainer = new createjs.Container();
        oContainer.alpha = 0;

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;

        var oHitArea = new createjs.Shape();
        oHitArea.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        _oFade.hitArea = oHitArea;
        _oFade.on("click", function () {});

        oContainer.addChild(_oFade);


        var oPauseText = new CTLText(oContainer, 
                    CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT * 0.5 - 130, 600, 50, 
                    50, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    TEXT_PAUSE,
                    true, true, false,
                    false );
        oPauseText.setStroke(5,"#ff6000");

        var oSpriteContinue = s_oSpriteLibrary.getSprite("but_continue");
        var oButContinue;
        oButContinue = new CGfxButton(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5 + 70, oSpriteContinue, oContainer);
        oButContinue.addEventListenerWithParams(ON_MOUSE_UP, this._onLeavePause, this, oContainer);

        s_oStage.addChild(oContainer);

        createjs.Tween.get(oContainer).to({alpha: 1}, 300, createjs.quartOut);

    };

    this.unload = function () {
        _oFade.off("click", function () {});
        s_oStage.removeChild(_oContainer);
    };

    this._onLeavePause = function (oContainer) {
        createjs.Tween.get(oContainer).to({alpha: 0}, 300, createjs.quartIn).call(function () {
            s_oInterface.unloadPause();
            s_oGame.unpause(true);
        });
    };

    this._init();

    return this;
}