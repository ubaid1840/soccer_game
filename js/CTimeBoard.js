function CTimeBoard(oSprite, iX, iY) {

    var _pStartPosContainer;
    var _oContainer;
    var _oTimeBoard;
    var _oTimeText;
    var _oTimeTextStroke;

    this._init = function (oSprite, iX, iY) {
        _pStartPosContainer = {x: iX, y: iY};

        _oContainer = new createjs.Container();
        _oContainer.x = _pStartPosContainer.x;
        _oContainer.y = _pStartPosContainer.y;

        _oTimeBoard = createBitmap(oSprite);
        _oTimeBoard.x = 0;
        _oTimeBoard.y = 0;
        _oTimeBoard.regX = 0;
        _oTimeBoard.regY = 0;

        _oContainer.addChild(_oTimeBoard);


        _oTimeText = new CTLText(_oContainer, 
                    oSprite.width * 0.5 - 75, 14, 150, 22, 
                    22, "left", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    TEXT_TIME + ": 0",
                    true, true, false,
                    false );
        _oTimeText.setStroke(3,"#ff6000");  

        s_oStage.addChild(_oContainer);

    };

    this.getStartPosition = function () {
        return _pStartPosContainer;
    };

    this.setPosition = function (iX, iY) {
        _oContainer.x = iX;
        _oContainer.y = iY;
    };

    this.unload = function () {
        s_oStage.removeChild(_oContainer);
    };

    this.refresh = function (szText) {
        _oTimeText.refreshText(szText);
    };

    this._init(oSprite, iX, iY);

    return this;
}