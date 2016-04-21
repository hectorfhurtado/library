/* global Nando */

( function() {
	
	let elementos = {}

    Nando.Elementos = {

        /**
         * Tomamos un selector y almacenamos el elemento del DOM para tener un cache y no perder tiempo
         * haciendo query al DOM
         * @param   {string}              selector Un selector de CSS
         * @returns {Promise<DOMElement>}
         */
        dame( selector ) {

            return new Promise( function( res ) {

                if ( !elementos[ selector ]) {
                    elementos[ selector ] = document.querySelector( selector )
                }
                res( elementos[ selector ])
            }.bind( this ))
        },

        /**
         * Buscamos el elemento por el ID y lo guardamos en cache para futura referencia
         * @param   {string}   id
         * @returns {promise<DOMElement>}
         */
        damePorId( id ) {

            return new Promise( function( res ) {

                if ( !elementos[ id ]) {
                    elementos[ id ] = document.getElementById( id )
                }
                res( elementos[ id ])
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
				Nando.Cargador.trae( 'DOM' )
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

                        $li.appendChild( $a )
                        $ul.appendChild( $li )
                    })
					DOM.adiciona( $elemento, 'appendChild', $ul )
                })
			})
		},

		/**
		 * Carga la ruta del libro en el Iframe de pdf.js
		 * @author Nando
		 * @param   {object}              detallesLibro   Los detalles del libro actual
		 * @param   {promise<DOMElement>} promesaElemento El iframe donde vamos a mostrar el pdf
		 *                                                @returns {object}              Nuevamente los detalles del libro por si se necesita despues
		 */
		muestraLibro( detallesLibro, promesaElemento ) {

			return promesaElemento.then( function( $iframe ) {
				let pagina    = ''
				let categoria = ''

				if ( detallesLibro && detallesLibro.actual ) pagina = `page=${ detallesLibro.actual }&`
				if ( detallesLibro && detallesLibro.categoria ) categoria = `${ detallesLibro.categoria }/`
				
				$iframe.src = `/web/viewer.html?file=${ categoria }${ detallesLibro.nombre }#${ pagina }zoom=page-width`

				return detallesLibro
			})
		},


		/**
		 * Obtiene la pagina en la que quedo el usuario, limpia el visor de pdfs y devuelve la pagina obtenida
		 * @author Nando
		 * @param   {promise<DOMElement>} promesaIframe El iframe donde esta el libro
		 * @returns {promise<String>}     La pagina en la que quedo
		 */
		limpiaPdfjs( promesaIframe ) {

			return promesaIframe.then( function( $iframe ) {
				let paginaActual = $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value

				$iframe.src  = ''

				return paginaActual
			})
		},

		/**
		 * Obtine la informacion del iframe donde esta el pdf de pdfjs
		 * @author Nando
		 * @param   {promise<DOElement>} promesaIframe Debe ser un iframe de pdfjs
		 * @returns {object}             La informacion de la pagina actual en el pdf y el total de paginas
		 */
		infoPaginasPdf( promesaIframe ) {

			return promesaIframe.then( function( $iframe ) {
				let totalPaginas  = $iframe.contentWindow.window.document.getElementById( 'numPages' ).textContent

				return {
					actual : $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value,
					paginas: totalPaginas.replace( 'of ', '' ),
				}
			})
		},

		/**
		 * Adiciona el libro a la lista suministrada en [categoria]
		 * @author Nando
		 * @param   {string}              categoria         El nombre de la vategoria a la cual se le va a adicionar el link
		 * @param   {object}              detalleLibro
		 * @param   {promise<DOMElement>} promesaContenedor El contenedor donde se encuentra la lista a buscar
		 * @returns {promise}
		 */
		adicionaALa( categoria, detalleLibro, promesaContenedor ) {

			return promesaContenedor.then( $contenedor => {
				let [ $ul ] = _buscaYFiltra( $contenedor, 'ul', categoria )

				return [ $ul, $contenedor ]
			}).then(([ $ul, $contenedor ]) => {
				
				// Si no existe la categoria en la lista, la crea
				if ( !$ul ) {
					let $strong = document.createElement( 'strong')
					
					$ul                 = document.createElement( 'ul')
					$strong.textContent = categoria
					
					$ul.appendChild( $strong )
					$contenedor.appendChild( $ul )
				}

				return Promise.all([
					$ul,
					Nando.Cargador.trae( 'DOM' ),
				])
			}).then(([ $ul, DOM ]) => {
				let $li = document.createElement( 'li' )
				let $a  = document.createElement( 'a' )

				$a.href        = detalleLibro.categoria ? `${ detalleLibro.categoria }/${ detalleLibro.nombre }` : detalleLibro.nombre
				$a.textContent = detalleLibro.nombre

				$li.appendChild( $a )

				DOM.adiciona( $ul, 'appendChild', $li )
			})
		},

		/**
		 * Busca el link de la categoria suministrada y lo elimina si lo encuentra
		 * @author Nando
		 * @param   {string}              categoria         El nombre de la categoria
		 * @param   {object}              detalleLibro
		 * @param   {promise<DOMElement>} promesaContenedor
		 * @returns {promise}             No regresamos nada util en la promesa
		 */
		eliminaDeLa( categoria, detalleLibro, promesaContenedor ) {

			return promesaContenedor.then( $contenedor => {
				let [ $ulCategoria ] = _buscaYFiltra( $contenedor, 'ul', categoria )

				if ( !$ulCategoria ) return Promise.reject( 'No encontre el <UL> solicitado' )

				let [ $li ] = _buscaYFiltra( $ulCategoria, 'li', detalleLibro.nombre )

				if ( !$li ) return Promise.reject( 'No encontre el libro solicitado' )
				
				return Promise.all([
					$ulCategoria,
					$li,
					Nando.Cargador.trae( 'DOM' ),
				]).then(([ $ul, $li, DOM ]) => DOM.adiciona( $ul, 'removeChild', $li ))
			})
		},
		
		/**
		 * Cambia de categoria un ebook  en la lista de libros
		 * @param	{String}				antiguaCategoria	El nombre de la categoria a eliminar
		 * @param	{object}				detalleLibro		El [[detalleLibro]] contiene la nueva categoria
		 * @param	{promise<DOMElement>}	promesaContenedor	Resuelve al objeto que contiene los links
		 * @returns	{Promise}
		 */
		cambiaCategoria( antiguaCategoria, detalleLibro, promesaContenedor ) {
			
			return this.adicionaALa( detalleLibro.categoria, detalleLibro, promesaContenedor )
				.then( () => this.eliminaDeLa( antiguaCategoria || 'Sin leer', detalleLibro, promesaContenedor ))
		},
    }
	
	/**
	 * En un contenedor DOM buscamos todos los [[tag]] que hayan y filtramos por [[filtro]]
	 * @private
	 * @author Nando
	 * @param   {object} $contenedor DOMElement
	 * @param   {string} tag         El tag por el que vamos a filtrar
	 * @param   {string} filtro      Lo que debe contener el primer hijo en su textContent
	 * @returns {Array}
	 */
	function _buscaYFiltra( $contenedor, tag, filtro ) {
		return [ ...$contenedor.querySelectorAll( tag )].filter( $elemento => $elemento.firstChild.textContent == filtro )
	}
})()
