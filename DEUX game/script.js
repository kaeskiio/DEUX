// DOM AND GLOBAL VARIABLES
const oppHandDom = document.querySelector('.cpu-hand')
const playerHandDom = document.querySelector('.player-hand')

const cpuScoresDom = document.querySelector('#cpu-score')
const playerScoreDom = document.querySelector('#player-score')

const playPileDom = document.querySelector('.play-pile')
const drawPileDom = document.querySelector('.draw-pile')

const playerdeux = document.querySelector('.player-animation')
const cpudeux = document.querySelector('.cpu-animation')

const playAgainBtn = document.getElementById('play-again');

// hand arrays
const cpuHand = []
const playerHand = []

const deck = []
let playPile =[]
let cpuScores = 0
let playerScore = 0

// variables for gameplay
let isPlayerTurn = true
let isGameActive = true
let colorPickerIsOpen = false
let cpuDelay = Math.floor((Math.random() * cpuHand.length * 200) + 1500)
let gameOver = 150

//preload imgs for faster loading
const imgPreLoad = []
let preLoaded = false

const preLoadImgs = () => {
    for (let i = 0; i <= 3; i++) {
        let color
        if (i === 0) color = 'red'
        if (i === 1) color = 'green'
        if (i === 2) color = 'blue'
        if (i === 3) color = 'yellow'
        for (let n = 0; n <= 14; n++) {
            let img = new Image()
            img.src = 'images/' + color + i + '.png'
            imgPreLoad.push(img)
        }
    }

    for (let i = 0; i < imgPreLoad.length; i++) {
        playPileDom.appendChild(imgPreLoad[i])
        playPileDom.innerHTML = ''
    }
}
//#endregion

// Function to remove event listeners
const removeEventListeners = () => {
    playAgainBtn.removeEventListener('click', handlePlayAgain);
    drawPileDom.removeEventListener('click', handleDrawCard);
    playerHandDom.removeEventListener('click', handlePlayCard);
}

// Function to add event listeners
const addEventListeners = () => {
    playAgainBtn.addEventListener('click', handlePlayAgain);
    drawPileDom.addEventListener('click', handleDrawCard);
    playerHandDom.addEventListener('click', handlePlayCard);
}

// #region AUDIO
const shuffleFX = new Audio('audio/shuffle.wav')
const playCardFX = new Audio('audio/playCardNew.wav')
const playCardFX2 = new Audio('audio/playCard2.wav')
const drawCardFX = new Audio('audio/drawCard.wav')
const winRoundFX = new Audio('audio/winRound.wav')
const winGameFX = new Audio('audio/winMatch.wav')
const loseFX = new Audio('audio/lose.wav')
const plusCardFX = new Audio('audio/plusCard.wav')
const deuxFX = new Audio('audio/deux.wav')
const colorBtn = new Audio('audio/colorBtn.wav')
const playAgain = new Audio('audio/playAgain.wav')

const pickPlayCardSound = () => {
    playCardFX2.play()
}

//CARD AND DECK MANAGEMENT
class Card {
    constructor(rgb, value, points, changeTurn, drawValue, imgSrc) {
        this.color = rgb
        this.value = value
        this.points = points
        this.changeTurn = changeTurn
        this.drawValue = drawValue
        this.src = imgSrc
        this.playedByPlayer = false
    }
}

const createCard = (rgb, color) => {
    for (let i = 0; i <= 14; i++) {
        // number cards
        if (i === 0) {
            deck.push(new Card(rgb, i, i, true, 0, 'images/' + color + i + '.png'))
        }
        else if (i > 0 && i <= 9) {
            deck.push(new Card(rgb, i, i, true, 0, 'images/' + color + i + '.png'))
            deck.push(new Card(rgb, i, i, true, 0, 'images/' + color + i + '.png'))
        }
        // reverse/skip
        else if (i === 10 || i === 11) {
            deck.push(new Card(rgb, i, 20, false, 0, 'images/' + color + i + '.png'))
            deck.push(new Card(rgb, i, 20, false, 0, 'images/' + color + i + '.png'))
        }
        // draw 2
        else if (i === 12) {
            deck.push(new Card(rgb, i, 20, false, 2, 'images/' + color + i + '.png'))
            deck.push(new Card(rgb, i, 20, false, 2, 'images/' + color + i + '.png'))
        }
        else if (i === 13) {
            deck.push(new Card('any', i, 50, true, 0, 'images/wild' + i + '.png'))
        }
        else {
            deck.push(new Card('any', i, 50, false, 4, 'images/wild' + i + '.png'))
        }
    }
}

