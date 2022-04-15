// Globalne spremenljivke
let sifranti = {
  leto: [],
  zanr: [],
};
let filmi = [];

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
    sifranti = podatki.sifranti;
    filmi = podatki.filmi;
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
  });

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
