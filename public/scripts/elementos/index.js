/* global Nando */

(function() 
{
	const UNIDAD_ESPACIADO_CSS = 32;
	const CALIFICACION_DEFAULT = 0;

	let elementos = {};

    Nando.Elementos = 
	{
        /**
         * Tomamos un selector y almacenamos el elemento del DOM para tener un cache y no perder tiempo
         * haciendo query al DOM
         * @param   {string}              selector Un selector de CSS
         * @returns {Promise<DOMElement>} Devuelve una promesa con el elemento solicitado
         */
        dame( selector ) 
		{
			Nando.assertTypesOf( 'string', selector );

            return new Promise( function( res ) 
			{
                if ( !elementos[ selector ]) 
                    elementos[ selector ] = document.querySelector( selector );
     
	            res( elementos[ selector ]);
            });
        },

        /**
         * Buscamos el elemento por el ID y lo guardamos en cache para futura referencia
         * @param   {string}   id
         * @returns {promise<DOMElement>}	Devuelve una promesa con el elemento solicitado
         */
        damePorId( id ) 
		{
			Nando.assertTypesOf( 'string', id );

            return new Promise( function( res ) 
			{
                if ( !elementos[ id ]) 
                    elementos[ id ] = document.getElementById( id );
     
	            res( elementos[ id ]);
            });
        },

		/**
		 * Crea las opciones para un elemento del DOM del tipo DataList
		 * @author Nando
		 * @param   {promise<DOMElement>} promesaElemento El elemento al que le vamos a crear las opciones
		 * @param   {Set}               valoresLista    Contiene todos los nombres de las categorias
		 * @returns {undefined}           No retornamos nada
		 */
		creaOptionsPara( promesaElemento, valoresLista ) 
		{
			Nando.assertPromesa( promesaElemento );
			Nando.assertTypesOf( 'object', valoresLista );

			promesaElemento.then( function( $elemento ) 
			{
				valoresLista.forEach( function( categoria ) 
				{
					let opt         = document.createElement( 'option' );
					opt.textContent = categoria;

					$elemento.appendChild( opt );
				});
			});
		},

		/**
		 * Crea lalista de libros que el usuario ve para poder comenzar a leer
		 * Los pasa al modulo DOM quien los va adicionando con cada requestAnimationFrame
		 * @author Nando
		 * @param  {Array}               lista           La lista con las categorias y libros
		 * @param  {Promise<DOMElement>} promesaElemento El elemento donde desplegaremos la lista de links
		 * @return {promise<undefined>}  No devolvemos nada en la promesa
		 */
		creaListaLibros( lista, promesaElemento ) 
		{
			console.assert( Array.isArray( lista ), 'Lista es un arreglo', lista);
			Nando.assertPromesa( promesaElemento );

			return Promise.all(
			[
				promesaElemento,
				Nando.Cargador.trae( 'DOM' )
			]).then( function([ $elemento, DOM ]) 
			{
                lista.forEach( function( categoria ) 
				{
					Nando.assertTypesOf( 'object', categoria );

					const [ nombreCategoria ] = Object.keys( categoria );
                    const $ul                 = document.createElement( 'ul' );
                    const $strong             = document.createElement( 'strong' );
                    $strong.textContent       = nombreCategoria;
					
					// A la categoria 'Sin leer' le adicionamos un link para recomendar
					// un libro al azar
					if ( nombreCategoria === 'Sin leer' ) 
					{
						let linkAzar         = document.createElement( 'a' );
						linkAzar.dataset.id  = 'azar';
						linkAzar.textContent = 'Recomiendame un libro al azar';
						linkAzar.href        = '';
						
						$strong.textContent += ' - ';
						
						$strong.appendChild( linkAzar );
					}

                    $ul.appendChild( $strong );

                    categoria[ nombreCategoria ].forEach( libro => 
					{
                        let $li = document.createElement( 'li' );

                        let $a          = document.createElement( 'a' );
                        $a.textContent  = libro.libro;
						$a.href         = libro.link;

                        $li.appendChild( $a );

						if (libro.calificacion)
						{
							let $p         = document.createElement( 'p' );
							$p.textContent = '★'.repeat( Number( libro.calificacion ));

							$li.appendChild( $p );
						}
						
						if (libro.notas)
						{
							let $p         = document.createElement( 'p' );
							$p.textContent = libro.notas;

							$li.appendChild( $p );
						}

                        $ul.appendChild( $li );
                    });

					DOM.adiciona( $elemento, 'appendChild', $ul );
                });
			});
		},

		/**
		 * Carga la ruta del libro en el Iframe de pdf.js
		 * @author Nando
		 * @param   {object}              detallesLibro   Los detalles del libro actual
		 * @param   {promise<DOMElement>} promesaElemento El iframe donde vamos a mostrar el pdf
		 *                                                @returns {object}              Nuevamente los detalles del libro por si se necesita despues
		 */
		muestraLibro( detallesLibro, promesaElemento ) 
		{
			Nando.assertTypesOf( 'object', detallesLibro );
			Nando.assertPromesa( promesaElemento );

			return promesaElemento.then( function( $iframe ) 
			{
				let pagina    = '';
				let categoria = '';

				if ( detallesLibro && detallesLibro.actual ) pagina = `page=${ detallesLibro.actual }&`;
				if ( detallesLibro && detallesLibro.categoria ) categoria = `${ detallesLibro.categoria }/`;
				
				$iframe.src = `/web/viewer.html?file=${ categoria }${ detallesLibro.nombre }#${ pagina }zoom=page-width`;

				return detallesLibro;
			});
		},


		/**
		 * Obtiene la pagina en la que quedo el usuario, limpia el visor de pdfs y devuelve la pagina obtenida
		 * @author Nando
		 * @param   {promise<DOMElement>} promesaIframe El iframe donde esta el libro
		 * @param	{generator}			  generator
		 * @returns {promise<String>}     La pagina en la que quedo
		 */
		limpiaPdfjs( promesaIframe, generator ) 
		{
			Nando.assertPromesa( promesaIframe );
			Nando.assertGenerator( generator );

			return promesaIframe.then( function( $iframe ) 
			{
				let paginaActual = $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value;
				Nando.assertTypesOf( 'string', paginaActual );

				$iframe.src  = '';

				return paginaActual;
			})
			.then( paginaActual =>
			{
				if (generator) generator.next( paginaActual );
				return paginaActual;
			});
		},

		/**
		 * Obtine la informacion del iframe donde esta el pdf de pdfjs
		 * @author Nando
		 * @param   {promise<DOElement>} promesaIframe Debe ser un iframe de pdfjs
		 * @param	{generator}			 generator
		 * @returns {object}             La informacion de la pagina actual en el pdf y el total de paginas
		 */
		infoPaginasPdf( promesaIframe, generator ) 
		{
			Nando.assertPromesa( promesaIframe );
			Nando.assertGenerator( generator );

			return promesaIframe.then( function( $iframe ) 
			{
				let totalPaginas = $iframe.contentWindow.window.document.getElementById( 'numPages' ).textContent;
				Nando.assertTypesOf( 'string', totalPaginas );

				let returnObject =
				{
					actual : $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value,
					paginas: totalPaginas.replace( 'of ', '' ),
				};

				return returnObject; 
			}).then( returnObject =>
			{
				if (generator) generator.next(returnObject);

				return returnObject;
			});
		},

		/**
		 * Adiciona el libro a la lista suministrada en [categoria]
		 * @author Nando
		 * @param   {string}              categoria         El nombre de la vategoria a la cual se le va a adicionar el link
		 * @param   {object}              detalleLibro
		 * @param   {promise<DOMElement>} promesaContenedor El contenedor donde se encuentra la lista a buscar
		 * @returns {promise}			  Regresa una promesa para continuar la cadena
		 */
		adicionaALa( categoria, detalleLibro, promesaContenedor ) 
		{
			Nando.assertTypesOf( 'string', categoria );
			Nando.assertTypesOf( 'object', detalleLibro );
			Nando.assertPromesa( promesaContenedor );

			return promesaContenedor.then( $contenedor => 
			{
				let [ $ul ] = _buscaYFiltra( $contenedor, 'ul', categoria );

				return [ $ul, $contenedor ];
			}).then(([ $ul, $contenedor ]) => 
			{
				// Si no existe la categoria en la lista, la crea
				if ( !$ul ) 
				{
					let $strong = document.createElement( 'strong');
					
					/* eslint no-param-reassign: "off" */
					$ul                 = document.createElement( 'ul');
					$strong.textContent = categoria;
					
					$ul.appendChild( $strong );
					$contenedor.appendChild( $ul );
				}

				return Promise.all(
				[
					$ul,
					Nando.Cargador.trae( 'DOM' ),
				]);
			})
			.then(([ $ul, DOM ]) => 
			{
				let $li = document.createElement( 'li' );
				let $a  = document.createElement( 'a' );

				$a.href        = detalleLibro.categoria ? `${ detalleLibro.categoria }/${ detalleLibro.nombre }` : detalleLibro.nombre;
				$a.textContent = detalleLibro.nombre;

				$li.appendChild( $a );

				if (detalleLibro.calificacion)
				{
					let $p         = document.createElement( 'p' );
					$p.textContent = '★'.repeat( Number( detalleLibro.calificacion ));

					$li.appendChild( $p );
				}

				DOM.adiciona( $ul, 'appendChild', $li );
			});
		},

		/**
		 * Busca el link de la categoria suministrada y lo elimina si lo encuentra
		 * @author Nando
		 * @param   {string}              categoria         El nombre de la categoria
		 * @param   {object}              detalleLibro
		 * @param   {promise<DOMElement>} promesaContenedor
		 * @returns {promise}             No regresamos nada util en la promesa
		 */
		eliminaDeLa( categoria, detalleLibro, promesaContenedor ) 
		{
			Nando.assertTypesOf( 'string', categoria );
			Nando.assertTypesOf( 'object', detalleLibro );
			Nando.assertPromesa( promesaContenedor );

			return promesaContenedor.then( $contenedor => 
			{
				let [ $ulCategoria ] = _buscaYFiltra( $contenedor, 'ul', categoria );

				if ( !$ulCategoria ) return Promise.reject( 'No encontre el <UL> solicitado' );

				let [ $li ] = _buscaYFiltra( $ulCategoria, 'li', detalleLibro.nombre );

				if ( !$li ) return Promise.reject( 'No encontre el libro solicitado' );
				
				return Promise.all(
				[
					$ulCategoria,
					$li,
					Nando.Cargador.trae( 'DOM' ),
				]).then(([ $ul, $nli, DOM ]) => DOM.adiciona( $ul, 'removeChild', $nli ));
			});
		},
		
		/**
		 * Cambia de categoria un ebook  en la lista de libros
		 * @param	{String}				antiguaCategoria	El nombre de la categoria a eliminar
		 * @param	{object}				detalleLibro		El [[detalleLibro]] contiene la nueva categoria
		 * @param	{promise<DOMElement>}	promesaContenedor	Resuelve al objeto que contiene los links
		 * @returns	{Promise}				promesa
		 */
		cambiaCategoria( antiguaCategoria, detalleLibro, promesaContenedor ) 
		{
			antiguaCategoria && Nando.assertTypesOf( 'string', antiguaCategoria );
			Nando.assertTypesOf( 'object', detalleLibro );
			Nando.assertPromesa( promesaContenedor );

			return this.adicionaALa( detalleLibro.categoria, detalleLibro, promesaContenedor )
				.then(() => 
				{
					this.eliminaDeLa( antiguaCategoria || 'Sin leer - Recomiendame un libro al azar', detalleLibro, promesaContenedor );
				});
		},
		
		/**
		 * Buscamos todos los elementos que contengan el texto suministrado como filtro
		 * y es lo que devolvemos
		 * @param	{String}	texto
		 * @param	{String}	tag
		 * @param	{Promise}	promesaContenedor	
		 * @returns	{Object}	DOMElement si encuentra algo
		 */
		buscaConTextContent( texto, tag, promesaContenedor ) 
		{
			Nando.assertTypesOf( 'string', texto );
			Nando.assertTypesOf( 'string', tag );
			Nando.assertPromesa( promesaContenedor );

			return promesaContenedor.then( $contenedor => 
				_buscaYFiltra( $contenedor, tag, texto )
			);
		},
		
		/**
		 * Mueve el link encontrado a la vista del usuario para que lo pueda escoger
		 * Adiciona un color amarillo a la seleccion para que el usuario lo pueda distinguir
		 * @param	{DOMElement}	$elemento
		 */
		scrollTo( $elemento ) 
		{
			if ( !$elemento ) return;
			
			try 
			{
				$elemento.scrollIntoView(
				{
					behavior: 'smooth',
					block:     'start',
				});
			}
			catch (e) 
			{
				$elemento.scrollIntoView( true );
			}
			
			$elemento.style.color = 'yellow';
		},

		/**
		 * Escribe la calificacion suministrada al boton encontrado
		 * @param	{String}		calificacion
		 * @param	{HTMLElement}	$elemento
		 * @param	{String}		nombreLibro
		 */
		califica( calificacion, $elemento, nombreLibro ) 
		{
			console.assert( calificacion === CALIFICACION_DEFAULT || Boolean(calificacion), 'Debe haber una calificacion para el libro' );
			console.assert( $elemento instanceof HTMLElement, 'El elemento debe ser un objeto del DOM', $elemento );
			Nando.assertTypesOf( 'string', nombreLibro );

			let $span = $elemento.querySelector( 'span' );
			console.assert( Boolean($span), 'Debe existir el span a cambiar', $span );

			$span.textContent = calificacion;

			let items = Array.from( document.querySelectorAll( `a[href$="${ nombreLibro }"]` ));

			for (let item of items )
			{
				let $p = item.parentNode.querySelector( 'p' );

				if ($p && $p.textContent.startsWith( '★' ) )
					$p.textContent = '★'.repeat( calificacion );

				else if (!$p && calificacion)
				{
					$p             = document.createElement( 'p' );
					$p.textContent = '★'.repeat( calificacion );

					item.parentNode.appendChild( $p );
				}
			}
		},

		/**
		 * Actualiza los comentarios en la lista de libros	
		 * @param	{String}		nota
		 * @param	{HTMLElement}	$elemento
		 * @param	{String}		nombreLibro
		 */
		comenta( nota = '', $elemento, nombreLibro ) 
		{
			console.assert( typeof nota === 'string', 'La nota debe ser un string', nota );
			console.assert( $elemento instanceof HTMLElement, 'El elemento debe ser un objeto del DOM', $elemento );
			console.assert( typeof nombreLibro === 'string', 'Debe venir el nombre del libro', nombreLibro);

			this.damePorId( 'Notes' )
				.then($txtarea =>
				{
					// Si son iguales es porque el llamado viene de escribir un nuevo comentario 
					// Si no son iguales es porque el llamado viene del inicio de la aplicacion
					if ($txtarea.value.trim() === nota)
					{
						let items = Array.from( document.querySelectorAll( `a[href$="${ nombreLibro }"]` ));

						for (let item of items )
						{
							let $p = Array.from( item.parentNode.querySelectorAll( 'p' ));
							let p  = $p.find(pa => pa.textContent.startsWith( '★' ) === false);

							if (p)
								p.textContent = nota;

							else if (nota)
							{
								$p = document.createElement( 'p' );
								$p.textContent = nota;

								item.parentNode.appendChild( $p );
							} 
						}
					}
					else $txtarea.value = nota;
				});

		},

		/**
		 * Se encarga de ubicar el elemento en un multiplo de [[UNIDAD_ESPACIADO_CSS]] en pixeles
		 * Lastimosamente no hay un Math.floor en CSS
		 * @param	{String}		direcciones	horizontal | vertical
		 * @param	{DOMElement}	$elemento	El elemento a ubicar
		 */
		posicionAlCien( direcciones, $elemento ) 
		{
			console.assert( Array.isArray( direcciones ), 'Direcciones debe ser un arreglo', direcciones );
			console.assert( $elemento instanceof HTMLElement, 'El elemento debe ser un objeto del DOM', $elemento );

			let tamano = $elemento.getBoundingClientRect();

			for (let direccion of direcciones)
			{
				let propiedad = tamano[ direccion ];

				if (direccion === 'width'  && window.innerWidth  < tamano[ direccion ]) propiedad = window.innerWidth;
				if (direccion === 'height' && window.innerHeight < tamano[ direccion ]) propiedad = window.innerHeight;

				let correcion = Math.floor( propiedad / UNIDAD_ESPACIADO_CSS ) * UNIDAD_ESPACIADO_CSS;

				$elemento.style[ direccion ] = correcion + 'px';
			}
		},

		/**
		 * Abre el cuadro para poder seleccionar el o los pdfs a subir al servidor
		 */
		abreImporttadorEbooks()
		{
			this.damePorId( 'ImportEbookInput' )
				.then( $importador => $importador.click());
		},

		/**
		 * Muestra en el boton de subir ebooks el numero de ebooks que aun hace falta por subir
		 * al servidor
		 * @param	{promise}	promesaElemento
		 * @param	{number}	numeroEbooks
		 */
		muestraNumeroEbooksSubiendo( promesaElemento, numeroEbooks, { quitar } = {})
		{
			Nando.assertPromesa( promesaElemento );
			console.assert( typeof numeroEbooks === 'number', 'Esperamos un numero', numeroEbooks);
			
			if (quitar)
			{
				promesaElemento.then( $elemento =>
				{
					$elemento.dataset.ebooks = null;
					$elemento.classList.remove( 'subiendo' );
				});
			}
			else
			{
				promesaElemento.then( $elemento =>
				{
					$elemento.dataset.ebooks = numeroEbooks;
					$elemento.classList.add( 'subiendo' );
				});
			}
		},
    };
	
	/**
	 * En un contenedor DOM buscamos todos los [[tag]] que hayan y filtramos por [[filtro]]
	 * @private
	 * @author Nando
	 * @param   {object} $contenedor DOMElement
	 * @param   {string} tag         El tag por el que vamos a filtrar
	 * @param   {string} filtro      Lo que debe contener el primer hijo en su textContent
	 * @returns {Array}				 Array
	 */
	function _buscaYFiltra( $contenedor, tag, filtro ) 
	{
		console.assert( $contenedor instanceof HTMLElement, 'El elemento debe ser un objeto del DOM', $contenedor );
		Nando.assertTypesOf( 'string', tag );
		Nando.assertTypesOf( 'string', filtro );

		let encontrados      = $contenedor.querySelectorAll( tag );
		let encontradosArray = Array.from( encontrados );
		let filtrado         = encontradosArray.filter( $elemento => $elemento.firstChild.textContent === filtro );

		return filtrado;
	}
})();