const createDeck = () => {
    // destroy previous deck
    deck.length = 0
    // create new deck
    for (let i = 0; i <= 3; i++){
        if (i === 0) {
            createCard('rgb(255, 6, 0)', 'red')
        }
        else if (i === 1) {
            createCard('rgb(0, 170, 69)', 'green')
        }
        else if (i === 2) {
            createCard('rgb(0, 150, 224)', 'blue')
        }
        else {
            createCard('rgb(255, 222, 0)', 'yellow')
        }
    }

}

const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        deck[i].playedByPlayer = false
        let j = Math.floor(Math.random() * (i + 1))
        let temp = deck[i]
        deck[i] = deck[j]
        deck[j] = temp
    }
 
    shuffleFX.play()
}
//#endregion

// #region GAME BEHAVIOURS
const cardDealer = () => {
    for (let i = 0; i < 7; i++) {
        // deal cards into cpu/player arrays
        cpuHand.push(deck.shift())       
        playerHand.push(deck.shift())

        // put cards on the DOM
        const cpuCard = document.createElement('img')
        cpuCard.setAttribute('src', 'images/card.png')
        cpuCard.setAttribute('class', 'cpu')
        oppHandDom.appendChild(cpuCard)

        const playerCard = document.createElement('img')
        playerCard.setAttribute('src', playerHand[i].src)
        playerCard.setAttribute('class', 'player')
        
        // assign cards an id = their index in the playerHand array 
        //in order to reference the correct card object
        playerCard.setAttribute('id', i)
        playerHandDom.appendChild(playerCard)
    }
}

const startPlayPile = () => {
    const playCard = document.createElement('img')
    
    // find first card that isn't an action card
    for (let i = 0; i < deck.length; i++) {
        if (deck[i].color !== "any" && deck[i].value <= 9) {
            // begin playPile array with first valid card
            playPile = deck.splice(i, 1)
            break
        }
    }

    // set playCard to correct image
    playCard.setAttribute('src', playPile[0].src)
    // play card to the playPile
    playPileDom.appendChild(playCard)
}

const renewCards = () => {
    console.log('new hand')
    isGameActive = true
    // clear hands and play pile
    oppHandDom.innerHTML = ''
    cpuHand.length = 0
    playerHandDom.innerHTML = ''
    playerHand.length = 0
    playPileDom.innerHTML = ''

    // create new deck
    createDeck()
    // shuffle deck
    shuffleDeck(deck)
    // deal cards and first play card
    cardDealer()
    // set down first play card that isn't an action card
    startPlayPile()

    if (colorPickerIsOpen) {
        hideColorPicker()
    }
}

const updatePlayPileDom = () => {
    playPileDom.innerHTML = ''

    // add played card to playPile
    const newCardImg = document.createElement('img')
    const imgSrc = playPile[playPile.length - 1].src
    newCardImg.setAttribute('src', imgSrc)
    playPileDom.appendChild(newCardImg)
}

