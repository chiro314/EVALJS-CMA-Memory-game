
//DATA :

const rowSigns = document.getElementById("row-signs"); //for the 12 astrological signs
const divRowSigns = document.getElementById("div-row-signs"); //for the 12 astrological signs

const rowJetons = document.getElementById("row-jetons"); //for the 24 (or less) jetons (token).
const divRowJetons = document.getElementById("div-row-jetons"); //for the 24 (or less) jetons (token).

//level :
let level = 12; //between 2 and 12 couples to be found. Actually 3 levels (12, 8 and 4) in the listbox.
const selectLevel = document.getElementById('select-level');

//Score display :
const tabHonors = [ "Egaré", "Fainéant", "Paresseux", "Molasson", "Véléitaire", "Opiniâtre", "Ambitieux",
                    "Junior", "Confirmé", "Plénipotentiaire", "Exceptionnel", "Hors Norme", "Phénoménal"];
let score = 0; //number of pairs of twins discovered during the game.
const rowScore = document.getElementById("row-score"); //score display.
const spanScore = document.getElementById("span-score"); //score display.
const spanHonor = document.getElementById("span-honor"); //score display.
let timeCount = 0; //duration of the game in seconds.
let game = 0; //number of the game for the history
let nbClics = 0; //number of clicks (or double clicks) in the game 
const divHisto = document.getElementById("div-histo"); //to display the history of the successive games.

//Astrological signs :
const tabSignesNames = ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"];
const tabSignesImages = ["belier.png", "taureau.png", "gemeaux.png", "cancer.png", "Lion.png", "vierge.png", "balance.png", "scorpion.png", "sagittaire.png", "capricorne.png", "verseau.png", "poissons.png"];

//Jetons :
let tabGameSignesImages = []; //the couples of images selected for the game
let tabGameSignesImagesRandom = [];  //the couples of images selected for the game, in a random order
let instancesTable = [];    //array of the jetons objects (the indice is the number of the object)
let shownJetonNumber = -1; //number of the jeton shown if exists.
const WAITINGTIME = 2000; //time needed for memorization before the 2 wrong jetons are hiden.

//Buttons :
const btInstancier = document.getElementById("bt-instancier");
const btAccueil = document.getElementById("bt-accueil");

let gameIn = false; //to manage the buttons and the navigation.
let gameOver = false;  //to manage the buttons and the navigation.

//clicks :
let clickAllowed = true; //to prevent clicks while 2 jetons are shown.

//OBJECT JETON :

let jeton = {
    "number" : -1, //the index in "instancesTable"
    "id" : "", // = "jeton_"+number
    "image" : "", //the file of the sign.

    "live" : "revers.png", //the file of the image to be displayed : revers = hiden ; the sign (recto) ; blanc = nothing but a ghost planet
    
    //Display the jeton on the screen :
    createIHM : function() {
        divRowJetons.innerHTML+=
            '<div class="text-center" onclick="HTMLselection('+
            this.number+
            ');" ondblclick="HTMLselection('+
            this.number+
            ');" id="jeton_'+
            this.number+
            '")><img class="img-jeton" src="'+
            this.live+
            '" alt="'+
            this.live+
            '"></div>';
    },

    //Change the image of an object displayed on the screen :
    majIHM : function() {
        var myDivJeton = null;
        myDivJeton = document.getElementById(this.id);

        myDivJeton.innerHTML=
            '<img class="img-jeton" src="'+
            this.live+
            '" alt="'+
            this.live+
            '">'
        ;
    }
};

//FUNCTIONS :

//Level initialization :
function levelInit(){
    selectLevel.innerHTML='<option value="12">PRISE DE TÊTE</option>';
    selectLevel.innerHTML+='<option value="8">DÉLASSEMENT</option>';  
    selectLevel.innerHTML+='<option value="4">INITIATION</option>'; 
}
/* This version propose all the values from 2 to 12 pairs to be found :
function levelInit(){
    //Level initialization :
    selectLevel.innerHTML+="";
    for(i=tabSignesImages.length ; i > 1 ; i--) {
        selectLevel.innerHTML+=
            '<option value="'+
            i+
            '">'+
            i+
            '</option>'
        ;
    }
}
*/

//Home page : initialization of the 12 astrological signs :
function showSignsInit(){  
    
    //the 12 astrological signs are created in the HTML :
    divRowSigns.innerHTML="";
    
    for(i=0;i<tabSignesNames.length;i++){
        divRowSigns.innerHTML+=
        '<div class="text-center"><img class="img-signe d-block" src="'+
        tabSignesImages[i]+
        '" alt="'+
        tabSignesNames[i]+
        '"><p class="ml-4 mt-2">'+
        tabSignesNames[i]+
        '</p></div>';
    }

    //Display the right row and button (div) :
    btAccueil.style.display="none";
    rowJetons.style.display="none";
    rowScore.style.display="none";

    rowSigns.style.display="block";
    btInstancier.style.display="block";

    //To manage buttons and navigation :
    gameIn=false;
    gameOver = false;
}

//Built a tab at random and return it :
function aleaTab(tableau){
    
    //indexes miror :
    index = [];
    for(i=0; i<tableau.length;i++) index[i] = i;

    //Mixing the indexes : a number is taken at random, then a second one is taken at random from the remaining numbers, and so on until the numbers run out :  
    indexAlea = [];
    for(i=tableau.length -1; i>-1; i--) indexAlea[tableau.length-1-i] = index.splice(Math.floor(Math.random() * (i+1)),1);

    //Then a new reference table is built, using the randomized numbers :
    maBanqueAlea = [];
    for(i=0; i<tableau.length;i++) maBanqueAlea[i] = tableau[indexAlea[i]];
    return maBanqueAlea;
}

