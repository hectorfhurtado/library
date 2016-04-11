/* global Nando */

( function() {

    Nando.Elementos = {

        elementos: {},

        /**
         * Tomamos un selector y almacenamos el elemento del DOM para tener un cache y no perder tiempo
         * haciendo query al DOM
         * @param   {string}              selector Un selector de CSS
         * @returns {Promise<DOMElement>}
         */
        dame( selector ) {

            return new Promise( function( res ) {

                if ( !this.elementos[ selector ]) {
                    this.elementos[ selector ] = document.querySelector( selector )
                }
                res( this.elementos[ selector ])
            }.bind( this ))
        },

        /**
         * Buscamos el elemento por el ID y lo guardamos en cache para futura referencia
         * @param   {string}   id
         * @returns {promise<DOMElement>}
         */
        damePorId( id ) {

            return new Promise( function( res ) {

                if ( !this.elementos[ id ]) {
                    this.elementos[ id ] = document.getElementById( id )
                }
                res( this.elementos[ id ])
            }.bind( this ))
        },

		/**
		 * Crea las opciones para un elemento del DOM del tipo DataList
		 * @author Nando
		 * @param   {promise<DOMElement>} promesaElemento El elemento al que le vamos a crear las opciones
		 * @param   {Array}               valoresLista    Contiene todos los nombres de las categorias
		 * @returns {undefined}           No retornamos nada
		 */
		creaOptionsPara( promesaElemento, valoresLista  ) {

			promesaElemento.then( function( $elemento ) {

				valoresLista.forEach( function( categoria ) {
					let opt         = document.createElement( 'option' )
					opt.textContent = categoria

					$elemento.appendChild( opt )
				})
			}.bind( this ))
		},

		/**
		 * Crea lalista de libros que el usuario ve para poder comenzar a leer
		 * Los pasa al modulo DOM quien los va adicionando con cada requestAnimationFrame
		 * @author Nando
		 * @param  {Array}               lista           La lista con las categorias y libros
		 * @param  {Promise<DOMElement>} promesaElemento El elemento donde desplegaremos la lista de links
		 * @return {promise<undefined>}  No devolvemos nada en la promesa
		 */
		creaListaLibros( lista, promesaElemento ) {

			return Promise.all([
				promesaElemento,
				Nando.Cargador.trae( 'DOM', 'elementos/DOM')
			]).then( function([ $elemento, DOM ]) {

                lista.forEach( function( categoria ) {
					const [ nombreCategoria ] = Object.keys( categoria )
                    const $ul                 = document.createElement( 'ul' )
                    const $strong             = document.createElement( 'strong' )
                    $strong.textContent       = nombreCategoria

                    $ul.appendChild( $strong )

                    categoria[ nombreCategoria ].forEach( function( libro ) {
                        let $li = document.createElement( 'li' )

                        let $a = document.createElement( 'a' )
                        $a.textContent  = libro.libro
						$a.href         = libro.link

                        $li.appendChild( $a)
                        $ul.appendChild( $li )
                    })
					DOM.adiciona( $elemento, 'appendChild', $ul )
                })
			})
		},
    }
})()