const updateHand = (handToUpdate) => {
    let domToUpdate, cardClass;

    if (handToUpdate === cpuHand) {
        domToUpdate = oppHandDom
        cardClass = 'cpu'
        if (cpuVisible) cpuVisible = false
    }
    else {
        domToUpdate = playerHandDom
        cardClass = 'player'
    }
    
    // clear the selected dom
    domToUpdate.innerHTML = ''

    // update dom
    for (let i = 0; i < handToUpdate.length; i++) {
        let src

        if (domToUpdate === oppHandDom) {
            src = 'images/card.png'
        } 
        else {
            src = handToUpdate[i].src
        } 

        const updatedCard = document.createElement('img')
        updatedCard.setAttribute('src', src)
        updatedCard.setAttribute('class', cardClass)
        // update ID's to match playerHand indexes
        updatedCard.setAttribute('id', i)
        domToUpdate.appendChild(updatedCard)
    }

    // keep dom element from collapsing when hand is empty
    if (handToUpdate.length === 0) {
        const updatedCard = document.createElement('img')
        updatedCard.setAttribute('src', 'images/empty.png')
        updatedCard.setAttribute('class', 'empty')
        // update ID's to match playerHand indexes
        domToUpdate.appendChild(updatedCard)
    }
}

const drawCard = (handGetsCard) => {
    animateDrawCard(handGetsCard)
    // check if the deck has card to draw
    if (deck.length > 0) {
        // pull the top card
        const newCard = deck.shift()
        handGetsCard.push(newCard)
        
    }
    else {
        // shuffle playPile
        shuffleDeck(playPile)
        for (let i = 0; i <= playPile.length - 1; i++) {
            // shuffled playPile becomes the new deck
            deck.push(playPile[i])
        }
        // leave the last played card on the playPile
        playPile.length = 1

        // pull the top card from the deck
        const newCard = deck.shift()
        handGetsCard.push(newCard)
        
    }
    drawCardFX.play()
    setTimeout(() => {
        updateHand(handGetsCard)
    }, 500)
}

const animateDrawCard = (player) => {
    let playerClass
    if (player === cpuHand) playerClass = 'cpu-draw'
    else playerClass = 'player-draw'
    
    const drawCardEl = document.querySelector('#draw-card')
    drawCardEl.classList.remove('hidden')
    setTimeout(() => {
        drawCardEl.classList.add(playerClass)
        setTimeout(() => {
            drawCardEl.classList.add('hidden')
            drawCardEl.classList.remove(playerClass)
            clearInterval()
        }, 500)
    }, 30)
}

const showdeux = (deuxHand) => {
    // remove hidden class from player-deux div
    deuxHand.classList.remove('hidden')
    deuxFX.play()
    console.log('removed HIDDEN from', deuxHand)

    // add shout class
    setTimeout(() => {
        deuxHand.classList.add('shout')
        console.log('added SHOUT to', deuxHand)
        //setTimeout = after x seconds remove shout
        setTimeout(() => {
            deuxHand.classList.remove('shout')
            console.log('removed SHOUT from', deuxHand)

            setTimeout(() => {
                deuxHand.classList.add('hidden')
                console.log('added HIDDEN to', deuxHand)
            }, 1000)
        }, 1000)
    }, 10) 
}

const showColorPicker = () => {
    // show the color picker
    const colorPicker = document.getElementById('.color-picker')
    colorPicker.style.opacity = 1
    colorPickerIsOpen = true

    //assign eventHandler's to buttons
    document.getElementById('.red').addEventListener('click', (e) => {
        // pass through the class name for color
        chooseColor('rgb(255, 6, 0)')
    })
    document.getElementById('.green').addEventListener('click', (e) => {
        // pass through the class name for color
        chooseColor('rgb(0, 170, 69)')
    })
    document.getElementById('.blue').addEventListener('click', (e) => {
        // pass through the class name for color
        chooseColor('rgb(0, 150, 224)')
    })
    document.getElementById('.yellow').addEventListener('click', (e) => {
        // pass through the class name for color
        chooseColor('rgb(255, 222, 0)')
    })
}

const chooseColor = (rgb) => {
    //assign the color to the wild on top of the play pile
    colorBtn.play()
    playPile[playPile.length - 1].color = rgb

    // hide the color picker
    hideColorPicker()
    isPlayerTurn = false;
    setTimeout(playCPU, cpuDelay)
}