//The score screen is always displayed at the end of the game, even when the game is given up :
function showScore(){
    clearTimeout(); //Timeout of the hourglass for the curent game.
    let minutes = Math.floor(timeCount/60);
    let secondes = timeCount%60;

    game+=1;

    let essais = Math.floor(nbClics/2); //a try needs 2 clicks (one for each jeton).

    //The honor's rank depends on the level (proration)
    //Math.min helps to manage the highest honor (not to go out of the honors)
    let honorNumber = Math.min(Math.floor(score * tabHonors.length / level), tabHonors.length - 1);
    
    //Undisplay the wrong screens :
    btInstancier.style.display="none";
    rowSigns.style.display="none";
    rowJetons.style.display="none";

    //Display data :
    btAccueil.style.display="block";
    spanScore.innerText = score;
    spanHonor.innerText = tabHonors[honorNumber];
    divHisto.innerHTML+=
        "<p>"+
        game+ 
        " - Grand Astroloque "+
        tabHonors[honorNumber]+
        " : "+
        score+
        "/"+
        instancesTable.length/2+
        " en "+
        essais+
        " essais, "+
        minutes+
        " minutes et "+
        secondes+
        " secondes</p>";
    rowScore.style.display="block";
    
    gameOver = true; //To manage navigation.
}

//To calculate the duration of a game :
function hourglass(){
    timeCount+=1;
    setTimeout(hourglass, 1000);
}

//PROGRAM :

//Level select box is setup once and for all : 
levelInit();

//Home page initialization (12 astrological signs) :
showSignsInit();

//EVENTS :

//"C'est parti" button => beginning of a game :
btInstancier.addEventListener("click", function(){ 
    if(!gameIn){
        //Get the level :
        level = parseInt(selectLevel.value);

        //Built a level*2 images tab, at random :
        divRowJetons.innerHTML="";
        instancesTable = [];

        //using the level to build the input tab :
        var tabSignesImagesDraft1 = aleaTab(tabSignesImages);
        var tabSignesImagesDraft2=[];
        for (i=0;i<level;i++) tabSignesImagesDraft2[i] = tabSignesImagesDraft1[i];
                
        tabGameSignesImages = tabSignesImagesDraft2.concat(tabSignesImagesDraft2); 

        //No further change despite the input of the level...

        tabGameSignesImagesRandom = [];
        tabGameSignesImagesRandom = aleaTab(tabGameSignesImages);
        
        //Instantiate objects :

        //Create, show & record the jetons objects for this game :
        instancesTable = [];
        for(i=0;i<tabGameSignesImagesRandom.length;i++){ 

            var myJeton = Object.create(jeton);
            myJeton.number = i; 
            myJeton.id = "jeton_"+i; 
            myJeton.image = tabGameSignesImagesRandom[i];
            myJeton.live = "revers.png";
            myJeton.createIHM();

            instancesTable.push(myJeton); 
        }
        // Display the good sreen and buttons :
        btInstancier.style.display="none";
        rowSigns.style.display="none";
        rowScore.style.display="none";

        btAccueil.style.display="block";
        rowJetons.style.display="block";

        gameIn=true; //to manage buttons's clicks
        clickAllowed = true;  //to manage jetons's clicks
        nbClics = 0; //for the score screen history
        shownJetonNumber = -1; //to know if a jeton has already been fliped
        score = 0;  //number of discovered pairs (for the screen history)

        //Timer for this game (for the screen history) :
        timeCount = 0;
        hourglass();
    }
}, false);

//"Accueil" button events :
btAccueil.addEventListener("click", function(){ 
    
    if(gameOver) showSignsInit();  //Back to "Accueil" screen
    else showScore();  //Show the score (even when the game is given up)

}, false);

//Events from HTML (click and double click on jetons) : 
function HTMLselection(num){
    
    if (clickAllowed){
        clickAllowed = false; //to cancel other clicks while managing the click on the jeton

        if(instancesTable[num].live == "revers.png"){
            //Show the jeton face :

            instancesTable[num].live = instancesTable[num].image;
            instancesTable[num].majIHM();

            //If another jeton is shown :
            if(shownJetonNumber != -1){
                setTimeout(waitAndGo,WAITINGTIME,num); //waiting for 2 seconds to memorize the 2 jetons
                return null; //go out of the function not to interfere with the data below (the same data is managed at the end of the waitAndGo function)
                //(to manage the asynchronous JS behaviour).
            }
            else {
                shownJetonNumber = num;
            }
        }
        //else nothing to do

        nbClics+=1;
        clickAllowed = true;
    }
    //else nothing to do;
}

//Two seconds later, the two shown jetons are managed :
function waitAndGo(num){
    
    //If the 2 jetons are twins then make the 2 jetons disappeared :
    if (instancesTable[num].image == instancesTable[shownJetonNumber].image){
        
        instancesTable[num].live = "blanc.png";
        instancesTable[num].majIHM();
        instancesTable[shownJetonNumber].live = "blanc.png";
        instancesTable[shownJetonNumber].majIHM();

        score+=1;

        //If there are no jetons left then show the score :
        if(score >= instancesTable.length/2) showScore();
    }
    else{ //It is not a pair of twins then put back the 2 jetons on the reverse side :
        
        instancesTable[num].live = "revers.png";
        instancesTable[num].majIHM();
        instancesTable[shownJetonNumber].live = "revers.png";
        instancesTable[shownJetonNumber].majIHM();
    }
    shownJetonNumber = -1; //No jeton is shown at this tima.

    nbClics+=1;
    clickAllowed = true;
}