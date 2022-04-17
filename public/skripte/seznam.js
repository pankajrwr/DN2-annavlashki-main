// Globalne spremenljivke
let sifranti = {
  leto: [],
  zanr: [],
};
let filmi = [];
let allFoundGenre = [];
let allFoundYears = [];

// Premakni film iz seznama (desni del) v košarico (levi del)
const premakniFilmIzSeznamaVKosarico = (
  id,
  naslov,
  datum,
  ocena,
  trajanje,
  azuriraj
) => {
  if (azuriraj)
    $.get("/kosarica/" + id, (podatki) => {
      /* Dodaj izbran film v sejo */
    });

  // Dodaj film v desni seznam
  $("#kosarica").append(
    "<div id='" +
      id +
      "' class='film'> \
           <button type='button' class='btn btn-light btn-sm'> \
             <i class='fas fa-minus'></i> \
               <strong><span class='naslov' dir='ltr'>" +
      naslov +
      "</span></strong> \
           <i class='fas fa-calendar-days'></i><span class='datum-izdaje'>" +
      datum +
      "</span> \
          <i class='fas fa-signal'></i><span class='ocena'>" +
      ocena +
      "</ocena>\
          <i class='far fa-clock'></i><span class='trajanje'>" +
      trajanje +
      "</span> min \
            </button> \
          </div>"
  );

  // Dogodek ob kliku na film v košarici (na desnem seznamu)
  $("#kosarica #" + id + " button").click(function () {
    let film_kosarica = $(this);
    $.get("/kosarica/" + id, (podatki) => {
      /* Odstrani izbrano film iz seje */
      // Če je košarica prazna, onemogoči gumbe za pripravo računa
      if (!podatki || podatki.length == 0) {
        $("#racun_html").prop("disabled", true);
        $("#racun_xml").prop("disabled", true);
      }
    });
    // Izbriši film iz desnega seznama
    film_kosarica.parent().remove();
    // Pokaži film v levem seznamu
    $("#filmi #" + id).show();
  });

  // Skrij film v levem seznamu
  $("#filmi #" + id).hide();
  // Ker košarica ni prazna, omogoči gumbe za pripravo računa
  $("#racun_html").prop("disabled", false);
  $("#racun_xml").prop("disabled", false);
};

