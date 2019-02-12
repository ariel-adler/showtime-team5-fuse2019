// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const rp = require('request-promise-native');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));


  //const allMovies = request.get('https://yts.am/api/v2/list_movies.json')
  //.then(res => res.json()).then(res => res.data.movies);

  // const allMovies = getAllMovies();
  // console.log('movies: ' + allMovies);


  try{
    console.log('request.body.queryResult.parameters:', request.body.queryResult.parameters);
    const genre = request.body.queryResult.parameters["movie-genre"];
    console.log('genre: ' + genre);
  } catch(e){}

  /*  function getAllMovies(){
      var options = {
         uri: 'https://yts.am/api/v2/list_movies.json',
         json: true
       };
       return rp(options)
         .then(res => {
             console.log('movies list: ',res);
       }).catch(error => {
         console.log('error get all movies');
       });
    }*/


  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function findMovie(agent) {
    console.log('findMovie start...');
    var genre = agent.parameters["movie-genre"];

    var options = {
      uri: 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&language=en-US&with_genres=28&api_key=dbdeb8c11aff490bb50b7b555bd20488',
      json: true
    };
    return rp(options)
        .then(res => { // promise
          console.log('movies promise res: ',res);
          const arr = res.results;
          const str = arr.map((m,i) => `${i+1}) ${m.title} (score: ${m.vote_average})`).join('\n');
//       const theList = JSON.stringify(str);
          console.log(str);
          agent.add('Movies:');
          agent.add(str);
        }).catch(error => {
          console.log('error findMovie');
        });

    //const movieList = allMovies.filter(movie => movie.genres.includes(genre));

//    const movieList = [
//    {name:"movie1", genre:genre},
//      {name:"movie2", genre:genre},
//      {name:"movie56", genre:genre}
//    ];

    //agent.add(`Available movies for genre ` + genre + ' are: ' + movieList.toString());
    //agent.add(`findMovie!`);

  }

  function getGenre(agent) {
    console.log('getGenre start...');
    var options = {
      uri: 'https://api.themoviedb.org/3/genre/movie/list?api_key=9aee34c8e909ac4459bb9c2d0ff6dd41&language=en-US',
      json: true
    };
    return rp(options)
        .then(res => { // promise
          console.log('genere promise res: ',res);
          const str = res.genres.map((gen, i) => `${i+1}) ${gen.name}`).join('\n');
          console.log(str);
          agent.add('What genre would you like?');
          agent.add(str);
        }).catch(error => {
          console.log('error getGenre');
        });
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
//  intentMap.set('test5', welcome);
  // intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('watch-a-movie', findMovie);
  intentMap.set('genres', getGenre);

//  intentMap.set('watch-a-movie', getGenre);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
