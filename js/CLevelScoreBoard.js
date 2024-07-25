function CLevelScoreBoard(oSprite, iX, iY) {

    var _pStartPosContainer;
    var _oContainer;
    var _oBoard;
    var _oScoreText;

    this._init = function (oSprite, iX, iY) {
        _pStartPosContainer = {x: iX, y: iY};

        _oContainer = new createjs.Container();
        _oContainer.x = _pStartPosContainer.x;
        _oContainer.y = _pStartPosContainer.y;
        s_oStage.addChild(_oContainer);
        
        _oBoard = createBitmap(oSprite);
        _oBoard.x = 0;
        _oBoard.y = 0;
        _oBoard.regX = 0;
        _oBoard.regY = 0;
        _oContainer.addChild(_oBoard);

        _oScoreText = new CTLText(_oContainer, 
                    oSprite.width * 0.5 - 80, 14, 160, 22, 
                    22, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    "0 pt",
                    true, true, false,
                    false );
        _oScoreText.setStroke(3,"#ff6000");
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

    this.refresh = function (iVal) {
        _oScoreText.refreshText(iVal + " " + TEXT_PT);
    };

    this._init(oSprite, iX, iY);

    return this;
}