/* global Nando */

(function() {

	Nando.Arquitecto = {

		inicia() {

			this.iniciaLibro()
				.then( this.pideLista )
				.then( this.pideCategorias )
                .then( this.adicionaCategoriasADatalistDeCategorias )
				.then( this.muestraLibros )
				.then( categorias => console.log( categorias ))

		},

		pideLista() {

			return Nando.Cargador
				.trae( 'Red', 'red/index' )
				.then( R => R.traeJson( 'lista' ))
				.catch( error => console.error( error ))
		},

		pideCategorias( lista ) {

			return Nando.Libro.guarda( lista ).categorias
		},

		iniciaLibro() {

			return Nando.Cargador
				.trae( 'Libro', 'libro/index' )
				.then( L => L.inicia())
		},

        adicionaCategoriasADatalistDeCategorias( categorias ) {
			const categoriasFiltradas = categorias.filter( categoria => /Leyendo|Sin leer/.test( categoria ) === false )

			return Nando.Cargador
				.trae( 'Elementos', 'elementos/index' )
			    .then( E => E.creaOptionsPara( E.damePorId( 'CategoriaEbookList' ), categoriasFiltradas ))
				.catch( error => console.log( error ))
		},

		muestraLibros() {
			return Promise.resolve( Nando.Libro.categoriasConLibros )
				.then( categorias => Nando.Elementos.creaListaLibros( categorias, Nando.Elementos.dame( 'section' )))
		},
	}
})()
