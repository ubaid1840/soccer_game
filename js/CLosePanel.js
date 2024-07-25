function CLosePanel(oSpriteBg) {

    var _oBg;
    var _oResultTextStroke;
    var _oResultText;
    var _oScoreText;
    var _oTitleText;
    var _oGroup;
    var _oButMenu;
    var _oButRestart;
    var _oFade;

    this._init = function (oSpriteBg) {

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.0;

        s_oStage.addChild(_oFade);

        _oGroup = new createjs.Container();
        _oGroup.alpha = 1;
        _oGroup.visible = false;
        _oGroup.y = CANVAS_HEIGHT;

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;
        _oGroup.addChild(_oBg);


        _oScoreText = new CTLText(_oGroup, 
                    CANVAS_WIDTH / 2 - 300, (CANVAS_HEIGHT / 2) - 100, 600, 30, 
                    30, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );
        _oScoreText.setStroke(5,"#ff6000");

        _oResultTextStroke = new createjs.Text("", "26px " + FONT_GAME, "#ff6000");
        _oResultTextStroke.x = CANVAS_WIDTH / 2;
        _oResultTextStroke.y = (CANVAS_HEIGHT / 2);
        _oResultTextStroke.textAlign = "center";
        _oResultTextStroke.textBaseline = "middle";
        _oResultTextStroke.outline = 4;

        _oGroup.addChild(_oResultTextStroke);

        _oResultText = new createjs.Text("", "26px " + FONT_GAME, TEXT_COLOR);
        _oResultText.x = CANVAS_WIDTH / 2;
        _oResultText.y = _oResultTextStroke.y;
        _oResultText.textAlign = "center";
        _oResultText.textBaseline = "middle";

        _oGroup.addChild(_oResultText);


        _oTitleText = new CTLText(_oGroup, 
                    CANVAS_WIDTH / 2 - 300, 104, 600, 50, 
                    50, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );
                    
        _oTitleText.setStroke(5,"#ff6000");

        s_oStage.addChild(_oGroup);

        // var oSpriteButHome = s_oSpriteLibrary.getSprite("but_home");
        // _oButMenu = new CGfxButton(CANVAS_WIDTH * 0.5 - 310, CANVAS_HEIGHT * 0.5 + 150, oSpriteButHome, _oGroup);
        // _oButMenu.addEventListener(ON_MOUSE_DOWN, this._onExit, this);

        // var oSpriteButRestart = s_oSpriteLibrary.getSprite("but_restart");
        // _oButRestart = new CGfxButton(CANVAS_WIDTH * 0.5 + 310, CANVAS_HEIGHT * 0.5 + 150, oSpriteButRestart, _oGroup);
        // _oButRestart.addEventListener(ON_MOUSE_DOWN, this._onRestart, this);
        // _oButRestart.pulseAnimation();

    };

    this.unload = function () {
        createjs.Tween.get(_oGroup).to({alpha: 0}, 500, createjs.Ease.cubicOut).call(function () {
            s_oStage.removeChild(_oGroup);
            _oButMenu.unload();
            _oButMenu = null;

            _oFade.removeAllEventListeners();

            _oButRestart.unload();
            _oButRestart = null;
        });
    };

    this.show = function (iGoalPlayer, iGoalOpponent, iPlayerTeam, iOpponentTeam, iScore) {

        var szPlayerTeam = TEXT_TEAM_CODE[iPlayerTeam];
        var szOpponentTeam = TEXT_TEAM_CODE[iOpponentTeam];

        // _oScoreText.refreshText(TEXT_TOTAL_SCORE + ": " + iScore);

        _oResultText.text = szPlayerTeam + " " + iGoalPlayer + " - " + iGoalOpponent + " " + szOpponentTeam;
        _oResultTextStroke.text = szPlayerTeam + " " + iGoalPlayer + " - " + iGoalOpponent + " " + szOpponentTeam;

        _oTitleText.refreshText(TEXT_LOSE);

        var oSpriteFlagSmall = s_oSpriteLibrary.getSprite("flags_small");

        var oFlagPlayer = new CFlag(_oResultText.x - 160, _oResultText.y, iPlayerTeam, false, oSpriteFlagSmall, _oGroup);

        var oFlagOpponent = new CFlag(_oResultText.x + 160, _oResultText.y, iOpponentTeam, false, oSpriteFlagSmall, _oGroup);

        _oGroup.visible = true;

        createjs.Tween.get(_oFade).to({alpha: 0.5}, 500, createjs.Ease.cubicOut);

        _oFade.on("click", function () {});

        createjs.Tween.get(_oGroup).wait(250).to({y: 0}, 1250, createjs.Ease.elasticOut).call(function () {
            if (s_oAdsLevel === NUM_LEVEL_FOR_ADS) {
                $(s_oMain).trigger("show_interlevel_ad");
                s_oAdsLevel = 1;
            } else {
                s_oAdsLevel++;
            }
        });
    };

    this._onRestart = function () {
        this.unload();

        createjs.Tween.get(_oFade).to({alpha: 0}, 400, createjs.Ease.cubicOut).call(function () {
            s_oStage.removeChild(_oFade);
        });

        s_oGame.restartLevel();
    };

    this._onExit = function () {
        this.unload();

        s_oGame.onExit();
    };

    this._init(oSpriteBg);

    return this;
}