$(document).ready(() => {
  // Posodobi izbirne gumbe filtrov
  $.get("/filtri", (podatki) => {
    filmi = podatki.filmi;
    sifranti = podatki.sifranti
    reformattedFilmData = reformatFilmData(filmi)
    const firstGroupData  = getFirstGroupData(reformattedFilmData);
    const secondGroupData = getSecondGroupData(reformattedFilmData);
    plotChart("chartContainer", firstGroupData, secondGroupData);
    enableDisableFilms(sifranti)
  });


  function getFirstGroupData(movieData){
    firstGroupData = []
    movieData.forEach(movie => {
        firstGroupData.push(
            {
              label : movie.year,
              lineDashType: "dash",
              y : parseInt(movie.Comedy) + parseInt(movie.Family) + parseInt(movie.Romance),
              lineColor: "#FFA500",
            }
        )
    })
    return firstGroupData;
  }

  function getSecondGroupData(movieData){
    secondGroupData = []
    movieData.forEach(movie => {
      secondGroupData.push(
            {
              label : movie.year,
              legendMarkerType: "square",
              y : movie.Drama + movie.Thriller + movie.Action,
              lineColor: "#00468",
              
            }
        )
    })
    return secondGroupData.reverse();
  }

  function reformatFilmData(movieData){
    reformatedMovieData = [];
    movieData.forEach(movie =>{
        let movieYear = movie.datumIzdaje.split('-')[0];
        let roundedMovieYear = Math.floor(parseInt(movieYear)/5)*5;
        let movieGenres = movie.zanri.split(',');
        const i = reformatedMovieData.findIndex(_element => _element.year === roundedMovieYear);
        if (i > -1){
            movieGenres.forEach(genre => {
            ++reformatedMovieData[i][genre];
            })
        }
        else{
            tempObj = {
                year: roundedMovieYear,
                Action: 0,
                Adventure: 0,
                Animation:0,
                Comedy: 0,
                Crime: 0,
                Documentry: 0,
                Drama: 0,
                Family: 0,
                Fantasy: 0,
                Foreigh: 0,
                History: 0,
                Horror: 0,
                Music: 0,
                Mystery: 0,
                Romance: 0,
                "Science Fiction": 0,
                Thriller: 0,
                War: 0,
                Western: 0
            }
            movieGenres.forEach(genre => {
            tempObj[genre] = tempObj[genre]+1;
            })
            reformatedMovieData.push(tempObj)
        }
    })
    return reformatedMovieData.sort(compare)
  }

  function compare( a, b ) {
    if ( a.year > b.year ){
      return -1;
    }
    if ( a.year < b.year ){
      return 1;
    }
    return 0;
  }

  function enableDisableFilms(sifranti){
    let parametri = ["leto", "zanr"];
    parametri.forEach((parameter) => {
      $("#" + parameter + "-stevilo").html(sifranti[parameter].length);
      $("#" + parameter + "-izbira").append("<option val=''>...</option>");
      sifranti[parameter].forEach((vrednost) => {
        $("#" + parameter + "-izbira").append(
          "<option value='" + vrednost + "'>" + vrednost + "</option>"
        );
      });
    });
  }

  function plotChart(containerId, firstGroupData, secondGroupData){
    let intFirstGroupTotal = 0;
    let intSecongGroupTotal = 0;
    firstGroupData.map(data => intFirstGroupTotal = data.y + intFirstGroupTotal)
    secondGroupData.map(data => intSecongGroupTotal = data.y + intSecongGroupTotal)
    var chart = new CanvasJS.Chart(containerId, {
      title:{
        text: "Najboljši filmi čez čas" ,
        fontColor: "#580000"             
      },
      subtitles:[
        {
          text: "grupirani žanri",
          fontColor: "#009900"
        }],
      data: [              
              {
                type: "line",
                lineColor:"#FFA500",
                markerColor: "#FFA500",
                dataPoints: firstGroupData,
                showInLegend: true,
                legendText: "Komedije, družinski in romance ("+intFirstGroupTotal+")",
              },
              {
                type: "line",
                markerType: "square",
                markerColor: "#00468b",
                lineColor:"#00468b",
                dataPoints: secondGroupData,
                showInLegend: true,
                legendText: "Drame, akcije in Trilerji ("+intSecongGroupTotal+")"
              }
      ]
    });
    chart.render();
  }

  // Posodobi podatke iz košarice na spletni strani
  $.get("/kosarica", (kosarica) => {
    kosarica.forEach((film) => {
      premakniFilmIzSeznamaVKosarico(
        film.stevilkaArtikla,
        film.opisArtikla.split(" (")[0],
        film.datumIzdaje,
        film.ocena,
        film.trajanje,
        false
      );
    });
  });

  $("#leto-izbira, #zanr-izbira").change(function(event){
    const year  = $("#leto-izbira").val();
    const zenre = $("#zanr-izbira").val();
    const filteredMovies = filterMoviesByYearAndGenre(year, zenre);

    const sifranti = {
      leto: allFoundYears,
      zanr: allFoundGenre
    }
    enableDisableFields(sifranti, filteredMovies)
  })

  function enableDisableFields(sifranti, filteredMovies){
    
    $("#leto-stevilo").html(sifranti['leto'].length);
    $("#zanr-stevilo").html(sifranti['zanr'].length);

    // Disable year dropdown values
    // $("#leto-izbira option[value='"+sifranti.leto[0]+"']")
    //   .removeAttr("disabled")
    //   .siblings()
    //   .attr("disabled", "disabled");
    //   $("#leto-izbira option:first").removeAttr("disabled");

      $("#leto-izbira option").attr("disabled", "disabled")
      sifranti.leto.forEach(option => {
          $("#leto-izbira option[value='"+option+"']")
          .removeAttr("disabled")
      })
      $("#leto-izbira option:first").removeAttr("disabled");

      // Disable genre dropdown values
      $("#zanr-izbira option").attr("disabled", "disabled")
      sifranti.zanr.forEach(option => {
          $("#zanr-izbira option[value='"+option+"']")
          .removeAttr("disabled")
      })
      $("#zanr-izbira option:first").removeAttr("disabled");

      // Set transparency of movies
      $("#filmi .film").addClass('opaque');
      filteredMovies.forEach(movie => {
          $("#"+movie.id).removeClass('opaque');
      })
  }

  function getMoviesByYear(){
    filmi.filter( movie => {
        let movieYear = movie.datumIzdaje.split('-')[0]; 
        return ( Math.floor(parseInt(movieYear)/5)*5 == Math.floor(parseInt(year)/5)*5)
    })
  }

  function filterMoviesByYearAndGenre(year, genre){
      let foundGenre = [];
      let foundYears = [];
      return filmi.filter( movie => {

        let blnYearMatched = false;
        let blnGenreMatched = false;
        if(year == '...'){
          blnYearMatched = true;
        }else{
          let movieYear = movie.datumIzdaje.split('-')[0];
          blnYearMatched =  parseInt(movieYear) == parseInt(year);//Math.floor(parseInt(movieYear)/5)*5 == Math.floor(parseInt(year)/5)*5;
        }

        if(genre == '...'){
          blnGenreMatched = true;
        }else{
          blnGenreMatched = movie.zanri.includes(genre);
        }
        
        if(blnYearMatched && blnGenreMatched){
          // foundYear = [...foundYear, ]
            if(foundYears.indexOf(movie.datumIzdaje.split('-')[0]) === -1) {
              foundYears.push(movie.datumIzdaje.split('-')[0]);
          }
          allFoundYears = [...foundYears];
          foundGenre = allFoundGenre =  [...new Set([...foundGenre ,...movie.zanri.split(',')])];
          return true;
        }
        return false;
    })
  }

  function getMoviesInGenre(genre){
    return filmi.filter(movie => {
        if(movie.zanri.includes(genre)){
          allFoundGenre =  [...new Set([...allFoundGenre ,...movie.zanri.split(',')])];
          return movie.zanri.includes(genre)
        }
        return false;
    })
  }

  // Klik na film v levem seznamu sproži
  // dodajanje filma v desni seznam (košarica)
  $("#filmi .film button").click(function () {
    let film = $(this);
    premakniFilmIzSeznamaVKosarico(
      film.parent().attr("id"),
      film.find(".naslov").text(),
      film.find(".datum-izdaje").text(),
      film.find(".ocena").text(),
      film.find(".trajanje").text(),
      true
    );
  });

  // Klik na gumba za pripravo računov
  $("#racun_html").click(() => (window.location = "/izpisiRacun/html"));
  $("#racun_xml").click(() => (window.location = "/izpisiRacun/xml"));
});