function hideColorPicker() {
    const colorPicker = document.querySelector('.color-picker')
    colorPicker.style.opacity = 0
    colorPickerIsOpen = false
}

const skipOrEndTurn = () => {
    // check if changeTurn or skip
    if (playPile[playPile.length - 1].changeTurn) {
        isPlayerTurn = false

        // cpu's turn
        setTimeout(playCPU, cpuDelay)
    }
}

// update player names with whose turn it is
const showTurnOnDom = () => {
    if (isPlayerTurn) {
        document.querySelector('.player-score-title').style.color = 'rgb(255, 255, 255)'
        document.querySelector('.cpu-score-title').style.color = 'rgb(255, 255, 255)'
    }
    else {
        document.querySelector('.player-score-title').style.color = 'rgb(150, 200, 238)'
        document.querySelector('.cpu-score-title').style.color = 'rgb(150, 200, 238)'
    }
}
//#endregion

//#region END OF ROUND/GAME FUNCTIONS
const tallyPoints = (loserHand) => {
    let points = 0

    for (const card of loserHand) {
        points += card.points
    }

    if (loserHand == cpuHand) {
        cpuScores += points
    }
    else {
        playerScore += points
    }
}

const updateScores = () => {
    // update cpuScoresDom
    cpuScoresDom.innerHTML = cpuScores
    if (cpuScores < gameOver / 2) {
        cpuScoresDom.style.color = 'rgb(0, 140, 0)'
    }
    else {
        cpuScoresDom.style.color = 'rgb(121, 2, 2)'
    }

    // update playerScoreDom
    playerScoreDom.innerHTML = playerScore
    if (playerScore < gameOver / 2) {
        playerScoreDom.style.color = 'rgb(0, 140, 0)'
    } 
    else {
        playerScoreDom.style.color = 'rgb(121, 2, 2)'
    }
}

const checkForWinner = () => {
    // Check if no one has lost
    let cpuTemp = cpuScores
    let playerTemp = playerScore
    if (playerScore < gameOver && cpuScores < gameOver) {
        // Check if player has no cards left
        if (playerHand.length === 0) {
            const lastCard = playPile[playPile.length - 1];
            // Check if the last card is a black card or divisible by 2
            if ((lastCard.color === 'any' || ((lastCard.value % 2 === 0) && (lastCard.value <= 10)))) {
                winRoundFX.play();
                endRound(playerHand);
            } else {
                // If the last card does not meet the winning criteria, draw a card and continue
                drawCard(playerHand);
                isPlayerTurn = true;
                playerScore = playerTemp
                cpuScores = cpuTemp
            }
        }
        // Check if CPU has no cards left
        if (cpuHand.length === 0) {
            const lastCard = playPile[playPile.length - 1];
            // Check if the last card is a black card or divisible by 2
            if ((lastCard.color === 'any' || ((lastCard.value % 2 === 0) && (lastCard.value <= 10)))) {
                loseFX.play();
                endRound(cpuHand);
            } else {
                // If the last card does not meet the winning criteria, draw a card and continue
                drawCard(cpuHand);
                isPlayerTurn = false;
                setTimeout(playCPU, cpuDelay);
                playerScore = playerTemp
                cpuScores = cpuTemp            
            }
        }
    } else {
        // Game over
        endGame();
    }
}


const showCpuCards = () => {
    if (cpuHand.length >= 1) {
        oppHandDom.innerHTML = ''
        for (let i = 0; i < cpuHand.length; i++) {
    
            // turn the cards over
            const cpuCard = document.createElement('img')
            cpuCard.setAttribute('src', cpuHand[i].src)
            cpuCard.setAttribute('class', 'cpu')
            oppHandDom.appendChild(cpuCard)
        }
    } 
}

const hideCpuCards = () => {
    if (cpuHand.length >= 1) {
        oppHandDom.innerHTML = ''
        for (let i = 0; i < cpuHand.length; i++) {
    
            // turn the cards over
            const cpuCard = document.createElement('img')
            cpuCard.setAttribute('src', 'images/card.png')
            cpuCard.setAttribute('class', 'cpu')
            oppHandDom.appendChild(cpuCard)
        }
    } 
}

