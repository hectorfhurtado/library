/* global Nando */

(function() 
{
	// La lista de libros que tiene el usuario
	let _lista = null;

	Nando.Libro = 
	{
		inicia() 
		{
			this.detalleLibro = null;
		},

		get detalleLibro() 
		{
            const libroString = sessionStorage.getItem( 'infoLibro' );

            return libroString ? JSON.parse( libroString ) : null;
		},

		set detalleLibro( info ) 
		{
			console.assert( Boolean(info) || info === null, 'Info debe contener informacion', info );
			if (info) console.assert( typeof info == 'object', 'Info debe ser un objeto', info );

			sessionStorage.setItem( 'infoLibro', JSON.stringify( info ));
		},

        guarda( lista ) 
		{
            _lista = lista;

            return this;
        },

		/**
		 * Extrae las categorias de la lista de libros que le pasaron
		 * @returns {array}     La lista de categorias
		 */
		get categorias() 
		{
			if ( !_lista ) return null;

			return Object.keys( _lista );
		},

		/**
		 * Arma un mapa de las categorias con los libros y sus paths en la carpeta de libros del usuario
		 * @return {Array} Devuelve las categorias que a su vez contienen arrays de objetos
		 */
		get categoriasConLibros() 
		{
			if ( !_lista ) return null;

			return this.categorias.map( function( categoria ) 
			{
				let grupo = {};

				grupo[ categoria ] = _lista[ categoria ].map( _armaPropiedades.bind( this, categoria ));
				return grupo;
		
			}.bind( this ));
		},

		/**
		 * Extrae los detalles del libro seleccionado por el usuario en caso de que haya informacion
		 * @author Nando
		 * @param   {object} infoLibroDeServidor Detalles del libro
		 * @param   {string} pathname            El path que tiene el link para extraer el nombre del libro
		 * @returns {object} El mismo objeto que entro mas el nombre del libro
		 */
		extraeDetallesDe( infoLibroDeServidor, pathname ) 
		{
			Nando.assertTypesOf( 'object', infoLibroDeServidor );
			Nando.assertTypesOf( 'string', pathname );
			console.assert( /^\//.test( pathname ), pathname );

			let valoresPorDefecto =
			{
				paginas     : 0,
				actual      : 1,
				calificacion: 0,
				notas       : '',
				categoria   : '',
				leyendo     : false,
			};

			let infoLibro = Object.assign({}, valoresPorDefecto, infoLibroDeServidor);

			if ( infoLibro.categoria ) 
			{
				infoLibro.nombre = pathname.replace( '/' + infoLibro.categoria + '/', '' );
			}
			else 
			{
				let split     = pathname.split('/');
				let categoria = null;
				let nombre    = null;
				
				/* eslint no-magic-numbers: "off" */
				if ( split.length > 2 ) [ , categoria, nombre ] = split; 
				else                    [ , nombre ]            = split;
				
				infoLibro.nombre    = nombre;
				infoLibro.categoria = categoria;
			}

			this.detalleLibro = infoLibro;

			return infoLibro;
		},

		/**
		 * Asigna los campos para que al libro se le pueda hacer seguimiento como leyendo
		 * @author Nando
		 * @param   {object}         infoPaginas Con tiene el total de paginas y la pagina en la que esta el usuario
		 * @returns {object|promise} Si todo sale bien retorna el objeto con los campos del libro, sino, un rechazo
		 */
		adiciona( infoPaginas )
		{
			Nando.assertTypesOf( 'object', infoPaginas );

			let detalles = this.detalleLibro;

			if ( !detalles ) return Promise.reject( 'No hay informacion del nombre del libro' );

			detalles.actual  = infoPaginas.actual || 1;
			detalles.leyendo = true;

			// Asignamos valores por defecto si no los tiene
			Object.assign( detalles,  
			{
				paginas     : infoPaginas.paginas || 0,
			});

			this.detalleLibro = detalles;

			return detalles;
		},

		/**
		 * Actualiza los atributos del libro para iniciar la proxima vez
		 * @author Nando
		 * @returns {object} Los detalles del libro
		 */
		termina() 
		{
			let detalles = this.detalleLibro;

			Nando.assertTypesOf( 'object', detalles );

			detalles.actual  = 1;
			detalles.leyendo = false;

			this.detalleLibro = detalles;

			return detalles;
		},
		
		/**
		 * Actualiza la categoria en la informacion del libro
		 * @param	{String}			categoria	El nombre de la nueva categoria
		 * @return  {promise<Object>}	Una promesa
		 */
		actualiza( categoria ) 
		{
			if ( !categoria ) return Promise.resolve( null );
			
			let detalles = this.detalleLibro;
			Nando.assertTypesOf( 'object', detalles );

			detalles.categoria = categoria;
			this.detalleLibro  = detalles;
			
			return detalles;
		},
		
		get ebooks() 
		{
			if ( !_lista ) return null;
			
			let ebooks = [];
			
			this.categorias.forEach( categoria => ebooks.push( ..._lista[ categoria ].map( libro => libro.nombre )));
			
			return new Set( ebooks );
		},
		
		/**
		 * Trae un libro al azar de la categoria suministrada
		 * @param	{string}	categoria	La categoria de la que queremos traer el libro
		 * @returns	{string}	Cualquier libro en la lista
		 */
		traeLibroAlAzarDe( categoria ) 
		{
			Nando.assertTypesOf( 'string', categoria );

			let ebooks       = _lista[ categoria ];
			/* eslint no-bitwise: "off", no-extra-parens: "off" */
			let numeroAlAzar = (Math.random() * ebooks.length) | 0;
			
			return ebooks[ numeroAlAzar ];
		},

		/**
		 * Actualiza el detalle del libro con la calificacion suministrada
		 * @param	{String}	calificacion
		 * @returns	{stringify}	detalle del libro
		 */
		calificaCon( calificacion ) 
		{
			console.assert( Boolean(calificacion) && /\d+/.test( calificacion ), calificacion );

			let detalleLibro = this.detalleLibro;
			Nando.assertTypesOf( 'object', detalleLibro );

			detalleLibro.calificacion = Number(calificacion);
			this.detalleLibro         = detalleLibro;

			return detalleLibro;
		},

		/**
		 * Adiciona un comentario al libro que estamos leyendo
		 * @param	{string}	comentario
		 */
		agregaComentario( comentario )
		{
			Nando.assertTypesOf( 'string', comentario );

			let detalles      = this.detalleLibro;
			Nando.assertTypesOf( 'object', detalles );

			detalles.notas    = comentario;
			this.detalleLibro = detalles;
		}
	};
	
	/**
	 * Crea las categorias para armar los links que se muestran al ususario
	 * @private
	 * @author Nando
	 * @param   {string} categoria 	La categoria del libro
	 * @param   {object} objeto     El objeto con la informacion del back end
	 * @returns {Array}  			Con las propiedades libro y link
	 */
	function _armaPropiedades( categoria, objeto ) 
	{
		Nando.assertTypesOf( 'string', categoria );
		Nando.assertTypesOf( 'object', objeto );

		// Para 'Sin leer'
		let propiedades = 
		{
			libro: objeto.nombre,
			link : objeto.nombre,
		};

		switch ( categoria ) 
		{
			case 'Leyendo':

				if ( /\//.test( objeto.nombre )) 
				{
					propiedades.libro = objeto.nombre.split( '/' )[ 1 ];
				}
				break;

			case 'Sin leer':
				// NOOP
				break;

			default:
				propiedades.link = `${ categoria }/${ objeto.nombre }`;
				break;
		}

		if (objeto.calificacion) propiedades.calificacion = objeto.calificacion;
		if (objeto.notas)        propiedades.notas        = objeto.notas;

		return propiedades;
	}
})();
