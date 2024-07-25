function CWinPanel(oSpriteBg, bEnd) {

    var _oBg;
    var _oResultTextStroke;
    var _oResultText;
    var _oScoreTextGoalPlayer;
    var _oScoreTextGoalOpponent;
    var _oScoreMatchText;
    var _oNewScoreText;
    var _oNewScoreText;
    var _oTitleText;
    var _oGroup;
    var _oButMenu;
    var _oButContinue;
    var _oFade;

    this._init = function (oSpriteBg, bEnd) {
        var iSizeFontSecondaryText = 24;

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



        _oTitleText = new CTLText(_oGroup, 
                    CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT_HALF - 210, 600, 40, 
                    40, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );
        _oTitleText.setStroke(5,"#ff6000");

        _oResultTextStroke = new createjs.Text("", "26px " + FONT_GAME, "#ff6000");
        _oResultTextStroke.x = CANVAS_WIDTH / 2;
        _oResultTextStroke.y = (CANVAS_HEIGHT / 2) - 90;
        _oResultTextStroke.textAlign = "center";
        _oResultTextStroke.textBaseline = "middle";
        _oResultTextStroke.outline = 5;
        _oGroup.addChild(_oResultTextStroke);

        _oResultText = new createjs.Text("", "26px " + FONT_GAME, TEXT_COLOR);
        _oResultText.x = CANVAS_WIDTH / 2;
        _oResultText.y = _oResultTextStroke.y;
        _oResultText.textAlign = "center";
        _oResultText.textBaseline = "middle";
        _oGroup.addChild(_oResultText);


        _oScoreTextGoalPlayer = new CTLText(_oGroup, 
                    CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT_HALF-20, 600, iSizeFontSecondaryText, 
                    iSizeFontSecondaryText, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );
        _oScoreTextGoalPlayer.setStroke(3,"#ff6000");


        _oScoreTextGoalOpponent = new CTLText(_oGroup, 
                    CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT_HALF+20, 600, iSizeFontSecondaryText, 
                    iSizeFontSecondaryText, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );
        _oScoreTextGoalOpponent.setStroke(3,"#ff6000");



        _oScoreMatchText = new CTLText(_oGroup, 
                    CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT_HALF+60, 600, iSizeFontSecondaryText, 
                    iSizeFontSecondaryText, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );
        _oScoreMatchText.setStroke(3,"#ff6000");         
        



        _oNewScoreText = new CTLText(_oGroup, 
                    CANVAS_WIDTH / 2 - 200, CANVAS_HEIGHT_HALF+100, 400, iSizeFontSecondaryText, 
                    iSizeFontSecondaryText, "center", TEXT_COLOR, FONT_GAME, 1,
                    0, 0,
                    " ",
                    true, true, false,
                    false );
        _oNewScoreText.setStroke(3,"#ff6000");               

        var oSpriteButContinue = s_oSpriteLibrary.getSprite("but_continue");
        // _oButContinue = new CGfxButton(CANVAS_WIDTH * 0.5 + 310, CANVAS_HEIGHT * 0.5 + 150, oSpriteButContinue, _oGroup);
        // _oButContinue.pulseAnimation();

        // if (bEnd === false) {
        //     var oSpriteButHome = s_oSpriteLibrary.getSprite("but_home");
        //     _oButMenu = new CGfxButton(CANVAS_WIDTH * 0.5 - 310, CANVAS_HEIGHT * 0.5 + 150, oSpriteButHome, _oGroup);
        //     _oButMenu.addEventListener(ON_MOUSE_DOWN, this._onExit, this);

        //     _oButContinue.addEventListener(ON_MOUSE_DOWN, this._onContinue, this);
        // } else {
        //     _oButContinue.addEventListener(ON_MOUSE_DOWN, this._onEnd, this);
        // }

        s_oStage.addChild(_oGroup);

    };

    this.unload = function () {

        s_oStage.removeChild(_oGroup);
        if (_oButMenu) {
            _oButMenu.unload();
            _oButMenu = null;
        }

        if (_oButContinue) {
            _oButContinue.unload();
            _oButContinue = null;
        }
    };

    this.show = function (iGoalPlayer, iGoalOpponent, iPlayerTeam, iOpponentTeam, oInfoScore) {

        var szPlayerTeam = TEXT_TEAM_CODE[iPlayerTeam];
        var szOpponentTeam = TEXT_TEAM_CODE[iOpponentTeam];

        _oResultText.text = szPlayerTeam + " " + iGoalPlayer + " - " + iGoalOpponent + " " + szOpponentTeam;
        _oResultTextStroke.text = szPlayerTeam + " " + iGoalPlayer + " - " + iGoalOpponent + " " + szOpponentTeam;

        _oTitleText.refreshText(TEXT_WIN);


        // _oScoreTextGoalPlayer.refreshText(TEXT_SCORE_GOAL_PLAYER + " " + oInfoScore.player_goal_score);
        // _oScoreTextGoalOpponent.refreshText(TEXT_SCORE_GOAL_OPPONENT + " " + oInfoScore.opponent_goal_score);
        // _oScoreMatchText.refreshText(TEXT_MACTH_SCORE + ": " + oInfoScore.score_match);
        // _oNewScoreText.refreshText(TEXT_TOTAL_SCORE + ": " + oInfoScore.new_score);

        var oSpriteFlagSmall = s_oSpriteLibrary.getSprite("flags_small");

        var oFlagPlayer = new CFlag(_oResultText.x - 160, _oResultText.y, iPlayerTeam, false, oSpriteFlagSmall, _oGroup);

        var oFlagOpponent = new CFlag(_oResultText.x + 160, _oResultText.y, iOpponentTeam, false, oSpriteFlagSmall, _oGroup);

        _oGroup.visible = true;

        createjs.Tween.get(_oFade).to({alpha: 0.5}, 500, createjs.Ease.cubicOut);

        createjs.Tween.get(_oGroup).wait(250).to({y: 0}, 1250, createjs.Ease.bounceOut).call(function () {
            if (s_oAdsLevel === NUM_LEVEL_FOR_ADS) {
                $(s_oMain).trigger("show_interlevel_ad");
                s_oAdsLevel = 1;
            } else {
                s_oAdsLevel++;
            }
        });

        $(s_oMain).trigger("save_score", oInfoScore.new_score);
        $(s_oMain).trigger("share_event", oInfoScore.new_score);
    };

    this._onContinue = function () {
        var oParent = this;
        createjs.Tween.get(_oGroup).to({y: CANVAS_HEIGHT}, 750, createjs.Ease.quartIn).call(function () {
            oParent.unload();
        });

        createjs.Tween.get(_oFade).to({alpha: 0}, 400, createjs.Ease.cubicOut).call(function () {
            s_oStage.removeChild(_oFade);
            _oFade.removeAllEventListeners();
        });

        _oButContinue.block(true);
        _oButMenu.block(true);

        s_oGame.onContinue(s_oStage.getChildIndex(_oGroup));
    };

    this._onEnd = function () {
        _oButContinue.block(true);
        this.unload();
        s_oGame._onEnd();
    };

    this._onExit = function () {
        this.unload();

        _oFade.off("click", function () {});

        s_oGame.onExit();
    };

    this._init(oSpriteBg, bEnd);

    return this;
}