const endRound = (winner) => {
    isGameActive = false;
    isPlayerTurn = !isPlayerTurn

    if (cpuHand.length > 0) showCpuCards()
    
    const endOfroundDom = document.querySelector('.end-of-round')
    const roundDom = document.querySelector('.round')
    
    // show end of round element & format it based on who won
    endOfroundDom.classList.remove('hidden')
    if (winner === playerHand) roundDom.textContent = 'You won the round!'
    else roundDom.textContent = 'CPU won the round...'
    
    // hide end of round element after 2 seconds
    setTimeout(() => {
        endOfroundDom.classList.add('hidden')
        isPlayerTurn = !isPlayerTurn
        renewCards()
        if (!isPlayerTurn) setTimeout(playCPU, cpuDelay)
        
    }, 3000)
}

const endGame = () => {
    isGameActive = false;
    if (cpuHand.length > 0) {
        showCpuCards()
    }

    const endOfGameDom = document.querySelector('.end-of-game')
    const gameDom = document.querySelector('.game')

    // show end of game element & format based on winner
    endOfGameDom.classList.remove('hidden')

    if (cpuScores < gameOver) {
        loseFX.play()
        gameDom.textContent = 'CPU won the game... Play again?'
    }  
    else {
        winGameFX.play()
        gameDom.textContent = 'You won the game! Play again?'
    }

    // add event listener to 'play again' button
    playAgainBtn.addEventListener('click', function () {
        playAgain.play()
        // hide end of game element on click
        endOfGameDom.classList.add('hidden')
        playerScore = 0
        cpuScores = 0
        listenForDevMode()
        setInterval(showTurnOnDom, 100)
        renewCards()
        updateScores()
        if (!isPlayerTurn) {
            setTimeout(playCPU, cpuDelay)
        }
    });
}
//#endregion

//#region CPU
const letCpuDrawCards = () => {
    if (playPile[playPile.length - 1].drawValue > 0) {
        // add however many cards based on drawValue of last played card
        for (let i = 0; i < playPile[playPile.length - 1].drawValue; i++) {
            drawCard(cpuHand)
        }
    }
}

