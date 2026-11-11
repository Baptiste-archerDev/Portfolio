/* ==========================================================================
   SCRIPT AFTER EFFECTS (.JSX) - PRESENTATION PORTFOLIO
   BAPTISTE LAFFOND - DIRECTION ARTISTIQUE, EDITION ET DESIGN WEB
   ==========================================================================
   UTILISATION DANS AFTER EFFECTS :
   1. Ouvrez Adobe After Effects (toute version CC).
   2. Allez dans : Fichier > Scripts > Executer le fichier de script...
   3. Selectionnez ce fichier : Presentation_Portfolio_Baptiste_Laffond_AE.jsx
   4. Le script genere le dossier d'assets et la composition 1080p 60fps.
   ========================================================================== */

(function createPortfolioShowreel() {
    app.beginUndoGroup("Generation Presentation Portfolio Baptiste Laffond");

    try {
        var COMP_WIDTH = 1920;
        var COMP_HEIGHT = 1080;
        var COMP_PAR = 1.0;
        var COMP_DURATION = 16.0;
        var COMP_FPS = 60;

        // Palette du site (valeurs normalisees 0..1)
        var COL_CARBON   = [26/255, 26/255, 26/255];     // #1A1A1A
        var COL_SURFACE  = [34/255, 34/255, 37/255];     // #222225
        var COL_WHITE    = [245/255, 245/255, 247/255];  // #F5F5F7
        var COL_MUTED    = [154/255, 154/255, 166/255];  // #9A9AA6
        var COL_RULE     = [58/255, 58/255, 62/255];     // #3A3A3E
        var COL_RED      = [178/255, 18/255, 49/255];    // #B21231
        var COL_MINT     = [92/255, 230/255, 139/255];   // #5CE68B
        var COL_AMBER    = [217/255, 155/255, 56/255];   // #D99B38
        var COL_BLUE     = [91/255, 164/255, 245/255];   // #5BA4F5

        var proj = app.project;
        if (!proj) {
            proj = app.newProject();
        }

        var rootFolder = proj.items.addFolder("00_PORTFOLIO_BAPTISTE_LAFFOND");
        var assetsFolder = proj.items.addFolder("01_ASSETS_PORTFOLIO");
        assetsFolder.parentFolder = rootFolder;

        var scriptFile = new File($.fileName);
        var stageDir = scriptFile.parent.fsName.replace(/\\/g, "/");
        var portfolioDir = stageDir + "/portfolio";
        var mockupsDir = portfolioDir + "/creations/mockups_showreel";

        function importSafe(filePath, nameLabel) {
            var f = new File(filePath);
            if (f.exists) {
                try {
                    var io = new ImportOptions(f);
                    var item = proj.importFile(io);
                    item.name = nameLabel;
                    item.parentFolder = assetsFolder;
                    return item;
                } catch (e) {
                    return null;
                }
            }
            return null;
        }

        // Importation des visuels du portfolio
        var imgHero          = importSafe(mockupsDir + "/01_hero_accueil.png", "01_Accueil_Portfolio");
        var imgInterfaceCouv = importSafe(portfolioDir + "/INTERFACE-couv-scaled.jpg", "02_Magazine_Interface_Couv");
        var imgInterfaceDbl  = importSafe(portfolioDir + "/page-Interfake.png", "02b_Magazine_Interface_DoublePage");
        var imgUcpv          = importSafe(mockupsDir + "/03_ucpv_charte.png", "03_UCPV_Charte_Graphique");
        var imgFlech         = importSafe(mockupsDir + "/04_flechoptim_app.png", "04_FlechOptim_Application");
        var imgCartoon       = importSafe(mockupsDir + "/05_atelier_cartoon.png", "05_Illustrations_Cartoon");
        var imgMascot        = importSafe(portfolioDir + "/creations/burger-mascotte-sticker.png", "06_Mascotte_Burger");

        var mainComp = proj.items.addComp(
            "00_PRESENTATION_PORTFOLIO_1080p60",
            COMP_WIDTH,
            COMP_HEIGHT,
            COMP_PAR,
            COMP_DURATION,
            COMP_FPS
        );
        mainComp.parentFolder = rootFolder;
        mainComp.bgColor = COL_CARBON;

        // Animation douce et naturelle sans rebond artificiel
        function applyNaturalEase(prop, influence) {
            var inf = influence || 75;
            var easeIn = new KeyframeEase(0, inf);
            var easeOut = new KeyframeEase(0, inf);
            for (var k = 1; k <= prop.numKeys; k++) {
                var dim = prop.propertyValueType;
                if (dim === PropertyValueType.TwoD_SPATIAL || dim === PropertyValueType.ThreeD_SPATIAL || dim === PropertyValueType.OneD) {
                    prop.setTemporalEaseAtKey(k, [easeIn], [easeOut]);
                } else if (dim === PropertyValueType.TwoD) {
                    prop.setTemporalEaseAtKey(k, [easeIn, easeIn], [easeOut, easeOut]);
                } else if (dim === PropertyValueType.ThreeD) {
                    prop.setTemporalEaseAtKey(k, [easeIn, easeIn, easeIn], [easeOut, easeOut, easeOut]);
                }
            }
        }

        // Texte en boite (Box Text) pour garantir que le texte reste toujours dans sa zone
        function addBoundedText(comp, textStr, fontSize, fillColor, boxPos, boxSize, startTime, endTime, isBold, alignCenter) {
            var txtLayer = comp.layers.addBoxText(boxSize);
            var txtProp = txtLayer.property("Source Text");
            var txtDoc = txtProp.value;
            txtDoc.text = textStr;
            txtDoc.fontSize = fontSize;
            txtDoc.fillColor = fillColor;
            txtDoc.font = isBold ? "Arial-BoldMT" : "ArialMT";
            txtDoc.tracking = 10;
            txtDoc.justification = alignCenter ? ParagraphJustification.CENTER_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY;
            txtProp.setValue(txtDoc);

            txtLayer.inPoint = startTime;
            txtLayer.outPoint = endTime;

            // Point d'ancrage en haut a gauche de la zone de texte
            txtLayer.property("Anchor Point").setValue([-boxSize[0] / 2, -boxSize[1] / 2]);

            var p = txtLayer.property("Position");
            p.setValueAtTime(startTime, [boxPos[0], boxPos[1] + 22]);
            p.setValueAtTime(startTime + 0.55, [boxPos[0], boxPos[1]]);
            applyNaturalEase(p, 75);

            var op = txtLayer.property("Opacity");
            op.setValueAtTime(startTime, 0);
            op.setValueAtTime(startTime + 0.45, 100);
            op.setValueAtTime(endTime - 0.40, 100);
            op.setValueAtTime(endTime, 0);
            applyNaturalEase(op, 70);

            return txtLayer;
        }

        // Fond et reperes sobres
        var bgSolid = mainComp.layers.addSolid(COL_CARBON, "Fond_Carbone", COMP_WIDTH, COMP_HEIGHT, 1.0, COMP_DURATION);
        bgSolid.locked = true;

        var topLine = mainComp.layers.addSolid(COL_RULE, "Ligne_Haut", COMP_WIDTH - 220, 1, 1.0, COMP_DURATION);
        topLine.property("Position").setValue([COMP_WIDTH / 2, 86]);
        topLine.locked = true;

        var bottomLine = mainComp.layers.addSolid(COL_RULE, "Ligne_Bas", COMP_WIDTH - 220, 1, 1.0, COMP_DURATION);
        bottomLine.property("Position").setValue([COMP_WIDTH / 2, 996]);
        bottomLine.locked = true;

        var topAccentBar = mainComp.layers.addSolid(COL_RED, "Barre_Accent_Haut", COMP_WIDTH, 4, 1.0, COMP_DURATION);
        topAccentBar.property("Position").setValue([COMP_WIDTH / 2, 2]);
        topAccentBar.locked = true;

        // En-tete permanent sobre
        addBoundedText(mainComp, "Baptiste Laffond   Portfolio", 18, COL_MUTED, [110, 42], [600, 36], 0, COMP_DURATION, true, false);
        addBoundedText(mainComp, "Millau et Le Puy-en-Velay   BUT MMI", 18, COL_MUTED, [1450, 42], [360, 36], 0, COMP_DURATION, false, false);

        // ======================================================================
        // SCENE 1 (0.0s a 3.3s) : ACCUEIL ET PRESENTATION
        // ======================================================================
        addBoundedText(mainComp, "PORTFOLIO EN LIGNE", 16, COL_RED, [110, 165], [580, 35], 0.1, 3.3, true, false);
        addBoundedText(mainComp, "Baptiste\nLaffond", 78, COL_WHITE, [110, 210], [580, 200], 0.18, 3.3, true, false);
        addBoundedText(mainComp, "Direction artistique, edition et design web", 26, COL_MINT, [110, 415], [580, 60], 0.28, 3.3, true, false);
        addBoundedText(mainComp, "Je conçois des supports imprimes, des identites visuelles et des sites web clairs. Voici une selection de projets realises en BUT MMI et en association.", 21, COL_MUTED, [110, 480], [580, 130], 0.38, 3.3, false, false);
        addBoundedText(mainComp, "100 % fluide et responsive : affichage adapte aux mobiles, tablettes et ecrans larges.", 19, COL_WHITE, [110, 640], [580, 70], 0.48, 3.3, true, false);

        if (imgHero) {
            var lHero = mainComp.layers.add(imgHero);
            lHero.inPoint = 0.2;
            lHero.outPoint = 3.3;
            lHero.property("Scale").setValue([52, 52]);
            var pHero = lHero.property("Position");
            pHero.setValueAtTime(0.2, [1300, 560]);
            pHero.setValueAtTime(0.8, [1300, 535]);
            applyNaturalEase(pHero, 75);
            var opHero = lHero.property("Opacity");
            opHero.setValueAtTime(0.2, 0);
            opHero.setValueAtTime(0.65, 100);
            opHero.setValueAtTime(2.9, 100);
            opHero.setValueAtTime(3.3, 0);
        }

        // ======================================================================
        // SCENE 2 (3.3s a 6.7s) : MAGAZINE INTERFACE (PROJET ETUDIANT)
        // ======================================================================
        addBoundedText(mainComp, "EDITION ET MISE EN PAGE", 16, COL_AMBER, [110, 165], [580, 35], 3.3, 6.7, true, false);
        addBoundedText(mainComp, "Magazine\nInterface", 74, COL_WHITE, [110, 210], [580, 190], 3.38, 6.7, true, false);
        addBoundedText(mainComp, "Projet etudiant de creation d'un magazine complet, de la conception graphique au suivi d'impression.", 21, COL_MUTED, [110, 415], [580, 110], 3.48, 6.7, false, false);
        addBoundedText(mainComp, "32 pages (souvenirs et articles)  |  700 exemplaires tires  |  1 250 € recoltes via les sponsors locaux", 20, COL_AMBER, [110, 545], [580, 100], 3.58, 6.7, true, false);

        if (imgInterfaceCouv) {
            var lCouv = mainComp.layers.add(imgInterfaceCouv);
            lCouv.inPoint = 3.35;
            lCouv.outPoint = 6.7;
            lCouv.property("Scale").setValue([38, 38]);
            var pCouv = lCouv.property("Position");
            pCouv.setValueAtTime(3.35, [985, 560]);
            pCouv.setValueAtTime(3.95, [985, 535]);
            applyNaturalEase(pCouv, 75);
            var opCouv = lCouv.property("Opacity");
            opCouv.setValueAtTime(3.35, 0);
            opCouv.setValueAtTime(3.8, 100);
            opCouv.setValueAtTime(6.3, 100);
            opCouv.setValueAtTime(6.7, 0);
        }

        if (imgInterfaceDbl) {
            var lDbl = mainComp.layers.add(imgInterfaceDbl);
            lDbl.inPoint = 3.45;
            lDbl.outPoint = 6.7;
            lDbl.property("Scale").setValue([42, 42]);
            var pDbl = lDbl.property("Position");
            pDbl.setValueAtTime(3.45, [1510, 440]);
            pDbl.setValueAtTime(4.05, [1510, 415]);
            applyNaturalEase(pDbl, 75);
            var opDbl = lDbl.property("Opacity");
            opDbl.setValueAtTime(3.45, 0);
            opDbl.setValueAtTime(3.9, 100);
            opDbl.setValueAtTime(6.3, 100);
            opDbl.setValueAtTime(6.7, 0);
        }

        // ======================================================================
        // SCENE 3 (6.7s a 10.0s) : CHARTE GRAPHIQUE UCPV
        // ======================================================================
        addBoundedText(mainComp, "IDENTITE VISUELLE", 16, COL_MINT, [110, 165], [580, 35], 6.7, 10.0, true, false);
        addBoundedText(mainComp, "Charte\nUCPV", 74, COL_WHITE, [110, 210], [580, 190], 6.78, 10.0, true, false);
        addBoundedText(mainComp, "Refonte de l'identite de l'Union Cycliste du Puy-en-Velay et creation de la campagne d'affichage Le Vrai Record.", 21, COL_MUTED, [110, 415], [580, 120], 6.88, 10.0, false, false);
        addBoundedText(mainComp, "27 logos vectoriels prets pour le web et le textile  |  3 affiches de sensibilisation routiere", 20, COL_MINT, [110, 555], [580, 100], 6.98, 10.0, true, false);

        if (imgUcpv) {
            var lUcpv = mainComp.layers.add(imgUcpv);
            lUcpv.inPoint = 6.75;
            lUcpv.outPoint = 10.0;
            lUcpv.property("Scale").setValue([52, 52]);
            var pUcpv = lUcpv.property("Position");
            pUcpv.setValueAtTime(6.75, [1300, 560]);
            pUcpv.setValueAtTime(7.35, [1300, 535]);
            applyNaturalEase(pUcpv, 75);
            var opUcpv = lUcpv.property("Opacity");
            opUcpv.setValueAtTime(6.75, 0);
            opUcpv.setValueAtTime(7.2, 100);
            opUcpv.setValueAtTime(9.6, 100);
            opUcpv.setValueAtTime(10.0, 0);
        }

        // ======================================================================
        // SCENE 4 (10.0s a 13.2s) : DESIGN WEB ET ILLUSTRATIONS
        // ======================================================================
        addBoundedText(mainComp, "DESIGN WEB ET ILLUSTRATION", 16, COL_BLUE, [110, 165], [580, 35], 10.0, 13.2, true, false);
        addBoundedText(mainComp, "Outils web\net dessin", 74, COL_WHITE, [110, 210], [580, 190], 10.08, 13.2, true, false);
        addBoundedText(mainComp, "Developpement de FlechOptim pour calculer le spine des fleches en tir a l'arc, accompagne de mes projets d'illustration et de mascottes.", 21, COL_MUTED, [110, 415], [580, 130], 10.18, 13.2, false, false);
        addBoundedText(mainComp, "Interface 100 % fluide et responsive, accessible a tous sur telephone comme sur ordinateur.", 20, COL_BLUE, [110, 565], [580, 100], 10.28, 13.2, true, false);

        if (imgFlech) {
            var lFlech = mainComp.layers.add(imgFlech);
            lFlech.inPoint = 10.05;
            lFlech.outPoint = 13.2;
            lFlech.property("Scale").setValue([38, 38]);
            var pFlech = lFlech.property("Position");
            pFlech.setValueAtTime(10.05, [1030, 560]);
            pFlech.setValueAtTime(10.65, [1030, 535]);
            applyNaturalEase(pFlech, 75);
            var opFlech = lFlech.property("Opacity");
            opFlech.setValueAtTime(10.05, 0);
            opFlech.setValueAtTime(10.5, 100);
            opFlech.setValueAtTime(12.8, 100);
            opFlech.setValueAtTime(13.2, 0);
        }

        if (imgCartoon) {
            var lCart = mainComp.layers.add(imgCartoon);
            lCart.inPoint = 10.15;
            lCart.outPoint = 13.2;
            lCart.property("Scale").setValue([38, 38]);
            var pCart = lCart.property("Position");
            pCart.setValueAtTime(10.15, [1555, 560]);
            pCart.setValueAtTime(10.75, [1555, 535]);
            applyNaturalEase(pCart, 75);
            var opCart = lCart.property("Opacity");
            opCart.setValueAtTime(10.15, 0);
            opCart.setValueAtTime(10.6, 100);
            opCart.setValueAtTime(12.8, 100);
            opCart.setValueAtTime(13.2, 0);
        }

        // ======================================================================
        // SCENE 5 (13.2s a 16.0s) : CONTACT ET LIEN DU SITE
        // ======================================================================
        addBoundedText(mainComp, "DISPONIBLE EN STAGE ET ALTERNANCE", 18, COL_MINT, [460, 260], [1000, 40], 13.2, 16.0, true, true);
        addBoundedText(mainComp, "Baptiste Laffond", 92, COL_WHITE, [360, 320], [1200, 120], 13.28, 16.0, true, true);
        addBoundedText(mainComp, "Direction artistique, edition et design web", 28, COL_MUTED, [460, 455], [1000, 50], 13.36, 16.0, false, true);
        addBoundedText(mainComp, "baptiste-archerdev.github.io/Portfolio-LAFFOND-Baptiste", 26, COL_WHITE, [410, 555], [1100, 55], 13.44, 16.0, true, true);
        addBoundedText(mainComp, "laffondbaptiste47@gmail.com     Millau et Le Puy-en-Velay", 20, COL_MUTED, [460, 645], [1000, 45], 13.52, 16.0, false, true);

        if (imgMascot) {
            var lMasc = mainComp.layers.add(imgMascot);
            lMasc.inPoint = 13.3;
            lMasc.outPoint = 16.0;
            lMasc.property("Scale").setValue([18, 18]);
            var pMasc = lMasc.property("Position");
            pMasc.setValueAtTime(13.3, [COMP_WIDTH / 2, 815]);
            pMasc.setValueAtTime(13.85, [COMP_WIDTH / 2, 795]);
            applyNaturalEase(pMasc, 75);
            var opMasc = lMasc.property("Opacity");
            opMasc.setValueAtTime(13.3, 0);
            opMasc.setValueAtTime(13.75, 100);
        }

        mainComp.openInViewer();

        alert("Presentation Portfolio Baptiste Laffond generee !\n\nComposition : 00_PRESENTATION_PORTFOLIO_1080p60 (1920x1080, 60 fps, 16s).");

    } catch (err) {
        alert("Erreur lors de la creation du script After Effects : " + err.toString() + " (Ligne " + err.line + ")");
    } finally {
        app.endUndoGroup();
    }
})();
