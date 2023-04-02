$(function() {
	$(".movies-list__slider").slick({
		variableWidth: true,
		prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
		nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>'
	});


	var API = "https://api.themoviedb.org/3/";
	var KEY = "4ba13f07eb7d66f818df7d9bf080d2e8";
	var BACKDROP = "http://image.tmdb.org/t/p/original";
	var POSTER = "http://image.tmdb.org/t/p/w342";
	var MODAL_POSTER = "http://image.tmdb.org/t/p/w500";

	$.ajax(API + "discover/movie?api_key=" + KEY + "&language=pt-BR")
		.done(function(res){
			// Filme principal
			var mainMovie = res.results[0];
			mountMainMovie(mainMovie);

			// Lista de filmes populares
			var listMovies = res.results.slice(1);
			mountListSlider(listMovies, "#slider-popular");
		});

	$.ajax(API + "discover/tv?api_key=" + KEY + "&language=pt-BR")
		.done(function(res){
			mountListSlider(res.results, "#slider-tv");
		});
	
	$.ajax(API + "discover/movie?api_key=" + KEY + "&language=pt-BR&with_genres=10751")
		.done(function(res){
			mountListSlider(res.results, "#slider-family");
		});

	$("#play-featured, .movies-list__slider").click(function(event) {
		if ( $(this).data("id") ){
			var id = $(this).data("id");
			var type = $(this).data("type");
		} else {
			var id = $(event.target).closest("[data-id]").data("id");
			var type = $(event.target).closest("[data-type]").data("type");
		}

		if(id){
			$("#modal").fadeIn();
		
			var getMovie = API + type + "/" + id + "?api_key=" + KEY + "&language=pt-BR";

			$.ajax(getMovie).done(function(res) {
			mountModal(res);
			});

			var getVideos = API + type + "/" + id + "/videos?api_key=" + KEY + "&language=pt-BR";

			$.ajax(getVideos).done(function(res){
				console.log(res);
				if(res.results.lenght){
					var idVideo = res.results[0].key
					var urlVideo = "https://www.youtube.com/embed/" + idVideo;
					var iframeVideo = '<iframe src="'+urlVideo+'" width="'+window.innerWidth+'" height="'+window.innerHeight+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'

					$("#video").html(iframeVideo);
				} else{
					$("#video").html("<h3>Video Indisponível :/</h3>");
				}
			})
		}
	});

	$("#modal .modal-close").click(function() {
		$("#modal").fadeOut();
	});

	$("#modal .modal-poster").click(function(){
		$("#player").fadeIn()
	});

	$("#player .player-close").click(function() {
		$("#player").fadeOut();
	});


	$(window).on("resize", function(){
		resizeVideo()
	});

	function resizeVideo(){
		$("#player iframe").attr("width", window.innerWidth).attr("height", window.innerHeight)
	}

	function mountMainMovie(movie) {
		$("#main-backdrop").css("background-image", "url('"+ BACKDROP + movie.backdrop_path +"')");
		$("#main-title").html(movie.title);
		$("#main-vote").html(movie.vote_average);
		$("#play-featured").attr("data-id", movie.id).attr("data-type", "movie");
	}

	function mountPoster(image, title, vote, id, type) {
		var movieItem = '<div class="movies-list__item" data-id="'+ id +'" data-type="'+ type +'">';
			movieItem += '<img src="'+image+'">';
			movieItem += '<div class="movies-list__action">';
			movieItem += '<i class="far fa-play-circle"></i>';
			movieItem += '<h3>'+title+'</h3>';
			movieItem += '<div class="rating">';
			movieItem += '<div class="rating__score">'+vote+'</div>';
			movieItem += '</div></div></div>';
		
		return movieItem;
	}

	function mountListSlider(list, element) {
		list.forEach(function(movie){
			var id = movie.id;
			var image = POSTER + movie.poster_path;
			var title;
			var type;
			if (movie.title) {
				title = movie.title;
				type ="movie";
			} else {
				title = movie.name;
				type = "tv";
			}
			var vote = movie.vote_average;

			$(element).slick("slickAdd", mountPoster(image, title, vote, id, type));
		});
	}

	function mountModal(res) {
		var poster = MODAL_POSTER + res.poster_path;
		if(res.title){
			var title = res.title;
			var duration = res.runtime;
			var originalTitle = res.original_title;
		} else{
			var title = res.name;
			var duration = res.episode_run_time;
			var originalTitle = res.original_name;
		}
		var description = res.overview;
		var vote = res.vote_average;
		var site = res.homepage;

		$("#modal .modal-poster img").attr("src", poster);
		$("#modal .modal-title").text(title);
		$("#modal .modal-original-title").text(originalTitle);
		$("#modal .modal-description").text(description);
		$("#modal .rating__score").text(vote);
		$("#modal .modal-duration").html('<i class="far fa-clock"></i> ' + duration + 'min');
		$("#modal .modal-link").attr("href", site).text(site);
	}

	$(document).ajaxComplete(function(){
		setTimeout(function(){
			$("#loading").fadeOut();
		}, 500);
	});

	$(document).ajaxStart(function(){
		$("#loading").fadeIn();
	});
});