const playCPU = () => {   
    if (!isPlayerTurn && isGameActive) {
        
        // create temp array of playable cards based on last card played
        const playable = determinePlayableCards()

        // if no playable cards
        if (playable.length === 0) {
            // draw card
            drawCard(cpuHand)
            // end turn
            setTimeout(() => {
                isPlayerTurn = true
                return
            }, 500)
        }
        //if one playable card
        else if (playable.length === 1) {
            setTimeout(playCPUCard, 300, playable[0])
        }
        // if more than one playable cards
        else if (playable.length > 1) {
            console.log('cpu has', playable.length, 'playable cards')
            
            let chosenCard = runStrategist(playable)
            setTimeout(playCPUCard, 300, chosenCard)
        }
    }
//#region CPU SPECIFIC FUNCTIONS
    function determinePlayableCards() {
        const playableCards = []

        console.log(playPile[playPile.length - 1])
        for (let i = 0; i < cpuHand.length; i++) {
            if (cpuHand[i].color === playPile[playPile.length - 1].color || cpuHand[i].value === playPile[playPile.length - 1].value || cpuHand[i].color === 'any' || playPile[playPile.length - 1].color === 'any') {
                let validCard = cpuHand.splice(i, 1)
                playableCards.push(validCard[0])
            }
        }
        console.log('playable cards:')
        
        return playableCards
    }
    
    function runStrategist(playable) {
        let cardIndex
            
        // run strategist to determine strategy
        let strategist = Math.random()
        if (playPile.length > 2 && (strategist > 0.7 || playerHand.length < 3 || cpuHand.length > (playerHand.length * 2) || (playPile[playPile.length - 1].playedByPlayer === true && playPile[playPile.length - 1].drawValue > 0) || (playPile[playPile.length - 2].playedByPlayer === true && playPile[playPile.length - 1].drawValue > 0))) {
            // prioritize action/high point cards
            let highestValue = 0

            for (let i = 0; i < playable.length; i++){
                if (playable[i].value > highestValue) {
                    highestValue = playable[i].value
                    cardIndex = i
                }
            }

            // play card determined by strategist
            // remove card from playable
            chosenCard = playable.splice(cardIndex, 1)

            // return playable to cpuHand
            returnPlayablesToHand()
    }
        else {
            let lowestValue = 14

            for (let i = 0; i < playable.length; i++){
                if (playable[i].value < lowestValue) {
                    lowestValue = playable[i].value
                    cardIndex = i
                }
            }

            // play card determined by strategist
            // remove card from playable
            chosenCard = playable.splice(cardIndex, 1)

            returnPlayablesToHand()           
        }

        return chosenCard[0]

        function returnPlayablesToHand() {
            if (playable.length > 0) {
                for (const card of playable) {
                    cpuHand.push(card)
                }
            }
        }
    }

    function playCPUCard(chosenCard) {
        console.log(chosenCard)
        
        //animate random card from oppHandDom
        const cpuDomCards = oppHandDom.childNodes
        cpuDomCards[Math.floor(Math.random() * cpuDomCards.length)].classList.add('cpu-play-card')
        console.log('animating CPU card')
        pickPlayCardSound()
        // debugger
        
        setTimeout(() => {
            playPile.push(chosenCard)
            // update playPileDom
            updatePlayPileDom()

            // check if cpu played wild
            if (playPile[playPile.length - 1].color === 'any' && playPile[playPile.length - 1].drawValue === 0 && playPile[playPile.length - 1].playedByPlayer === false) {
                chooseColorAfterWild()
            }

            // check cpuHand length and update oppHandDom
            if (cpuHand.length >= 1) {
                updateHand(cpuHand)
                if (cpuHand.length === 1) {
                    showdeux(cpudeux)
                }
            }
            else {
                updateHand(cpuHand)
                setTimeout(() => {
                    tallyPoints(playerHand)
                    updateScores()
                    checkForWinner()
                }, 1200)
            }

            // if cpu played a draw card
            if (chosenCard.drawValue > 0) {
                hitWithDrawCard()
                setTimeout(() => {
                    for (let i = 0; i < chosenCard.drawValue; i++) {
                        drawCard(playerHand)
                    }
                    checkChangeTurn()
                },1000)
            }
            else setTimeout(checkChangeTurn, 500)
        }, 500)
        

        function checkChangeTurn() {
            if (chosenCard.changeTurn) {
                isPlayerTurn = true
                return
            }
            else {
                setTimeout(playCPU, cpuDelay)
            }
        }
    }

    function chooseColorAfterWild() {
        const colors = ['rgb(255, 6, 0)', 'rgb(0, 170, 69)', 'rgb(0, 150, 224)', 'rgb(255, 222, 0)']
        const colorsInHand = [0, 0, 0, 0]

        // cpu checks how many of each color it has
        for (const card of cpuHand) {
            if (card.color === colors[0]) colorsInHand[0]++
            if (card.color === colors[1]) colorsInHand[1]++
            if (card.color === colors[2]) colorsInHand[2]++
            if (card.color === colors[3]) colorsInHand[3]++
        }

        // find the index of the max value
        let indexOfMax = colorsInHand.indexOf(Math.max(...colorsInHand))

        // style the wild card and it's color
        const wildCardDom = playPileDom.childNodes[0]
        wildCardDom.style.border = '5px solid ' + colors[indexOfMax]
        wildCardDom.style.width = '105px'
        playPile[playPile.length - 1].color = colors[indexOfMax]
    }
    //#endregion
}

const hitWithDrawCard = () => {
    plusCardFX.play()
    playPileDom.classList.add('shout')
    setTimeout(() => {
        playPileDom.classList.remove('shout')
    }, 1000)
}
//#endregion

