import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid, Card, CardMedia } from "@material-ui/core";
import * as Constants from "./constants";
import { purple, blue, orange } from "@material-ui/core/colors";
import { motion } from "framer-motion";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 50,
  },
  card: {
    height: 240,
    width: 165,
    cursor: "pointer",
  },
  media: {
    height: 240,
  },
  title: {
    paddingBottom: 20,
  },
  result: {
    color: orange[500],
    paddingBottom: 50,
  },
}));

function App() {
  const classes = useStyles();

  // All the cards to assign to two players
  const [cards, setCards] = useState([]);
  // Whether a particular card is flipped or not
  const [showing, setShowing] = useState({});
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const setCardsInitialShowingState = () => {
    const initialShowingState = {};
    for (var i = 0; i < Constants.totalCardsToDisplay; i++) {
      initialShowingState[i] = false;
    }
    setShowing(initialShowingState);
  };

  const calcScore = (atk, def) => {
    if (atk > def) {
      return atk;
    } else {
      return def - atk;
    }
  };

  // Get cards information from API
  const fetchAllCards = async () => {
    try {
      const stapleCards = await fetch(Constants.NORMAL_MONSTER_CARDS);
      const cardsJson = await stapleCards.json();
      const cardsData = cardsJson["data"];
      const cards = [];
      for (var i = 0; i < Constants.totalCardsToDisplay; i++) {
        // Pick a random card from all the cards fetched and store it in "cards"
        const cardIndex = Math.floor(Math.random() * cardsData.length - 1);
        cards.push(cardsData[cardIndex]);
      }
      setCards(cards);
    } catch (err) {
      console.log(err);
    }
  };

  // Set card's "showing" to "true" and calculate player's new score
  const flipCard = (cardIndex) => {
    if (showing[cardIndex] === true) {
      // card is already flipped, just return
      return;
    }
    setShowing({
      ...showing,
      [cardIndex]: true,
    });
    const isPlayer1Card = cardIndex < Constants.totalCardsToDisplay / 2;
    const cardScore = calcScore(
      cards[cardIndex]["atk"],
      cards[cardIndex]["def"]
    );
    if (isPlayer1Card) {
      setPlayer1Score((prevScore) => prevScore + cardScore);
    } else {
      setPlayer2Score((prevScore) => prevScore + cardScore);
    }
  };

  useEffect(() => {
    setCardsInitialShowingState();
    fetchAllCards();
  }, []);

  const showFinalResult = () => {
    let showResult = true;
    Object.values(showing).forEach((cardIsShowing) => {
      if (!cardIsShowing) showResult = false;
      return;
    });
    if (showResult) {
      return (
        <Typography variant="h2" component="h2" className={classes.result}>
          {player1Score > player2Score ? "Player one won!" : "Player two won!"}
        </Typography>
      );
    }
  };

  const displayPlayerCards = (playerNumber) => {
    let playerCardsIndexes;
    const isFirstPlayer = playerNumber === 1;
    const halfCardsNumber = Constants.totalCardsToDisplay / 2;
    if (isFirstPlayer) {
      playerCardsIndexes = [...Array(halfCardsNumber).keys()];
    } else {
      playerCardsIndexes = Array.from(
        { length: halfCardsNumber },
        (_, i) => i + halfCardsNumber
      );
    }
    return (
      <Grid item xs={6}>
        <Grid container justify="center">
          <Typography className={classes.title} variant="h4" component="h2">
            Player {playerNumber}'s score:{" "}
            {isFirstPlayer ? player1Score : player2Score}
          </Typography>
        </Grid>
        <Grid container justify="center" spacing={3}>
          {playerCardsIndexes.map((cardIndex) => (
            <Grid key={cardIndex} item>
              <motion.div
                whileHover={{ scale: 1.1 }}
                animate={{
                  x: showing[cardIndex] ? (isFirstPlayer ? 40 : -40) : 0,
                  y: showing[cardIndex] ? 300 : 0,
                  duration: 2,
                }}
                onClick={() => flipCard(cardIndex)}
              >
                <Card
                  className={classes.card}
                  style={{
                    backgroundColor: isFirstPlayer ? purple[200] : blue[500],
                  }}
                >
                  {showing[cardIndex] ? (
                    <CardMedia
                      className={classes.media}
                      image={cards[cardIndex]["card_images"][0]["image_url"]}
                    />
                  ) : (
                    <></>
                  )}
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container justify="center" className={classes.root}>
      {showFinalResult()}
      <Grid container>
        {displayPlayerCards(1)}
        {displayPlayerCards(2)}
      </Grid>
    </Grid>
  );
}

export default App;
