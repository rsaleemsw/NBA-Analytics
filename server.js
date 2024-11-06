// server.js

// Import required modules
const express = require('express');
const cron = require('node-cron');
const bodyParser = require('body-parser');
const nba = require('./public/nba');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;  // Set up the port for the server to listen on (default is 3000)


mongoose.connect('', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { fetchNBAPlayerStatistics } = require('./public/nba');

// app.js (add this after connecting to MongoDB)

const Player = require('./models/player');


// Scheduled task to fetch and update weekly stats
cron.schedule('0 0 * * 0', async () => {
  try {
      const nbaPlayerStatistics = await fetchNBAPlayerStatistics();
      for (const playerStat of nbaPlayerStatistics) {
          await Player.create({
              name: playerStat.player,
              team: playerStat.team,
              points: playerStat.points,
              // Add other relevant fields here
          });
          console.log(`Saved player ${playerStat.player} to the database.`);
      }
  } catch (error) {
      console.error('Error updating weekly stats:', error.message);
  }
});



// Use middleware to parse JSON and URL-encoded data in the request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like HTML and JS)
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to handle HTTP GET requests to the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Send the 'index.html' file as the response
});

app.get('/api/players', async (req, res) => {
  try {
    // Get player name from the request query
    const playerName = req.query.name;

    // Find the player in the database
    const player = await Player.findOne({ name: playerName });

    // Send player data as JSON response
    res.json(player);
  } catch (error) {
    console.error('Error fetching player data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to handle HTTP GET requests to evaluate the model
app.get('/evaluate_model', async (req, res) => {
  try {
    // Perform model evaluation here
    // You can call the model evaluation function or directly return some dummy data for testing purposes
    const evaluationData = {
      'Mean Squared Error (MSE)': 0.123,
      'Mean Absolute Error (MAE)': 0.456,
      'R-squared (R²)': 0.789
    };

    // Send the evaluation data as JSON response
    res.json(evaluationData);
  } catch (error) {
    console.error('Error evaluating model:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Frontend code (e.g., in a JavaScript file)
fetch('/evaluate_model') // Change this line
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // Process the data returned by the server
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });


// Set up the server to listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log a message to the console when the server is running
});