const playPlayerCard = (index) => {
    let cardToPlay = playerHand.splice(index, 1)
    cardToPlay[0].playedByPlayer = true
    playPile.push(cardToPlay[0])

    // clear the playPile
    updatePlayPileDom()
}

//#region /MAIN GAME FUNCTION/
const startGame = () => {
    if (!preLoaded) {
        preLoadImgs()
        preLoaded = true
    } 

    playerScore = 0
    cpuScores = 0

    listenForDevMode()
    setInterval(showTurnOnDom, 100)
    renewCards()
    updateScores()

    if (!isPlayerTurn) {
        setTimeout(playCPU, cpuDelay)
    }


    // set event listeners on playerHandDom and drawPileDom
    // playerHandDom
    playerHandDom.addEventListener('click', (event) => {
        if (isPlayerTurn && !colorPickerIsOpen && event.target.getAttribute('id')) {

            const lastCardDom = playPileDom.childNodes[0]
            if (lastCardDom.style !== '100px') {
                lastCardDom.style.width = '100px'
                lastCardDom.style.border = 'none'
            }

            // use target's ID to find card object in array
            let index = parseInt(event.target.getAttribute('id'))
            
            // if value or color matches topOfPlayPile OR color = 'any'
            if (playerHand[index].value === playPile[playPile.length - 1].value || playerHand[index].color === playPile[playPile.length - 1].color || playerHand[index].color === 'any' || playPile[playPile.length - 1].color === 'any') {     
                
                // animate clicked card
                pickPlayCardSound()
                event.target.classList.add('play-card')

                setTimeout(() => {
                    // set topOfPlayPile to target.src
                    playPlayerCard(index)


                    // invoke cpuTurn to add cards if there are any to add
                    letCpuDrawCards()
                    
                    // check playerHand length and update DOM
                    if (playerHand.length >= 1) {
                        updateHand(playerHand)
                        if (playerHand.length === 1) showdeux(playerdeux)
                    }
                    else {
                        updateHand(playerHand)
                        setTimeout(() => {
                            tallyPoints(cpuHand)
                            updateScores()
                            checkForWinner()
                        }, 1200)
                    }

                    //check if wild
                    if (playPile[playPile.length - 1].color === 'any' && playPile[playPile.length - 1].drawValue === 0 && playPile[playPile.length - 1].playedByPlayer) {
                        // set new color
                        showColorPicker()
                        return
                    }

                    skipOrEndTurn();
                }, 1000)
                
            }
        }
    })
    
    let areYouSure = false

    drawPileDom.addEventListener('click', () => {
        if (isPlayerTurn && !colorPickerIsOpen) {
            drawCard(playerHand)
            setTimeout(() => {
                isPlayerTurn = false;
                setTimeout(playCPU, cpuDelay)
            }, 500)
        }
    })
}
//#endregion
let cpuVisible = false

const listenForDevMode = () => {
    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase()
        console.log(key)
        if (key === 'p') {
            isPlayerTurn = true;
            console.log('forced isPlayerTurn', isPlayerTurn)
        }

        if (key === 'c') {
            drawCard(cpuHand)
            updateHand(cpuHand)
        }

        if (key === 'x') {
            playerHand.pop()
            updateHand(playerHand)
        }

        if (key === 'z') {
            cpuHand.pop()
            updateHand(cpuHand)
        }

        if (key === 'w') {
            const wild = new Card('any', 13, 50, true, 0, 'images/wild13.png')
            playerHand.push(wild)
            updateHand(playerHand)
        }

        if (key === '4') {
            const wild4 = new Card('any', 14, 50, true, 4, 'images/wild14.png')
            playerHand.push(wild4)
            updateHand(playerHand)
        }

        if (key === '=') {
            playerScore += 10
            updateScores()
        }

        if (key === 's') {
            if (cpuVisible) {
                hideCpuCards()
                cpuVisible = false
            }
            else {
                showCpuCards()
                cpuVisible = true
            }
        }
    })
}

startGame()
